import { prisma } from "@/lib/prisma";
import { sendOrderReadyEmail } from "@/lib/email";
import { photoAllowsImmediateDownload } from "@/lib/photo-release";
import { orderStatusPageUrl } from "@/lib/order-queries";
import { syncOrderStatusFromItems } from "@/lib/order-workflow";

export async function finalizeOrderItemsFromPhotoStatus(orderId: string): Promise<{
  allReady: boolean;
  readyCount: number;
}> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          photo: {
            select: { processingStatus: true, storageKey: true },
          },
        },
      },
    },
  });

  if (!order) return { allReady: false, readyCount: 0 };

  let readyCount = 0;

  for (const item of order.items) {
    if (!item.photo || !photoAllowsImmediateDownload(item.photo.processingStatus)) continue;

    if (item.status !== "READY") {
      await prisma.orderItem.update({
        where: { id: item.id },
        data: {
          status: "READY",
          readyAt: new Date(),
          finalStorageKey: item.finalStorageKey ?? item.photo.storageKey,
        },
      });
    }
    readyCount++;
  }

  const refreshed = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!refreshed) return { allReady: false, readyCount };

  const nextStatus = syncOrderStatusFromItems(refreshed.items, refreshed.status);
  const allReady =
    refreshed.items.length > 0 && refreshed.items.every((item) => item.status === "READY");

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: allReady ? "READY" : nextStatus,
      processingStartedAt:
        nextStatus === "PROCESSING" && !refreshed.processingStartedAt
          ? new Date()
          : refreshed.processingStartedAt,
      deliveredAt: allReady ? refreshed.deliveredAt ?? new Date() : refreshed.deliveredAt,
    },
  });

  return { allReady, readyCount };
}

export async function notifyOrderReadyIfComplete(orderId: string): Promise<boolean> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          photo: { select: { filename: true } },
        },
      },
    },
  });

  if (!order || order.readyNotifiedAt) return false;
  if (!order.items.every((item) => item.status === "READY")) return false;

  const firstPhotoId = order.items[0]?.photoId;
  const participant = firstPhotoId
    ? await prisma.participant.findFirst({
        where: {
          photos: { some: { id: firstPhotoId } },
        },
        include: { galleryAccess: true },
      })
    : null;

  const email = order.customerEmail ?? participant?.email;
  if (!email) return false;

  const accessCode = participant?.galleryAccess?.accessCode;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://aquafotos.com";

  await sendOrderReadyEmail({
    to: email,
    parentName: participant?.parentName ?? "Kunde",
    orderNumber: order.orderNumber,
    orderStatusLink: orderStatusPageUrl(order.orderNumber, accessCode),
    downloadItems: order.items
      .filter((item) => item.photo)
      .map((item) => ({
        filename: item.photo!.filename,
        downloadUrl: `${appUrl}/api/orders/items/${item.id}/download`,
      })),
  });

  await prisma.order.update({
    where: { id: orderId },
    data: { readyNotifiedAt: new Date() },
  });

  return true;
}
