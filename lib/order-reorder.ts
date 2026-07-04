import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@prisma/client";

export const PAID_ORDER_STATUSES: OrderStatus[] = [
  "PAID",
  "PROCESSING",
  "READY",
  "DELIVERED",
];

export async function getPreviouslyOrderedPhotoIds(
  participantId: string,
): Promise<Set<string>> {
  const items = await prisma.orderItem.findMany({
    where: {
      photo: { participantId },
      order: { status: { in: PAID_ORDER_STATUSES } },
    },
    select: { photoId: true },
    distinct: ["photoId"],
  });

  return new Set(items.map((item) => item.photoId));
}

export async function orderIncludesReorderPhotos(photoIds: string[]): Promise<boolean> {
  if (photoIds.length === 0) return false;

  const count = await prisma.orderItem.count({
    where: {
      photoId: { in: photoIds },
      order: { status: { in: PAID_ORDER_STATUSES } },
    },
  });

  return count > 0;
}

export async function getReorderPhotoIdsForOrder(orderId: string): Promise<Set<string>> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { select: { photoId: true } } },
  });

  if (!order || order.items.length === 0) return new Set();

  const photoIds = order.items.map((item) => item.photoId);

  const priorItems = await prisma.orderItem.findMany({
    where: {
      photoId: { in: photoIds },
      order: {
        status: { in: PAID_ORDER_STATUSES },
        id: { not: orderId },
        createdAt: { lt: order.createdAt },
      },
    },
    select: { photoId: true },
    distinct: ["photoId"],
  });

  return new Set(priorItems.map((item) => item.photoId));
}

export async function getOpenReorderOrders(limit = 5) {
  return prisma.order.findMany({
    where: {
      isReorder: true,
      status: { in: ["PAID", "PROCESSING", "READY"] },
    },
    include: {
      items: { include: { photo: true }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
