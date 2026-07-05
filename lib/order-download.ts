import type { OrderItemStatus } from "@prisma/client";

export function resolveOrderItemStorageKey(item: {
  status: OrderItemStatus;
  finalStorageKey: string | null;
  photo: { storageKey: string } | null;
}): string | null {
  if (item.status !== "READY") return null;
  return item.finalStorageKey ?? item.photo?.storageKey ?? null;
}

export function buildOrderItemDownloadUrl(itemId: string): string {
  return `/api/orders/items/${itemId}/download`;
}

export function orderItemDownloadFilename(
  position: number,
  originalFilename: string,
  isFinal: boolean,
): string {
  const base = originalFilename.replace(/\.[^.]+$/, "");
  const ext = originalFilename.split(".").pop()?.toLowerCase() ?? "jpg";
  const prefix = String(position).padStart(2, "0");
  return isFinal ? `${prefix}_${base}_final.${ext}` : `${prefix}_${base}.${ext}`;
}
