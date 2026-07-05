import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import {
  normalizeAssignedPhotoFilename,
  resolveUniqueFilename,
  sanitizePhotoFilename,
} from "@/lib/admin-photos";
import { prisma } from "@/lib/prisma";
import { sendPhotosReady } from "@/lib/email";
import {
  photoStatusForReleaseMode,
  type PhotoUploadReleaseMode,
} from "@/lib/photo-release";
import { buildPhotoFilename } from "@/lib/qr-utils";

const MAX_FILE_BYTES = 50 * 1024 * 1024;

type ParticipantPhotoTarget = {
  id: string;
  participantNumber: number;
  qrCode: string | null;
};

export type ParticipantUploadResult =
  | { success: true; uploaded: number; skipped: { filename: string; reason: string }[] }
  | { error: string };

export type BulkUploadResult = {
  success: true;
  uploaded: number;
  assigned: { participantNumber: number; childName: string; count: number }[];
  skipped: { filename: string; reason: string }[];
};

function validateUploadFile(file: File): string | null {
  if (file.size > MAX_FILE_BYTES) {
    return `Datei zu groß (max. ${Math.round(MAX_FILE_BYTES / 1024 / 1024)} MB)`;
  }
  const sanitized = sanitizePhotoFilename(file.name);
  if (!sanitized) {
    return "Ungültiges Format (jpg, png, webp, gif, heic)";
  }
  return null;
}

async function persistParticipantPhoto(
  eventId: string,
  participant: ParticipantPhotoTarget,
  file: File,
  sortOrder: number,
  processingStatus: import("@prisma/client").PhotoProcessingStatus,
  preferredFilename?: string,
): Promise<string> {
  const uploadDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    "events",
    eventId,
    participant.id,
  );
  await mkdir(uploadDir, { recursive: true });

  const baseFilename =
    preferredFilename ?? buildPhotoFilename(participant.participantNumber, file.name);
  const filename = await resolveUniqueFilename(uploadDir, baseFilename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  const storageKey = `/uploads/events/${eventId}/${participant.id}/${filename}`;
  await prisma.photo.create({
    data: {
      eventId,
      participantId: participant.id,
      filename,
      storageKey,
      previewKey: storageKey,
      qrDetectedCode: participant.qrCode,
      processingStatus,
      sortOrder,
    },
  });

  return filename;
}

export async function revalidatePhotoUploadContext(eventId: string, participantId: string) {
  const galleryAccess = await prisma.galleryAccess.findUnique({
    where: { participantId },
  });
  if (galleryAccess) {
    revalidatePath(`/galerie/${galleryAccess.accessCode}`);
  }

  revalidatePath(`/admin/shootings/${eventId}`);

  const individualReq = await prisma.individualShootingRequest.findFirst({
    where: { participantId },
    select: { id: true },
  });
  if (individualReq) {
    revalidatePath(`/admin/shootings/einzel/${individualReq.id}`);
  }
}

async function maybeNotifyGallerySelection(
  participantId: string,
  notifyCustomer: boolean,
): Promise<void> {
  if (!notifyCustomer) return;

  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
    include: { galleryAccess: true },
  });
  if (!participant?.galleryAccess || !participant.email) return;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://aquafotos.com";
  await sendPhotosReady({
    to: participant.email,
    parentName: participant.parentName,
    galleryUrl: `${appUrl}/galerie/${encodeURIComponent(participant.galleryAccess.accessCode)}`,
  });
}

export async function uploadPhotosForParticipant(input: {
  eventId: string;
  participantId: string;
  files: File[];
  releaseMode?: PhotoUploadReleaseMode;
  notifyCustomer?: boolean;
}): Promise<ParticipantUploadResult> {
  const { eventId, participantId, files } = input;
  const releaseMode = input.releaseMode ?? "select_edit";
  const processingStatus = photoStatusForReleaseMode(releaseMode);
  if (!eventId || !participantId) {
    return { error: "Event oder Teilnehmer fehlt." };
  }

  if (files.length === 0) {
    return { error: "Keine Dateien ausgewählt." };
  }

  const participant = await prisma.participant.findFirst({
    where: { id: participantId, eventId },
    include: { qrCode: true },
  });
  if (!participant) {
    return { error: "Teilnehmer nicht gefunden." };
  }

  let uploaded = 0;
  const skipped: { filename: string; reason: string }[] = [];
  const existingCount = await prisma.photo.count({ where: { participantId } });

  for (const file of files) {
    const validationError = validateUploadFile(file);
    if (validationError) {
      skipped.push({ filename: file.name, reason: validationError });
      continue;
    }

    try {
      await persistParticipantPhoto(
        eventId,
        {
          id: participant.id,
          participantNumber: participant.participantNumber,
          qrCode: participant.qrCode?.code ?? null,
        },
        file,
        existingCount + uploaded,
        processingStatus,
      );
      uploaded++;
    } catch (error) {
      skipped.push({
        filename: file.name,
        reason: error instanceof Error ? error.message : "Speichern fehlgeschlagen",
      });
    }
  }

  if (uploaded > 0) {
    await revalidatePhotoUploadContext(eventId, participant.id);
    if (releaseMode === "select_edit") {
      await maybeNotifyGallerySelection(participant.id, input.notifyCustomer ?? true);
    }
  }

  if (uploaded === 0) {
    return {
      error:
        skipped[0]?.reason ??
        "Keine Fotos hochgeladen – Format oder Dateigröße prüfen.",
    };
  }

  return { success: true, uploaded, skipped };
}

export async function bulkUploadPhotosForEvent(input: {
  eventId: string;
  files: File[];
  releaseMode?: PhotoUploadReleaseMode;
  notifyCustomer?: boolean;
}): Promise<BulkUploadResult | { error: string }> {
  const { eventId, files } = input;
  const releaseMode = input.releaseMode ?? "select_edit";
  const processingStatus = photoStatusForReleaseMode(releaseMode);
  if (!eventId) return { error: "Event fehlt." };
  if (files.length === 0) return { error: "Keine Dateien ausgewählt." };

  const participants = await prisma.participant.findMany({
    where: { eventId },
    include: { qrCode: true },
  });

  if (participants.length === 0) {
    return { error: "Keine Teilnehmer im Shooting – zuerst Teilnehmer anlegen." };
  }

  const byNumber = new Map(participants.map((p) => [p.participantNumber, p]));
  const sortOrders = new Map<string, number>(
    await Promise.all(
      participants.map(async (p) => [
        p.id,
        await prisma.photo.count({ where: { participantId: p.id } }),
      ] as const),
    ),
  );

  const assignedCounts = new Map<number, number>();
  const skipped: BulkUploadResult["skipped"] = [];
  const affectedParticipantIds = new Set<string>();
  let uploaded = 0;

  for (const file of files) {
    const validationError = validateUploadFile(file);
    if (validationError) {
      skipped.push({ filename: file.name, reason: validationError });
      continue;
    }

    const participantNumber = parseParticipantNumberFromFilename(file.name);
    if (participantNumber === null) {
      skipped.push({
        filename: file.name,
        reason: "Keine Teilnehmer-Nr. im Dateinamen (Format: 001_bild.jpg)",
      });
      continue;
    }

    const participant = byNumber.get(participantNumber);
    if (!participant) {
      skipped.push({
        filename: file.name,
        reason: `Teilnehmer #${String(participantNumber).padStart(3, "0")} ist nicht im Shooting`,
      });
      continue;
    }

    const preferredFilename = normalizeAssignedPhotoFilename(file.name, participantNumber);
    if (!preferredFilename) {
      skipped.push({
        filename: file.name,
        reason: "Ungültiger Dateiname oder Bildformat",
      });
      continue;
    }

    try {
      const sortOrder = sortOrders.get(participant.id) ?? 0;
      await persistParticipantPhoto(
        eventId,
        {
          id: participant.id,
          participantNumber: participant.participantNumber,
          qrCode: participant.qrCode?.code ?? null,
        },
        file,
        sortOrder,
        processingStatus,
        preferredFilename,
      );
      sortOrders.set(participant.id, sortOrder + 1);
      assignedCounts.set(
        participantNumber,
        (assignedCounts.get(participantNumber) ?? 0) + 1,
      );
      affectedParticipantIds.add(participant.id);
      uploaded++;
    } catch (error) {
      skipped.push({
        filename: file.name,
        reason: error instanceof Error ? error.message : "Speichern fehlgeschlagen",
      });
    }
  }

  for (const participantId of affectedParticipantIds) {
    await revalidatePhotoUploadContext(eventId, participantId);
    if (releaseMode === "select_edit") {
      await maybeNotifyGallerySelection(participantId, input.notifyCustomer ?? true);
    }
  }

  return {
    success: true,
    uploaded,
    assigned: Array.from(assignedCounts.entries())
      .map(([participantNumber, count]) => ({
        participantNumber,
        childName: byNumber.get(participantNumber)!.childName,
        count,
      }))
      .sort((a, b) => a.participantNumber - b.participantNumber),
    skipped,
  };
}

function parseParticipantNumberFromFilename(filename: string): number | null {
  const base = filename.split(/[/\\]/).pop() ?? filename;
  const match = base.match(/^(?:QR_)?(\d{1,3})[_-]/i);
  if (!match) return null;
  const number = parseInt(match[1], 10);
  return Number.isFinite(number) && number > 0 ? number : null;
}
