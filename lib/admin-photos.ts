import { access, rename as fsRename, unlink } from "node:fs/promises";
import path from "node:path";
import { formatParticipantCode } from "@/lib/qr-utils";

const IMAGE_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif", "heic"]);

export function sanitizePhotoFilename(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed || trimmed.includes("/") || trimmed.includes("\\")) return null;

  const ext = trimmed.split(".").pop()?.toLowerCase() ?? "";
  if (!IMAGE_EXT.has(ext)) return null;

  const base = trimmed
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 80);

  if (!base) return null;
  return `${base}.${ext}`;
}

export function photoFilesystemPath(storageKey: string): string {
  return path.join(process.cwd(), "public", storageKey.replace(/^\//, ""));
}

export async function deletePhotoFile(storageKey: string): Promise<void> {
  try {
    await unlink(photoFilesystemPath(storageKey));
  } catch {
    // Datei fehlt oder ist bereits entfernt
  }
}

export async function resolveUniqueFilename(
  uploadDir: string,
  desiredFilename: string,
): Promise<string> {
  const ext = desiredFilename.split(".").pop() ?? "jpg";
  const base = desiredFilename.replace(/\.[^.]+$/, "");

  let candidate = desiredFilename;
  let counter = 2;

  while (true) {
    try {
      await access(path.join(uploadDir, candidate));
      candidate = `${base}_${counter}.${ext}`;
      counter++;
    } catch {
      return candidate;
    }
  }
}

export async function renamePhotoFile(
  storageKey: string,
  newStorageKey: string,
): Promise<void> {
  const from = photoFilesystemPath(storageKey);
  const to = photoFilesystemPath(newStorageKey);
  await fsRename(from, to);
}

export function normalizeAssignedPhotoFilename(
  originalName: string,
  participantNumber: number,
): string | null {
  const sanitized = sanitizePhotoFilename(originalName.split(/[/\\]/).pop() ?? originalName);
  if (!sanitized) return null;

  const prefix = formatParticipantCode(participantNumber);
  if (new RegExp(`^${prefix}[_-]`, "i").test(sanitized)) {
    return sanitized;
  }

  const stripped = sanitized
    .replace(/^QR_/i, "")
    .replace(/^\d{1,3}[_-]/, "");

  if (!stripped) return null;
  return `${prefix}_${stripped}`;
}
