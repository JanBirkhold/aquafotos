import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@prisma/client";

export type ParticipantOrderSummary = {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  totalCents: number;
  createdAt: string;
  itemCount: number;
  isReorder: boolean;
};

export async function getParticipantOrdersByEventId(
  eventId: string,
): Promise<Map<string, ParticipantOrderSummary[]>> {
  const orders = await prisma.order.findMany({
    where: {
      eventId,
      status: { not: "CANCELLED" },
    },
    include: {
      items: {
        include: { photo: { select: { participantId: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const byParticipant = new Map<string, ParticipantOrderSummary[]>();

  for (const order of orders) {
    const participantIds = [
      ...new Set(
        order.items
          .map((item) => item.photo?.participantId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    const summary: ParticipantOrderSummary = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalCents: order.totalCents,
      createdAt: order.createdAt.toISOString(),
      itemCount: order.items.length,
      isReorder: order.isReorder,
    };

    for (const participantId of participantIds) {
      const existing = byParticipant.get(participantId) ?? [];
      if (!existing.some((entry) => entry.orderId === order.id)) {
        existing.push(summary);
      }
      byParticipant.set(participantId, existing);
    }
  }

  return byParticipant;
}

export function serializeParticipantOrdersMap(
  map: Map<string, ParticipantOrderSummary[]>,
): Record<string, ParticipantOrderSummary[]> {
  return Object.fromEntries(map.entries());
}
