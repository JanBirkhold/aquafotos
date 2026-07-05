import { auth, isStaffRole } from "@/lib/auth";
import {
  generateVoucherPurchaseInvoicePdf,
} from "@/lib/voucher-invoice";
import { invoiceFilename } from "@/lib/invoice-filename";

type RouteContext = { params: Promise<{ purchaseNumber: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user || !isStaffRole(session.user.role)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { purchaseNumber } = await context.params;
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
