import { prisma } from "@/lib/prisma";
import { getPhotoDisplayUrl } from "@/lib/gallery";
import {
  buildOrderItemDownloadUrl,
  resolveOrderItemStorageKey,
} from "@/lib/order-download";
import type { OrderItemStatus, OrderStatus } from "@prisma/client";

export async function getOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: {
        include: {
          photo: {
            include: {
              participant: {
                include: { galleryAccess: true, event: true },
              },
            },
          },
        },
        orderBy: { position: "asc" },
      },
      event: true,
    },
  });
}

export async function getOrdersForGalleryAccess(accessCode: string) {
  const code = accessCode.trim().toUpperCase();
  return prisma.order.findMany({
    where: {
      status: { not: "CANCELLED" },
      items: {
        some: {
          photo: {
            participant: {
              galleryAccess: { accessCode: code },
            },
          },
        },
      },
    },
    include: {
      items: {
        include: { photo: true },
        orderBy: { position: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export function serializeOrderItem(item: {
  id: string;
  position: number;
  priceCents: number;
  status: OrderItemStatus;
  finalStorageKey: string | null;
  readyAt: Date | null;
  photo: {
    id: string;
    filename: string;
    storageKey: string;
    previewKey: string | null;
  };
}) {
  const previewUrl = getPhotoDisplayUrl(item.photo);
  const storageKey = resolveOrderItemStorageKey(item);
  const downloadUrl = storageKey ? buildOrderItemDownloadUrl(item.id) : null;
  const hasFinalFile = !!item.finalStorageKey;

  return {
    id: item.id,
    position: item.position,
    priceCents: item.priceCents,
    status: item.status,
    filename: item.photo.filename,
    previewUrl,
    downloadUrl,
    hasFinalFile,
    readyAt: item.readyAt?.toISOString() ?? null,
  };
}

export function serializeCustomerOrder(order: {
  orderNumber: string;
  status: OrderStatus;
  totalCents: number;
  isReorder?: boolean;
  paidAt: Date | null;
  processingStartedAt: Date | null;
  readyNotifiedAt: Date | null;
  deliveredAt: Date | null;
  createdAt: Date;
  items: Parameters<typeof serializeOrderItem>[0][];
}) {
  return {
    orderNumber: order.orderNumber,
    status: order.status,
    totalCents: order.totalCents,
    isReorder: order.isReorder ?? false,
    paidAt: order.paidAt?.toISOString() ?? null,
    processingStartedAt: order.processingStartedAt?.toISOString() ?? null,
    readyNotifiedAt: order.readyNotifiedAt?.toISOString() ?? null,
    deliveredAt: order.deliveredAt?.toISOString() ?? null,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map(serializeOrderItem),
  };
}

export function orderStatusPageUrl(orderNumber: string, accessCode?: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://aquafotos.com";
  const path = `/bestellung/${encodeURIComponent(orderNumber)}`;
  if (accessCode) {
    return `${base}${path}?code=${encodeURIComponent(accessCode)}`;
  }
  return `${base}${path}`;
}

export async function verifyOrderAccess(
  orderNumber: string,
  accessCode: string | null,
  sessionEmail?: string | null,
): Promise<{ ok: boolean; order?: Awaited<ReturnType<typeof getOrderByNumber>> }> {
  const order = await getOrderByNumber(orderNumber);
  if (!order) return { ok: false };

  const code = accessCode?.trim().toUpperCase();
  const participant = order.items[0]?.photo.participant;
  const galleryCode = participant?.galleryAccess?.accessCode;

  if (code && galleryCode && code === galleryCode) {
    return { ok: true, order };
  }

  if (
    sessionEmail &&
    participant?.email &&
    sessionEmail.toLowerCase() === participant.email.toLowerCase()
  ) {
    return { ok: true, order };
  }

  if (
    order.customerEmail &&
    sessionEmail &&
    order.customerEmail.toLowerCase() === sessionEmail.toLowerCase()
  ) {
    return { ok: true, order };
  }

  return { ok: false, order };
}

export async function verifyOrderItemDownloadAccess(
  itemId: string,
  accessCode: string | null,
  sessionEmail?: string | null,
  isStaff?: boolean,
): Promise<{
  ok: boolean;
  item?: {
    id: string;
    position: number;
    status: OrderItemStatus;
    finalStorageKey: string | null;
    photo: { filename: string; storageKey: string };
    order: { orderNumber: string; customerEmail: string | null };
  };
}> {
  if (isStaff) {
    const item = await prisma.orderItem.findUnique({
      where: { id: itemId },
      include: {
        photo: { include: { participant: { include: { galleryAccess: true } } } },
        order: true,
      },
    });
    if (!item || item.status !== "READY") return { ok: false };
    return { ok: true, item };
  }

  const item = await prisma.orderItem.findUnique({
    where: { id: itemId },
    include: {
      photo: { include: { participant: { include: { galleryAccess: true } } } },
      order: true,
    },
  });

  if (!item || item.status !== "READY") return { ok: false };

  const { ok } = await verifyOrderAccess(
    item.order.orderNumber,
    accessCode,
    sessionEmail,
  );

  if (!ok) return { ok: false };
  return { ok: true, item };
}
