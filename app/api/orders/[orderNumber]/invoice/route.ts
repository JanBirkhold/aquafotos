import { NextRequest } from "next/server";
import { auth, isStaffRole } from "@/lib/auth";
import { getGalleryAccessCookie } from "@/lib/gallery-session";
import {
  buildOrderInvoiceInput,
  readStoredOrderInvoice,
} from "@/lib/order-invoice";
import { generateOrderInvoicePdf } from "@/lib/invoice-pdf";
import { invoiceFilename } from "@/lib/invoice-filename";
import { verifyOrderAccess } from "@/lib/order-queries";

type RouteContext = { params: Promise<{ orderNumber: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { orderNumber } = await context.params;
  const codeParam = request.nextUrl.searchParams.get("code");
  const session = await auth();
  const cookieCode = await getGalleryAccessCookie();
  const accessCode = codeParam ?? cookieCode;

  const { ok, order } = await verifyOrderAccess(
    orderNumber,
    accessCode,
    session?.user?.email,
  );

  const isStaff = session?.user && isStaffRole(session.user.role);

  if (!order || (!ok && !isStaff)) {
    return new Response("Nicht gefunden", { status: 404 });
  }

  let pdfBytes = await readStoredOrderInvoice(orderNumber);

  if (!pdfBytes) {
    const input = await buildOrderInvoiceInput(order.id);
    if (!input) {
      return new Response("Rechnung nicht verfügbar", { status: 404 });
    }
    pdfBytes = await generateOrderInvoicePdf(input);
  }

  return new Response(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoiceFilename(orderNumber)}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
