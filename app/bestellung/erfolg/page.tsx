import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Download } from "lucide-react";
import { OrderPendingView } from "@/components/orders/order-pending-view";
import { emailStatusMessage } from "@/lib/email-delivery";
import { getOrderByNumber, serializeCustomerOrder } from "@/lib/order-queries";
import { getBankTransferDetails } from "@/lib/voucher-payment";
import { createPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import { Button } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Bestellung – AquaFotos",
    description: "Status Ihrer Bildbestellung bei AquaFotos.",
    path: "/bestellung/erfolg",
  });
}

type Props = {
  searchParams: Promise<{ order?: string; mail?: string; code?: string }>;
};

export default async function OrderSuccessPage({ searchParams }: Props) {
  const { order: orderNumber, mail, code } = await searchParams;
  if (!orderNumber) notFound();

  const emailStatus: "sent" | "stub" | "failed" | undefined =
    mail === "sent" || mail === "stub" || mail === "failed" ? mail : undefined;

  const order = await getOrderByNumber(orderNumber);
  if (!order) notFound();

  const participant = order.items[0]?.photo?.participant;
  const isPending = order.status === "PENDING_PAYMENT";
  const customerOrder = serializeCustomerOrder(order);
  const canDownload = customerOrder.items.some((item) => item.downloadUrl);

  if (isPending) {
    return (
      <div className="section-padding pt-28">
        <div className="mx-auto max-w-4xl">
          <OrderPendingView
            orderNumber={order.orderNumber}
            customerEmail={order.customerEmail ?? participant?.email ?? ""}
            customerName={participant?.parentName}
            totalCents={order.totalCents}
            itemCount={order.items.length}
            bank={getBankTransferDetails()}
            invoiceUrl={order.invoiceUrl}
            accessCode={code}
            emailStatus={emailStatus}
          />
        </div>
      </div>
    );
  }

  if (canDownload) {
    return (
      <div className="section-padding pt-28">
        <div className="mx-auto max-w-lg text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-600" aria-hidden />
          <h1 className="mt-6 font-display text-3xl font-bold text-aqua-900">
            Ihre Bilder sind bereit!
          </h1>
          <p className="mt-3 font-mono text-sm text-slate-600">
            Bestellnummer: <strong>{orderNumber}</strong>
          </p>
          <p className="mt-4 text-slate-600">
            Download steht sofort bereit – Gutschein oder bereits bearbeitete Dateien.
          </p>
          <div className="mt-6 space-y-2">
            {customerOrder.items
              .filter((item) => item.downloadUrl)
              .map((item) => (
                <Button key={item.id} asChild className="w-full" variant="outline">
                  <a
                    href={
                      code
                        ? `${item.downloadUrl}?code=${encodeURIComponent(code)}`
                        : item.downloadUrl!
                    }
                  >
                    <Download className="mr-2 h-4 w-4" aria-hidden />
                    Bild {item.position} herunterladen
                  </a>
                </Button>
              ))}
          </div>
          <Button asChild className="mt-4">
            <Link
              href={`/bestellung/${encodeURIComponent(orderNumber)}${code ? `?code=${encodeURIComponent(code)}` : ""}`}
            >
              Bestellstatus & Downloads
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const emailNote = emailStatusMessage(emailStatus, {
    sent: "Sie erhalten eine E-Mail, sobald die fertigen Dateien zum Download bereitstehen.",
    stub: `E-Mail-Versand ist derzeit nicht aktiv. Wir bearbeiten Ihre Bilder trotzdem – bei Fragen: ${siteConfig.phoneDisplay}.`,
    failed: `Bestätigungs-E-Mail konnte nicht versendet werden. Wir bearbeiten Ihre Bestellung trotzdem – bei Fragen: ${siteConfig.phoneDisplay}.`,
  });

  return (
    <div className="section-padding flex min-h-[70vh] items-center pt-28">
      <div className="mx-auto max-w-lg text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-aqua-600" aria-hidden />
        <h1 className="mt-6 font-display text-3xl font-bold text-aqua-900">
          Vielen Dank für Ihre Bestellung!
        </h1>
        <p className="mt-3 font-mono text-sm text-slate-600">
          Bestellnummer: <strong>{orderNumber}</strong>
        </p>
        <p className="mt-4 text-slate-600">
          Wir beginnen mit der Bearbeitung Ihrer Bilder.
          {emailNote ? (
            <>
              {" "}
              <span
                className={emailStatus === "sent" ? undefined : "text-amber-800"}
                role={emailStatus === "sent" ? undefined : "note"}
              >
                {emailNote}
              </span>
            </>
          ) : (
            " Sie erhalten eine E-Mail, sobald die fertigen Dateien zum Download bereitstehen."
          )}
        </p>
        <Button asChild className="mt-6" variant="outline">
          <Link
            href={`/bestellung/${encodeURIComponent(orderNumber)}${code ? `?code=${encodeURIComponent(code)}` : ""}`}
          >
            Bestellstatus verfolgen
          </Link>
        </Button>
        <Button asChild className="mt-4">
          <Link href="/">Zur Startseite</Link>
        </Button>
      </div>
    </div>
  );
}
