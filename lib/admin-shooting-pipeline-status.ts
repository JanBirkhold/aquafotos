import { galleryVisibleStatuses } from "@/lib/gallery";
import {
  normalizeParticipantStatus,
  participantStatusLabels,
} from "@/lib/participant-workflow";
import type { ParticipantStatus, PhotoProcessingStatus, VoucherStatus } from "@prisma/client";

export type AdminPipelineStepState = "done" | "active" | "pending" | "warning";

export type AdminPipelineStep = {
  id: string;
  label: string;
  state: AdminPipelineStepState;
  detail?: string;
};

export type AdminShootingPipelineInput = {
  voucherStatus?: VoucherStatus | string;
  hasRedemption?: boolean;
  confirmedDate?: Date | string | null;
  preferredDate?: Date | string | null;
  participant?: {
    status: ParticipantStatus;
    galleryAccess: { accessCode: string } | null;
    photos?: { processingStatus: PhotoProcessingStatus }[];
  } | null;
};

function countPhotos(photos: { processingStatus: PhotoProcessingStatus }[] | undefined) {
  const all = photos?.length ?? 0;
  const visible =
    photos?.filter((p) => galleryVisibleStatuses.includes(p.processingStatus)).length ?? 0;
  return { all, visible };
}

function formatShortDate(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(`${String(value).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

export function getAdminShootingPipelineSteps(
  input: AdminShootingPipelineInput,
): AdminPipelineStep[] {
  const steps: AdminPipelineStep[] = [];
  const voucherStatus = input.voucherStatus;
  const isPaid = voucherStatus === "PAID" || voucherStatus === "REDEEMED";
  const isRedeemed = voucherStatus === "REDEEMED" || input.hasRedemption;
  const hasConfirmed = !!input.confirmedDate;
  const participant = input.participant;
  const { all: totalPhotos, visible: visiblePhotos } = countPhotos(participant?.photos);
  const hasGalleryAccess = !!participant?.galleryAccess;
  const galleryReady = visiblePhotos > 0;
  const participantLabel = participant
    ? participantStatusLabels[normalizeParticipantStatus(participant.status)]
    : null;

  if (voucherStatus === "PENDING_PAYMENT") {
    steps.push({
      id: "payment",
      label: "Zahlung",
      state: "active",
      detail: "Überweisung ausstehend",
    });
    return steps;
  }

  if (voucherStatus && !isPaid) {
    steps.push({
      id: "voucher",
      label: "Gutschein",
      state: "warning",
      detail: String(voucherStatus),
    });
    return steps;
  }

  steps.push({
    id: "redeem",
    label: "Einlösung",
    state: isRedeemed ? "done" : "active",
    detail: isRedeemed ? undefined : "Noch nicht eingelöst",
  });

  const preferred = formatShortDate(input.preferredDate);
  steps.push({
    id: "appointment",
    label: "Termin",
    state: hasConfirmed ? "done" : isRedeemed ? "active" : "pending",
    detail: hasConfirmed
      ? formatShortDate(input.confirmedDate) ?? undefined
      : preferred
        ? `Wunsch ${preferred}`
        : isRedeemed
          ? "Bestätigung offen"
          : undefined,
  });

  if (!hasConfirmed) {
    return steps;
  }

  steps.push({
    id: "gallery-setup",
    label: "Galerie",
    state: hasGalleryAccess ? "done" : "active",
    detail: hasGalleryAccess
      ? participant?.galleryAccess?.accessCode
      : "Noch nicht eingerichtet",
  });

  steps.push({
    id: "photos",
    label: "Fotos",
    state: galleryReady ? "done" : totalPhotos > 0 ? "active" : "pending",
    detail: galleryReady
      ? `${visiblePhotos} sichtbar`
      : totalPhotos > 0
        ? `${totalPhotos} hochgeladen · Freigabe offen`
        : "Noch keine Fotos",
  });

  if (galleryReady) {
    steps.push({
      id: "customer",
      label: "Kunde",
      state:
        participant?.status === "ORDERED"
          ? "done"
          : normalizeParticipantStatus(participant?.status ?? "INVITED") === "GALLERY_VIEWED"
            ? "active"
            : "pending",
      detail: participantLabel ?? undefined,
    });
  }

  return steps;
}

export function getAdminShootingPipelineSummary(input: AdminShootingPipelineInput): {
  headline: string;
  steps: AdminPipelineStep[];
  nextAction: string | null;
} {
  const steps = getAdminShootingPipelineSteps(input);
  const active = steps.find((s) => s.state === "active");
  const warning = steps.find((s) => s.state === "warning");

  let headline = "Abgeschlossen";
  if (warning) headline = warning.detail ?? warning.label;
  else if (active) headline = active.detail ? `${active.label}: ${active.detail}` : active.label;

  const nextAction =
    active?.id === "redeem"
      ? "Einlösung abwarten"
      : active?.id === "appointment"
        ? "Termin bestätigen"
        : active?.id === "gallery-setup"
          ? "Galerie einrichten"
          : active?.id === "photos"
            ? "Fotos hochladen / freigeben"
            : active?.id === "customer"
              ? "Kunde wählt Bilder"
              : null;

  return { headline, steps, nextAction };
}
