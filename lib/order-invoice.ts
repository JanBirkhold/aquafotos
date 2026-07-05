import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { generateOrderInvoicePdf, type OrderInvoiceInput } from "@/lib/invoice-pdf";
import { getBankTransferDetails } from "@/lib/voucher-payment";

export function orderInvoicePublicPath(orderNumber: string): string {
  return `/uploads/invoices/${encodeURIComponent(orderNumber)}.pdf`;
}

export async function buildOrderInvoiceInput(
  orderId: string,
): Promise<OrderInvoiceInput | null> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: { photo: { include: { participant: true } } },
        orderBy: { position: "asc" },
      },
    },
  });

  if (!order) return null;

  const participant = order.items[0]?.photo?.participant;

  return {
    orderNumber: order.orderNumber,
    customerEmail: order.customerEmail ?? participant?.email ?? "",
    customerName: order.archivedParentName ?? participant?.parentName ?? null,
    createdAt: order.createdAt,
    totalCents: order.totalCents,
    bank: getBankTransferDetails(),
    items: order.items.map((item) => ({
      position: item.position,
      label: `Foto ${item.position}${(item.photo?.filename ?? item.archivedFilename) ? ` – ${item.photo?.filename ?? item.archivedFilename}` : ""}`,
      priceCents: item.priceCents,
    })),
  };
}

export async function createAndStoreOrderInvoice(
  orderId: string,
): Promise<{ url: string; pdfBytes: Uint8Array } | null> {
  const input = await buildOrderInvoiceInput(orderId);
  if (!input || !input.customerEmail) return null;

  const pdfBytes = await generateOrderInvoicePdf(input);
  const dir = path.join(process.cwd(), "public/uploads/invoices");
  await mkdir(dir, { recursive: true });

  const filePath = path.join(dir, `${input.orderNumber}.pdf`);
  await writeFile(filePath, pdfBytes);

  const url = orderInvoicePublicPath(input.orderNumber);
  await prisma.order.update({
    where: { id: orderId },
    data: { invoiceUrl: url },
  });

  return { url, pdfBytes };
}

export async function readStoredOrderInvoice(
  orderNumber: string,
): Promise<Uint8Array | null> {
  try {
    const filePath = path.join(
      process.cwd(),
      "public/uploads/invoices",
      `${orderNumber}.pdf`,
    );
    const { readFile } = await import("node:fs/promises");
    return readFile(filePath);
  } catch {
    return null;
  }
}

export async function resolveOrderInvoicePdf(
  orderNumber: string,
): Promise<Uint8Array | null> {
  const stored = await readStoredOrderInvoice(orderNumber);
  if (stored) return stored;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    select: { id: true },
  });
  if (!order) return null;

  const input = await buildOrderInvoiceInput(order.id);
  if (!input) return null;

  return generateOrderInvoicePdf(input);
}
