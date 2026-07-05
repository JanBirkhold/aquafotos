export const VOUCHER_FLOW_STEPS = [
  {
    id: "paid",
    label: "Bezahlt",
    description: "Zahlung eingegangen – Gutschein freigegeben",
  },
  {
    id: "code",
    label: "Code",
    description: "Code & QR-Code per E-Mail erhalten",
  },
  {
    id: "redeemed",
    label: "Eingelöst",
    description: "Terminanfrage abgesendet",
  },
  {
    id: "confirmed",
    label: "Termin",
    description: "Individueller Termin bestätigt",
  },
  {
    id: "gallery",
    label: "Galerie",
    description: "Shooting & Bilder im Gutschein auswählen",
  },
] as const;

export type VoucherFlowStepId = (typeof VOUCHER_FLOW_STEPS)[number]["id"];

export type VoucherFlowInput = {
  status: string;
  confirmedDate: string | null;
  hasGalleryAccess?: boolean;
  galleryReady?: boolean;
};

export function computeVoucherFlowProgress(
  voucher: VoucherFlowInput,
): Record<VoucherFlowStepId, "done" | "active" | "pending"> {
  const isPaid = voucher.status === "PAID" || voucher.status === "REDEEMED";
  const isRedeemed = voucher.status === "REDEEMED";
  const isConfirmed = !!voucher.confirmedDate;
  const hasGalleryAccess = voucher.hasGalleryAccess ?? false;
  const galleryReady = voucher.galleryReady ?? false;

  const progress = {
    paid: "pending",
    code: "pending",
    redeemed: "pending",
    confirmed: "pending",
    gallery: "pending",
  } as Record<VoucherFlowStepId, "done" | "active" | "pending">;

  if (!isPaid) {
    progress.paid = "active";
    return progress;
  }

  progress.paid = "done";
  progress.code = "done";

  if (!isRedeemed) {
    progress.redeemed = "active";
    return progress;
  }

  progress.redeemed = "done";

  if (!isConfirmed) {
    progress.confirmed = "active";
    return progress;
  }

  progress.confirmed = "done";

  if (!hasGalleryAccess || !galleryReady) {
    progress.gallery = "active";
    return progress;
  }

  progress.gallery = "done";
  return progress;
}
