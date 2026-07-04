"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { auth, isStaffRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendOrderReadyEmail } from "@/lib/email";
import {
  orderStatusPageUrl,
  serializeOrderItem,
} from "@/lib/order-queries";
import { getReorderPhotoIdsForOrder } from "@/lib/order-reorder";
import {
  syncOrderStatusFromItems,
} from "@/lib/order-workflow";
import type { OrderItemStatus, OrderStatus } from "@prisma/client";

async function requireStaff() {
  const session = await auth();
  if (!session?.user || !isStaffRole(session.user.role)) {
    throw new Error("Unauthorized");
  }
}

async function loadOrder(orderId: string) {
  return prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: {
      items: {
        include: {
          photo: {
            include: {
              participant: { include: { galleryAccess: true } },
            },
          },
        },
        orderBy: { position: "asc" },
      },
    },
  });
}

async function syncOrder(orderId: string) {
  const order = await loadOrder(orderId);
  const nextStatus = syncOrderStatusFromItems(order.items, order.status);
  const allReady = order.items.every((i) => i.status === "READY");

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: nextStatus,
      processingStartedAt:
        nextStatus === "PROCESSING" && !order.processingStartedAt
          ? new Date()
          : order.processingStartedAt,
      deliveredAt:
        nextStatus === "DELIVERED" ? order.deliveredAt ?? new Date() : order.deliveredAt,
    },
  });

  return { order, allReady };
}

export async function updateOrderItemStatus(
  itemId: string,
  status: OrderItemStatus,
) {
  await requireStaff();

  const existing = await prisma.orderItem.findUniqueOrThrow({
    where: { id: itemId },
    include: { photo: true, order: true },
  });

  const item = await prisma.orderItem.update({
    where: { id: itemId },
    data: {
      status,
      readyAt: status === "READY" ? new Date() : null,
      finalStorageKey:
        status === "READY" && !existing.finalStorageKey
          ? existing.photo.storageKey
          : status !== "READY"
            ? existing.finalStorageKey
            : undefined,
    },
  });

  await syncOrder(item.orderId);
  revalidatePath("/admin/bestellungen");
  revalidatePath(`/admin/bestellungen/${item.orderId}`);
  revalidatePath(`/bestellung/${existing.order.orderNumber}`);

  return { success: true };
}

export async function startOrderProcessing(orderId: string) {
  await requireStaff();

  await prisma.orderItem.updateMany({
    where: { orderId, status: "AWAITING_PROCESSING" },
    data: { status: "IN_PROCESSING" },
  });

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "PROCESSING",
      processingStartedAt: new Date(),
    },
  });

  revalidatePath("/admin/bestellungen");
  revalidatePath(`/admin/bestellungen/${orderId}`);
  return { success: true };
}

export async function markAllOrderItemsReady(orderId: string) {
  await requireStaff();

  const order = await loadOrder(orderId);

  await prisma.$transaction(
    order.items.map((item) =>
      prisma.orderItem.update({
        where: { id: item.id },
        data: {
          status: "READY",
          readyAt: new Date(),
          finalStorageKey: item.finalStorageKey ?? item.photo.storageKey,
        },
      }),
    ),
  );

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "READY" },
  });

  revalidatePath("/admin/bestellungen");
  revalidatePath(`/admin/bestellungen/${orderId}`);
  revalidatePath(`/bestellung/${order.orderNumber}`);
  return { success: true };
}

export async function uploadOrderItemFinal(formData: FormData) {
  await requireStaff();

  const itemId = formData.get("itemId") as string;
  const file = formData.get("file");

  if (!itemId || !(file instanceof File) || file.size === 0) {
    return { error: "Datei fehlt." };
  }

  const item = await prisma.orderItem.findUniqueOrThrow({
    where: { id: itemId },
    include: { photo: true, order: true },
  });

  const uploadDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    "orders",
    item.orderId,
  );
  await mkdir(uploadDir, { recursive: true });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filename = `${String(item.position).padStart(2, "0")}_${item.photo.filename.replace(/\.[^.]+$/, "")}_final.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  const finalStorageKey = `/uploads/orders/${item.orderId}/${filename}`;

  await prisma.orderItem.update({
    where: { id: itemId },
    data: {
      finalStorageKey,
      status: "READY",
      readyAt: new Date(),
    },
  });

  await syncOrder(item.orderId);
  revalidatePath("/admin/bestellungen");
  revalidatePath(`/admin/bestellungen/${item.orderId}`);
  revalidatePath(`/bestellung/${item.order.orderNumber}`);

  return { success: true, finalStorageKey };
}

export async function notifyOrderReady(
  orderId: string,
  overrides?: { subject?: string; bodyHtml?: string },
) {
  await requireStaff();

  const order = await loadOrder(orderId);
  const participant = order.items[0]?.photo.participant;
  const email = order.customerEmail ?? participant?.email;

  if (!email) return { error: "Keine E-Mail für diese Bestellung." };

  const accessCode = participant?.galleryAccess?.accessCode;
  const downloadItems = order.items
    .filter((i) => i.status === "READY")
    .map((i) => ({
      filename: i.photo.filename,
      downloadUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://aquafotos.com"}/api/orders/items/${i.id}/download`,
    }));

  await sendOrderReadyEmail({
    to: email,
    parentName: participant?.parentName ?? "Kunde",
    orderNumber: order.orderNumber,
    orderStatusLink: orderStatusPageUrl(order.orderNumber, accessCode),
    downloadItems,
    overrides,
  });

  await prisma.order.update({
    where: { id: orderId },
    data: {
      readyNotifiedAt: new Date(),
      status: order.status === "PAID" || order.status === "PROCESSING" ? "READY" : order.status,
    },
  });

  revalidatePath("/admin/bestellungen");
  revalidatePath(`/admin/bestellungen/${orderId}`);
  revalidatePath(`/bestellung/${order.orderNumber}`);

  return { success: true };
}

export async function getOrderReadyNotificationVariables(orderId: string) {
  await requireStaff();
  const order = await loadOrder(orderId);
  const participant = order.items[0]?.photo.participant;
  const accessCode = participant?.galleryAccess?.accessCode;

  const { buildOrderDownloadBlock, buildOrderFlowBlock } = await import(
    "@/lib/email-templates"
  );

  return {
    templateKey: "order_ready" as const,
    variables: {
      parentName: participant?.parentName ?? "Max Mustermann",
      orderNumber: order.orderNumber,
      orderFlowBlock: buildOrderFlowBlock(),
      downloadBlock: buildOrderDownloadBlock(
        order.items
          .filter((i) => i.finalStorageKey)
          .map((i) => ({
            filename: i.photo.filename,
            downloadUrl: orderStatusPageUrl(order.orderNumber, accessCode),
          })),
      ),
      orderStatusLink: orderStatusPageUrl(order.orderNumber, accessCode),
    },
    recipientLabel: `${participant?.childName ?? "Kunde"} (${order.customerEmail ?? participant?.email ?? "—"})`,
  };
}

export async function getAdminOrderDetail(orderId: string) {
  await requireStaff();
  const order = await loadOrder(orderId);
  const reorderPhotoIds = await getReorderPhotoIdsForOrder(orderId);

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    isReorder: order.isReorder,
    customerEmail: order.customerEmail,
    totalCents: order.totalCents,
    paidAt: order.paidAt?.toISOString() ?? null,
    processingStartedAt: order.processingStartedAt?.toISOString() ?? null,
    readyNotifiedAt: order.readyNotifiedAt?.toISOString() ?? null,
    deliveredAt: order.deliveredAt?.toISOString() ?? null,
    createdAt: order.createdAt.toISOString(),
    participantName: order.items[0]?.photo.participant?.childName ?? null,
    parentName: order.items[0]?.photo.participant?.parentName ?? null,
    items: order.items.map((item) => ({
      ...serializeOrderItem(item),
      isReorderItem: reorderPhotoIds.has(item.photoId),
    })),
  };
}

export async function updateOrderStatusAdmin(
  orderId: string,
  status: OrderStatus,
) {
  await requireStaff();
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      deliveredAt: status === "DELIVERED" ? new Date() : undefined,
    },
  });
  revalidatePath("/admin/bestellungen");
  revalidatePath(`/admin/bestellungen/${orderId}`);
  return { success: true };
}
