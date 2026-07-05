export const voucherProductImageRequirements = {
  acceptedTypes: ["image/jpeg", "image/png", "image/webp"] as const,
  maxBytes: 2 * 1024 * 1024,
  hint: "JPG, PNG oder WebP · max. 2 MB · Querformat empfohlen (4:3)",
};

export function isVoucherUploadImage(url: string | null | undefined): boolean {
  return Boolean(url?.startsWith("/uploads/"));
}
