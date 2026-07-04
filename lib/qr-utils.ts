import QRCode from "qrcode";

export function formatParticipantCode(participantNumber: number): string {
  return String(participantNumber).padStart(3, "0");
}

export function buildQrPayload(accessCode: string): string {
  return `AQUAFOTOS:${accessCode}`;
}

export function buildAccessCode(eventId: string, participantNumber: number): string {
  return `AF-${eventId.slice(-4).toUpperCase()}-${formatParticipantCode(participantNumber)}`;
}

export function buildPhotoFilename(
  participantNumber: number,
  originalName: string,
): string {
  const ext = originalName.split(".").pop()?.toLowerCase() ?? "jpg";
  const base = originalName
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 40);
  return `${formatParticipantCode(participantNumber)}_${base}.${ext}`;
}

export async function generateQrDataUrl(payload: string): Promise<string> {
  return QRCode.toDataURL(payload, {
    width: 400,
    margin: 2,
    color: { dark: "#0a2a33", light: "#ffffff" },
  });
}

export function parseParticipantNumberFromFilename(filename: string): number | null {
  const base = filename.split(/[/\\]/).pop() ?? filename;
  const match = base.match(/^(?:QR_)?(\d{1,3})[_-]/i);
  if (!match) return null;
  const number = parseInt(match[1], 10);
  return Number.isFinite(number) && number > 0 ? number : null;
}
