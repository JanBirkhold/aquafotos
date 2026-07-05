import { prisma } from "@/lib/prisma";
import { generateOrderInvoicePdf } from "@/lib/invoice-pdf";
import { getBankTransferDetails } from "@/lib/voucher-payment";

export async function buildVoucherPurchaseInvoiceInput(purchaseNumber: string) {
  const vouchers = await prisma.voucher.findMany({
    where: { purchaseNumber },
    include: { product: true },
    orderBy: { createdAt: "asc" },
  });

  if (vouchers.length === 0) return null;

  const first = vouchers[0];
  const totalCents = vouchers.reduce((sum, voucher) => sum + voucher.priceCents, 0);

  return {
    orderNumber: purchaseNumber,
    customerEmail: first.buyerEmail,
    customerName: first.buyerName,
    createdAt: first.createdAt,
    totalCents,
    bank: getBankTransferDetails(),
    paymentHint:
      "Bitte überweisen Sie den Betrag innerhalb von 7 Tagen. Nach Zahlungseingang senden wir Ihnen die Gutschein-Codes und QR-Codes per E-Mail.",
    items: vouchers.map((voucher, index) => ({
      position: index + 1,
      label: voucher.product.title,
      priceCents: voucher.priceCents,
    })),
  };
}

export async function generateVoucherPurchaseInvoicePdf(
  purchaseNumber: string,
): Promise<Uint8Array | null> {
  const input = await buildVoucherPurchaseInvoiceInput(purchaseNumber);
  if (!input) return null;
  return generateOrderInvoicePdf(input);
}
