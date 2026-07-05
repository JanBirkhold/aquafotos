"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ImagePlus,
  Loader2,
  Pencil,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  deleteParticipantPhoto,
  renameParticipantPhoto,
  replaceParticipantPhoto,
  reorderParticipantPhotos,
} from "@/lib/actions/admin";
import { postParticipantPhotoUpload } from "@/lib/admin-photo-upload-client";
import { PhotoUploadReleaseOptions } from "@/components/admin/photo-upload-release-options";
import { useConfirm } from "@/components/ui/confirm-dialog";
import type { PhotoUploadReleaseMode } from "@/lib/photo-release";
import {
  photoProcessingStatusColors,
  photoProcessingStatusLabels,
} from "@/lib/photo-release";
import { chunkFilesForUpload } from "@/lib/upload-batches";
import { cn } from "@/lib/utils";

import type { PhotoProcessingStatus } from "@prisma/client";

export type ParticipantPhoto = {
  id: string;
  filename: string;
  storageKey: string;
  processingStatus?: PhotoProcessingStatus;
};

type Props = {
  eventId: string;
  participantId: string;
  participantName: string;
  participantNumber: number;
  photos: ParticipantPhoto[];
  disabled?: boolean;
  onMessage: (message: string | null) => void;
};

export function ParticipantPhotoManager({
  eventId,
  participantId,
  participantName,
  participantNumber,
  photos,
  disabled = false,
  onMessage,
}: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [localPhotos, setLocalPhotos] = useState(photos);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const { confirm, confirmDialog } = useConfirm();
  const [dragOver, setDragOver] = useState(false);
  const [releaseMode, setReleaseMode] = useState<PhotoUploadReleaseMode>("select_edit");
  const [notifyCustomer, setNotifyCustomer] = useState(true);

  useEffect(() => {
    setLocalPhotos(photos);
  }, [photos]);

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const syncPhotos = useCallback(
    (next: ParticipantPhoto[]) => {
      setLocalPhotos(next);
      refresh();
    },
    [refresh],
  );

  function handleUpload(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.size > 0);
    if (list.length === 0) return;

    onMessage(null);
    const batches = chunkFilesForUpload(list);

    startTransition(async () => {
      let uploaded = 0;
      const skipped: { filename: string; reason: string }[] = [];

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const fd = new FormData();
        fd.set("eventId", eventId);
        fd.set("participantId", participantId);
        fd.set("releaseMode", releaseMode);
        fd.set("notifyCustomer", notifyCustomer ? "true" : "false");
        for (const file of batch) fd.append("photos", file);

        const res = await postParticipantPhotoUpload(fd);
        if ("error" in res) {
          onMessage(
            uploaded > 0
              ? `${uploaded} Foto(s) hochgeladen, dann Fehler: ${res.error}`
              : res.error,
          );
          refresh();
          return;
        }
        uploaded += res.uploaded ?? 0;
        skipped.push(...res.skipped);
      }

      if (skipped.length > 0) {
        const skipHint = skipped
          .slice(0, 3)
          .map((s) => `${s.filename}: ${s.reason}`)
          .join("; ");
        onMessage(
          `${uploaded} Foto(s) für ${participantName} hochgeladen. Übersprungen: ${skipHint}${skipped.length > 3 ? " …" : ""}`,
        );
      } else {
        onMessage(`${uploaded} Foto(s) für ${participantName} hochgeladen.`);
      }
      refresh();
    });
  }

  async function handleDelete(photo: ParticipantPhoto) {
    const ok = await confirm({
      title: "Foto löschen?",
      description: `„${photo.filename}“ wird endgültig gelöscht. Dies kann nicht rückgängig gemacht werden.`,
      confirmLabel: "Löschen",
      variant: "destructive",
    });
    if (!ok) return;

    onMessage(null);
    startTransition(async () => {
      const res = await deleteParticipantPhoto(photo.id, eventId);
      if (res.error) {
        onMessage(res.error);
        return;
      }
      syncPhotos(localPhotos.filter((p) => p.id !== photo.id));
      onMessage(`Foto „${photo.filename}“ gelöscht.`);
    });
  }

  function startRename(photo: ParticipantPhoto) {
    setEditingId(photo.id);
    setEditName(photo.filename);
  }

  function cancelRename() {
    setEditingId(null);
    setEditName("");
  }

  function submitRename(photoId: string) {
    if (!editName.trim()) {
      cancelRename();
      return;
    }

    onMessage(null);
    startTransition(async () => {
      const res = await renameParticipantPhoto({
        photoId,
        eventId,
        filename: editName,
      });
      if (res.error) {
        onMessage(res.error);
        return;
      }
      cancelRename();
      onMessage("Dateiname aktualisiert.");
      refresh();
    });
  }

  function handleReplace(photoId: string, file: File) {
    onMessage(null);
    const fd = new FormData();
    fd.set("eventId", eventId);
    fd.set("photoId", photoId);
    fd.set("photo", file);

    startTransition(async () => {
      const res = await replaceParticipantPhoto(fd);
      setReplacingId(null);
      if (res.error) {
        onMessage(res.error);
        return;
      }
      onMessage("Foto ersetzt.");
      refresh();
    });
  }

  function movePhoto(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= localPhotos.length) return;

    const next = [...localPhotos];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    setLocalPhotos(next);

    startTransition(async () => {
      const res = await reorderParticipantPhotos(
        eventId,
        participantId,
        next.map((p) => p.id),
      );
      if (res.error) {
        setLocalPhotos(localPhotos);
        onMessage(res.error);
        return;
      }
      refresh();
    });
  }

  const numberPrefix = String(participantNumber).padStart(3, "0");

  return (
    <div className="mt-4 rounded-xl border border-dashed border-aqua-200 bg-aqua-50/20 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-aqua-900">
            Fotos für {participantName}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {localPhotos.length} Bild{localPhotos.length !== 1 ? "er" : ""} · Auto-Name:{" "}
            {numberPrefix}_originalname.jpg
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled || pending}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mr-1.5 h-3.5 w-3.5" aria-hidden />
          Hinzufügen
        </Button>
      </div>

      <PhotoUploadReleaseOptions
        className="mt-4"
        value={releaseMode}
        onChange={setReleaseMode}
        notifyCustomer={notifyCustomer}
        onNotifyChange={setNotifyCustomer}
      />

      <div
        className={cn(
          "mt-3 rounded-lg border-2 border-dashed p-4 text-center transition-colors",
          dragOver
            ? "border-aqua-400 bg-aqua-50"
            : "border-transparent bg-transparent",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (disabled || pending) return;
          if (e.dataTransfer.files.length) handleUpload(e.dataTransfer.files);
        }}
      >
        {localPhotos.length === 0 ? (
          <div className="py-4 text-sm text-slate-500">
            <ImagePlus className="mx-auto mb-2 h-8 w-8 text-aqua-300" aria-hidden />
            Noch keine Fotos – hier ablegen oder „Hinzufügen“ klicken
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {localPhotos.map((photo, index) => {
              const isEditing = editingId === photo.id;
              const isReplacing = replacingId === photo.id && pending;

              return (
                <li
                  key={photo.id}
                  className="overflow-hidden rounded-lg border bg-white shadow-sm"
                >
                  <div className="relative aspect-[3/4] bg-slate-100">
                    <Image
                      src={photo.storageKey}
                      alt={photo.filename}
                      fill
                      className="object-cover"
                      sizes="160px"
                      unoptimized
                    />
                    <div className="absolute left-1 top-1 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      {index + 1}
                    </div>
                    {photo.processingStatus && (
                      <span
                        className={cn(
                          "absolute right-1 top-1 max-w-[calc(100%-0.5rem)] truncate rounded-full px-1.5 py-0.5 text-[9px] font-medium shadow",
                          photoProcessingStatusColors[photo.processingStatus],
                        )}
                      >
                        {photoProcessingStatusLabels[photo.processingStatus]}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 p-2">
                    {isEditing ? (
                      <form
                        className="flex gap-1"
                        onSubmit={(e) => {
                          e.preventDefault();
                          submitRename(photo.id);
                        }}
                      >
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-8 text-xs"
                          aria-label="Neuer Dateiname"
                          disabled={pending}
                          autoFocus
                        />
                        <Button
                          type="submit"
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8 shrink-0"
                          disabled={pending}
                          aria-label="Speichern"
                        >
                          <Check className="h-3.5 w-3.5" aria-hidden />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 shrink-0"
                          disabled={pending}
                          aria-label="Abbrechen"
                          onClick={cancelRename}
                        >
                          <X className="h-3.5 w-3.5" aria-hidden />
                        </Button>
                      </form>
                    ) : (
                      <p
                        className="truncate text-xs text-slate-700"
                        title={photo.filename}
                      >
                        {photo.filename}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        disabled={disabled || pending || index === 0}
                        aria-label="Nach oben"
                        onClick={() => movePhoto(index, -1)}
                      >
                        <ArrowUp className="h-3 w-3" aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        disabled={
                          disabled || pending || index === localPhotos.length - 1
                        }
                        aria-label="Nach unten"
                        onClick={() => movePhoto(index, 1)}
                      >
                        <ArrowDown className="h-3 w-3" aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        disabled={disabled || pending || isEditing}
                        aria-label="Umbenennen"
                        onClick={() => startRename(photo)}
                      >
                        <Pencil className="h-3 w-3" aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        disabled={disabled || pending}
                        aria-label="Foto ersetzen"
                        onClick={() => {
                          setReplacingId(photo.id);
                          replaceInputRef.current?.click();
                        }}
                      >
                        {isReplacing ? (
                          <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                        ) : (
                          <RefreshCw className="h-3 w-3" aria-hidden />
                        )}
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="h-7 w-7 text-red-600 hover:bg-red-50 hover:text-red-700"
                        disabled={disabled || pending}
                        aria-label="Löschen"
                        onClick={() => handleDelete(photo)}
                      >
                        <Trash2 className="h-3 w-3" aria-hidden />
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {pending && (
          <p className="mt-2 flex items-center justify-center gap-1 text-xs text-slate-500">
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
            Wird verarbeitet…
          </p>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        disabled={disabled || pending}
        onChange={(e) => {
          if (e.target.files?.length) handleUpload(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        disabled={disabled || pending}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && replacingId) handleReplace(replacingId, file);
          e.target.value = "";
        }}
      />
      {confirmDialog}
    </div>
  );
}
