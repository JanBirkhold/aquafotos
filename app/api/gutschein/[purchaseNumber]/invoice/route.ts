import { generateVoucherPurchaseInvoicePdf } from "@/lib/voucher-invoice";
import { invoiceFilename } from "@/lib/invoice-filename";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ purchaseNumber: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { purchaseNumber } = await context.params;

  const count = await prisma.voucher.count({ where: { purchaseNumber } });
  if (count === 0) {
    return new Response("Nicht gefunden", { status: 404 });
  }

  const pdfBytes = await generateVoucherPurchaseInvoicePdf(purchaseNumber);
  if (!pdfBytes) {
    return new Response("Rechnung nicht verfügbar", { status: 404 });
  }

  return new Response(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoiceFilename(purchaseNumber)}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
