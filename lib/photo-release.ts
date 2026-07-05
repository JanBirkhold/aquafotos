import type { PhotoProcessingStatus } from "@prisma/client";

/** Nach Upload: Kunde wählt in Galerie, danach Bearbeitung oder Sofort-Download */
export type PhotoUploadReleaseMode = "select_edit" | "select_ready";

export const photoUploadReleaseLabels: Record<
  PhotoUploadReleaseMode,
  { title: string; shortTitle: string; description: string }
> = {
  select_edit: {
    title: "Kunde wählt → noch bearbeiten",
    shortTitle: "Noch bearbeiten",
    description:
      "Vorschaubilder in Galerie. Nach Auswahl/Bestellung bearbeiten Sie die Dateien – Download folgt per E-Mail.",
  },
  select_ready: {
    title: "Kunde wählt → bereits bearbeitet",
    shortTitle: "Sofort-Download",
    description:
      "Fertige Dateien in Galerie. Nach Auswahl (Gutschein/Bestellung) sofort Download – ohne Bearbeitungs-Schritt.",
  },
};

export function parsePhotoUploadReleaseMode(
  value: FormDataEntryValue | null | undefined,
): PhotoUploadReleaseMode {
  return value === "select_ready" ? "select_ready" : "select_edit";
}

export function photoStatusForReleaseMode(
  mode: PhotoUploadReleaseMode,
): PhotoProcessingStatus {
  return mode === "select_ready" ? "READY" : "PRESELECTED";
}

export function photoAllowsImmediateDownload(
  status: PhotoProcessingStatus,
): boolean {
  return status === "READY";
}

export const photoProcessingStatusLabels: Record<PhotoProcessingStatus, string> = {
  RAW: "Intern",
  PRESELECTED: "Zur Auswahl",
  EDITING: "In Bearbeitung",
  APPROVED: "Freigegeben",
  READY: "Download bereit",
};

export const photoProcessingStatusColors: Record<PhotoProcessingStatus, string> = {
  RAW: "bg-slate-100 text-slate-600",
  PRESELECTED: "bg-violet-100 text-violet-800",
  EDITING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-aqua-100 text-aqua-800",
  READY: "bg-green-100 text-green-800",
};
