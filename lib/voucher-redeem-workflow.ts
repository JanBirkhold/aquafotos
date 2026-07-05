export const VOUCHER_REDEEM_FLOW_STEPS = [
  {
    id: "redeem",
    label: "Einlösen",
    description: "Code, Kontaktdaten & Wunschtermin absenden",
  },
  {
    id: "confirm",
    label: "Termin",
    description: "Wir bestätigen Ihren Shooting-Termin persönlich",
  },
  {
    id: "shooting",
    label: "Shooting",
    description: "Termin steht – Vorbereitung & Galerie-Einrichtung",
  },
  {
    id: "gallery",
    label: "Galerie",
    description: "Bilder auswählen – im Gutschein enthalten",
  },
] as const;

export type VoucherRedeemFlowStepId = (typeof VOUCHER_REDEEM_FLOW_STEPS)[number]["id"];

export type VoucherRedeemFlowInput = {
  status: string;
  confirmedDate: string | null;
  galleryReady?: boolean;
};

export function computeVoucherRedeemFlowProgress(
  voucher: VoucherRedeemFlowInput,
): Record<VoucherRedeemFlowStepId, "done" | "active" | "pending"> {
  const progress = {
    redeem: "pending",
    confirm: "pending",
    shooting: "pending",
    gallery: "pending",
  } as Record<VoucherRedeemFlowStepId, "done" | "active" | "pending">;

  if (voucher.status === "PENDING_PAYMENT") {
    return progress;
  }

  if (voucher.status === "PAID") {
    progress.redeem = "active";
    return progress;
  }

  if (voucher.status !== "REDEEMED") {
    return progress;
  }

  progress.redeem = "done";

  if (!voucher.confirmedDate) {
    progress.confirm = "active";
    return progress;
  }

  progress.confirm = "done";

  if (!voucher.galleryReady) {
    progress.shooting = "active";
    return progress;
  }

  progress.shooting = "done";
  progress.gallery = "done";
  return progress;
}

export function getVoucherRedeemFlowHeadline(voucher: VoucherRedeemFlowInput): string {
  const progress = computeVoucherRedeemFlowProgress(voucher);

  if (voucher.status === "PENDING_PAYMENT") {
    return "Einlösung nach Zahlungseingang möglich";
  }
  if (progress.redeem === "active") {
    return "Jetzt einlösen & Termin anfragen";
  }
  if (progress.confirm === "active") {
    return "Terminbestätigung läuft";
  }
  if (progress.shooting === "active") {
    return voucher.galleryReady ? "Galerie bereit" : "Shooting & Galerie in Vorbereitung";
  }
  if (progress.gallery === "done") {
    return "Alles bereit – Bilder auswählen";
  }
  return "Ihr Weg zum Shooting";
}
