import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { voucherProductImageRequirements } from "@/lib/voucher-image-shared";

export { voucherProductImageRequirements } from "@/lib/voucher-image-shared";

export async function saveVoucherProductImage(productId: string, file: File): Promise<string> {
  if (
    !voucherProductImageRequirements.acceptedTypes.includes(
      file.type as (typeof voucherProductImageRequirements.acceptedTypes)[number],
    )
  ) {
    throw new Error("Nur JPG, PNG oder WebP erlaubt.");
  }
  if (file.size > voucherProductImageRequirements.maxBytes) {
    throw new Error("Bild zu groß (max. 2 MB).");
  }

  const ext =
    file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const filename = `cover.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "vouchers", productId);
  await mkdir(uploadDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);
  return `/uploads/vouchers/${productId}/${filename}`;
}
