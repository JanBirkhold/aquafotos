import Link from "next/link";
import Image from "next/image";
import { Download } from "lucide-react";
import { BankTransferBox } from "@/components/shared/bank-transfer-box";
import { OrderInvoiceActions } from "@/components/orders/order-invoice-actions";
import { OrderFlowTimeline } from "@/components/orders/order-flow-timeline";
import { Button } from "@/components/ui/button";
import {
  orderItemStatusLabels,
  orderStatusColors,
  orderStatusLabels,
} from "@/lib/order-workflow";
import { formatEuro } from "@/lib/pricing";
import { getBankTransferDetails } from "@/lib/voucher-payment";
import type { OrderItemStatus, OrderStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

export type CustomerOrderView = {
  orderNumber: string;
  status: OrderStatus;
  totalCents: number;
  customerEmail?: string | null;
  invoiceUrl?: string | null;
  paidAt: string | null;
  processingStartedAt: string | null;
  readyNotifiedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  items: {
    id: string;
    position: number;
    status: OrderItemStatus;
    filename: string;
    previewUrl: string;
    downloadUrl: string | null;
    hasFinalFile?: boolean;
  }[];
};

type Props = {
  order: CustomerOrderView;
  accessCode?: string | null;
};

export function CustomerOrderStatusView({ order, accessCode }: Props) {
  const canDownload = order.items.some((i) => i.downloadUrl);
  const isPendingPayment = order.status === "PENDING_PAYMENT";
  const bank = getBankTransferDetails();

  function downloadHref(url: string) {
    if (!accessCode) return url;
    return `${url}?code=${encodeURIComponent(accessCode)}`;
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <p className="font-mono text-sm text-aqua-600">Bestellung</p>
        <h1 className="font-display text-3xl font-bold text-aqua-900">{order.orderNumber}</h1>
        <span
          className={cn(
            "mt-3 inline-block rounded-full px-3 py-1 text-sm font-medium",
            orderStatusColors[order.status],
          )}
        >
          {orderStatusLabels[order.status]}
        </span>
        <p className="mt-2 text-sm text-slate-500">
          {order.items.length} Bild{order.items.length !== 1 ? "er" : ""} ·{" "}
          {formatEuro(order.totalCents)} ·{" "}
          {new Date(order.createdAt).toLocaleDateString("de-DE")}
        </p>
      </div>

      {isPendingPayment && (
        <>
          <BankTransferBox
            bank={bank}
            reference={order.orderNumber}
            totalCents={order.totalCents}
            description="Bitte überweisen Sie den Betrag innerhalb von 7 Tagen. Nach Zahlungseingang beginnen wir mit der Bearbeitung."
            referenceCopyLabel="Bestellnummer kopieren"
          />
          <section className="rounded-2xl border border-aqua-100 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-aqua-900">Rechnung</h2>
            <p className="mt-2 text-sm text-slate-600">
              Rechnung ansehen, herunterladen oder ausdrucken.
            </p>
            <div className="mt-4">
              <OrderInvoiceActions
                orderNumber={order.orderNumber}
                invoiceUrl={order.invoiceUrl}
                accessCode={accessCode}
              />
            </div>
          </section>
        </>
      )}

      <section className="rounded-2xl border border-aqua-100 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-aqua-900">Ihr Bestellablauf</h2>
        <p className="mt-1 text-sm text-slate-600">
          Nach der Auswahl in der Galerie bearbeiten wir Ihre Bilder. Sie werden per E-Mail
          informiert, sobald die fertigen Dateien zum Download bereitstehen.
        </p>
        <div className="mt-6">
          <OrderFlowTimeline order={order} layout="horizontal" />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-aqua-900">Ihre Bilder</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {order.items.map((item) => (
            <li key={item.id} className="overflow-hidden rounded-xl border border-slate-100">
              <div className="relative aspect-[3/4] bg-slate-100">
                <Image
                  src={item.previewUrl}
                  alt={item.filename}
                  fill
                  className="object-cover opacity-90"
                  sizes="240px"
                  unoptimized={item.previewUrl.startsWith("/uploads/")}
                />
                {!item.downloadUrl && (
                  <span className="absolute inset-0 flex items-center justify-center bg-aqua-950/40 px-4 text-center text-sm font-medium text-white">
                    {orderItemStatusLabels[item.status]}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.filename}</p>
                  <p className="text-xs text-slate-500">
                    {orderItemStatusLabels[item.status]}
                  </p>
                </div>
                {item.downloadUrl ? (
                  <Button asChild size="sm">
                    <a href={downloadHref(item.downloadUrl)} download={item.filename}>
                      <Download className="mr-1 h-3 w-3" aria-hidden />
                      {item.hasFinalFile === false ? "Download*" : "Download"}
                    </a>
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
        {!canDownload && (
          <p className="mt-4 text-sm text-slate-500">
            Downloads erscheinen hier, sobald die Bearbeitung abgeschlossen ist.
          </p>
        )}
        {canDownload && order.items.some((i) => i.hasFinalFile === false) && (
          <p className="mt-4 text-xs text-amber-700">
            * Vorläufiger Download – finale Datei ohne Wasserzeichen folgt nach Studio-Upload.
          </p>
        )}
      </section>

      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild variant="outline">
          <Link href="/galerie">Zur Galerie-Info</Link>
        </Button>
      </div>
    </div>
  );
}
