"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, FolderUp, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  bulkUploadEventPhotos,
  type BulkPhotoUploadResult,
} from "@/lib/actions/admin";
import { chunkFilesForUpload } from "@/lib/upload-batches";
import { cn } from "@/lib/utils";

type Props = {
  eventId: string;
  participantCount: number;
  disabled?: boolean;
  onMessage: (message: string | null) => void;
};

export function BulkPhotoUpload({
  eventId,
  participantCount,
  disabled = false,
  onMessage,
}: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState<BulkPhotoUploadResult | null>(null);

  function handleUpload(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.size > 0);
    if (list.length === 0) return;

    onMessage(null);
    setResult(null);

    const batches = chunkFilesForUpload(list);

    startTransition(async () => {
      const merged: BulkPhotoUploadResult = {
        success: true,
        uploaded: 0,
        assigned: [],
        skipped: [],
      };
      const assignedMap = new Map<number, BulkPhotoUploadResult["assigned"][0]>();

      for (let i = 0; i < batches.length; i++) {
        const fd = new FormData();
        fd.set("eventId", eventId);
        for (const file of batches[i]) fd.append("photos", file);

        const res = await bulkUploadEventPhotos(fd);
        if ("error" in res) {
          onMessage(
            merged.uploaded > 0
              ? `${merged.uploaded} Foto(s) zugeordnet, dann Fehler: ${res.error}`
              : res.error ?? "Upload fehlgeschlagen.",
          );
          if (merged.uploaded > 0) {
            setResult({
              ...merged,
              assigned: Array.from(assignedMap.values()).sort(
                (a, b) => a.participantNumber - b.participantNumber,
              ),
            });
            router.refresh();
          }
          return;
        }

        merged.uploaded += res.uploaded;
        merged.skipped.push(...res.skipped);
        for (const row of res.assigned) {
          const existing = assignedMap.get(row.participantNumber);
          if (existing) {
            existing.count += row.count;
          } else {
            assignedMap.set(row.participantNumber, { ...row });
          }
        }
      }

      merged.assigned = Array.from(assignedMap.values()).sort(
        (a, b) => a.participantNumber - b.participantNumber,
      );

      setResult(merged);
      router.refresh();

      if (merged.uploaded === 0) {
        onMessage("Keine Fotos zugeordnet – Dateinamen prüfen (z.B. 001_bild.jpg).");
        return;
      }

      const assignedSummary = merged.assigned
        .map(
          (a) =>
            `#${String(a.participantNumber).padStart(3, "0")} ${a.childName} (${a.count})`,
        )
        .join(", ");

      onMessage(
        `${merged.uploaded} Foto(s) zugeordnet${assignedSummary ? `: ${assignedSummary}` : ""}.`,
      );
    });
  }

  return (
    <div className="mt-4 rounded-xl border border-aqua-200 bg-gradient-to-br from-aqua-50/80 to-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-medium text-aqua-900">
            <FolderUp className="h-5 w-5" aria-hidden />
            Bulk-Upload (QR / Teilnehmer-Nr.)
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Alle Fotos auf einmal hochladen – Zuordnung automatisch über den Dateinamen.
          </p>
          <p className="mt-2 font-mono text-xs text-slate-500">
            001_max_mustermann_01.jpg · 002_lisa_03.jpg · QR_003_foto.jpg
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          disabled={disabled || pending || participantCount === 0}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="mr-1.5 h-4 w-4" aria-hidden />
          Dateien wählen
        </Button>
      </div>

      {participantCount === 0 && (
        <p className="mt-3 text-sm text-amber-700">
          Zuerst Teilnehmer anlegen, damit Fotos zugeordnet werden können.
        </p>
      )}

      <div
        className={cn(
          "mt-4 rounded-lg border-2 border-dashed p-8 text-center transition-colors",
          participantCount === 0 && "pointer-events-none opacity-50",
          dragOver
            ? "border-aqua-400 bg-aqua-50"
            : "border-aqua-200/80 bg-white/60",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (disabled || pending || participantCount === 0) return;
          if (e.dataTransfer.files.length) handleUpload(e.dataTransfer.files);
        }}
      >
        <FolderUp className="mx-auto h-10 w-10 text-aqua-400" aria-hidden />
        <p className="mt-2 text-sm font-medium text-aqua-900">
          Fotos hier ablegen oder „Dateien wählen“
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Prefix = Teilnehmer-Nr. aus QR-PDF (#001, #002, …)
        </p>
        {pending && (
          <p className="mt-3 flex items-center justify-center gap-2 text-sm text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            {result ? "Wird aktualisiert…" : "Wird zugeordnet und hochgeladen…"}
          </p>
        )}
      </div>

      {result && (
        <div className="mt-4 space-y-3 rounded-lg border border-slate-100 bg-white p-4 text-sm">
          {result.assigned.length > 0 && (
            <div>
              <p className="flex items-center gap-1.5 font-medium text-green-800">
                <CheckCircle2 className="h-4 w-4" aria-hidden />
                {result.uploaded} Foto(s) zugeordnet
              </p>
              <ul className="mt-2 space-y-1 text-slate-600">
                {result.assigned.map((row) => (
                  <li key={row.participantNumber}>
                    #{String(row.participantNumber).padStart(3, "0")} {row.childName}:{" "}
                    {row.count} Bild{row.count !== 1 ? "er" : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.skipped.length > 0 && (
            <div>
              <p className="flex items-center gap-1.5 font-medium text-amber-800">
                <AlertCircle className="h-4 w-4" aria-hidden />
                {result.skipped.length} übersprungen
              </p>
              <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs text-slate-600">
                {result.skipped.map((row) => (
                  <li key={`${row.filename}-${row.reason}`}>
                    <span className="font-mono">{row.filename}</span>
                    <span className="text-slate-400"> – </span>
                    {row.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        disabled={disabled || pending || participantCount === 0}
        onChange={(e) => {
          if (e.target.files?.length) handleUpload(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
