import Link from "next/link";
import { Download, ExternalLink } from "lucide-react";
import { OrderFlowTimeline } from "@/components/orders/order-flow-timeline";
import type { CustomerOrderView } from "@/components/orders/customer-order-status-view";
import { Button } from "@/components/ui/button";
import {
  getActiveOrderFlowStep,
  orderStatusColors,
  orderStatusLabels,
} from "@/lib/order-workflow";
import { formatEuro } from "@/lib/pricing";
import { cn } from "@/lib/utils";

type Props = {
  orders: CustomerOrderView[];
  accessCode: string;
};

export function GalleryOrderStatusBar({ orders, accessCode }: Props) {
  const activeOrders = orders.filter((o) => o.status !== "PENDING_PAYMENT");
  if (activeOrders.length === 0) return null;

  return (
    <div className="mt-6 space-y-4">
      {activeOrders.map((order) => (
        <GalleryOrderCard key={order.orderNumber} order={order} accessCode={accessCode} />
      ))}
    </div>
  );
}

function GalleryOrderCard({
  order,
  accessCode,
}: {
  order: CustomerOrderView;
  accessCode: string;
}) {
  const canDownload = order.items.some((i) => i.downloadUrl);
  const readyCount = order.items.filter((i) => i.downloadUrl).length;
  const activeStep = getActiveOrderFlowStep({
    status: order.status,
    paidAt: order.paidAt ? new Date(order.paidAt) : null,
    processingStartedAt: order.processingStartedAt
      ? new Date(order.processingStartedAt)
      : null,
    readyNotifiedAt: order.readyNotifiedAt ? new Date(order.readyNotifiedAt) : null,
    deliveredAt: order.deliveredAt ? new Date(order.deliveredAt) : null,
    items: order.items.map((i) => ({
      status: i.status,
      finalStorageKey: i.downloadUrl,
    })),
  });

  function downloadHref(url: string) {
    return `${url}?code=${encodeURIComponent(accessCode)}`;
  }

  const orderDetailHref = `/bestellung/${encodeURIComponent(order.orderNumber)}?code=${encodeURIComponent(accessCode)}`;

  return (
    <section
      className={cn(
        "rounded-2xl border p-5 shadow-sm",
        canDownload ? "border-green-200 bg-green-50/40" : "border-aqua-100 bg-white",
      )}
      aria-labelledby={`order-status-${order.orderNumber}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-aqua-600">
            Ihre Bestellung
          </p>
          <h2
            id={`order-status-${order.orderNumber}`}
            className="font-display text-lg font-semibold text-aqua-900"
          >
            {order.orderNumber}
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-medium",
                orderStatusColors[order.status],
              )}
            >
              {orderStatusLabels[order.status]}
            </span>
            <span>
              {order.items.length} Bild{order.items.length !== 1 ? "er" : ""} ·{" "}
              {formatEuro(order.totalCents)}
            </span>
          </div>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={orderDetailHref}>
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            Details
          </Link>
        </Button>
      </div>

      <div className="mt-5">
        <OrderFlowTimeline order={order} layout="horizontal" />
      </div>

      {activeStep && !canDownload && (
        <p className="mt-4 text-sm text-slate-600">
          <span className="font-medium text-aqua-900">Aktuell: {activeStep.label}</span>
          {" – "}
          {activeStep.description}
        </p>
      )}

      {canDownload && (
        <div className="mt-4 rounded-xl border border-green-200 bg-white/80 p-4">
          <p className="text-sm font-medium text-green-900">
            {readyCount === order.items.length
              ? "Alle Bilder sind zum Download bereit."
              : `${readyCount} von ${order.items.length} Bildern zum Download bereit.`}
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {order.items
              .filter((i) => i.downloadUrl)
              .map((item) => (
                <li key={item.id}>
                  <Button asChild size="sm" variant={item.hasFinalFile === false ? "outline" : "default"}>
                    <a
                      href={downloadHref(item.downloadUrl!)}
                      download={item.filename}
                    >
                      <Download className="h-3.5 w-3.5" aria-hidden />
                      {item.filename}
                      {item.hasFinalFile === false ? "*" : ""}
                    </a>
                  </Button>
                </li>
              ))}
          </ul>
          {order.items.some((i) => i.hasFinalFile === false) && (
            <p className="mt-2 text-xs text-amber-700">
              * Vorläufiger Download – finale Datei ohne Wasserzeichen folgt nach Studio-Upload.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
