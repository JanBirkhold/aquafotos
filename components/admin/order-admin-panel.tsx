"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, Download, Loader2, Play, Upload } from "lucide-react";
import { NotificationComposeDialog } from "@/components/admin/notification-compose-dialog";
import { OrderFlowTimeline } from "@/components/orders/order-flow-timeline";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  getOrderReadyNotificationVariables,
  markAllOrderItemsReady,
  notifyOrderReady,
  startOrderProcessing,
  updateOrderItemStatus,
  uploadOrderItemFinal,
} from "@/lib/actions/orders";
import { EMAIL_TEMPLATE_KEYS } from "@/lib/email-template-definitions";
import {
  orderItemStatusColors,
  orderItemStatusLabels,
  orderStatusColors,
  orderStatusLabels,
} from "@/lib/order-workflow";
import { formatEuro } from "@/lib/pricing";
import type { OrderItemStatus, OrderStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

export type AdminOrderDetail = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  isReorder: boolean;
  customerEmail: string | null;
  totalCents: number;
  paidAt: string | null;
  processingStartedAt: string | null;
  readyNotifiedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  participantName: string | null;
  parentName: string | null;
  items: {
    id: string;
    position: number;
    priceCents: number;
    status: OrderItemStatus;
    filename: string;
    previewUrl: string;
    downloadUrl: string | null;
    hasFinalFile: boolean;
    readyAt: string | null;
    isReorderItem: boolean;
  }[];
};

const ITEM_STATUSES: OrderItemStatus[] = [
  "AWAITING_PROCESSING",
  "IN_PROCESSING",
  "IN_REVIEW",
  "READY",
];

export function OrderAdminPanel({ order }: { order: AdminOrderDetail }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [compose, setCompose] = useState<{
    templateKey: string;
    variables: Record<string, string>;
    recipientLabel: string;
  } | null>(null);

  async function openNotifyDialog() {
    const ctx = await getOrderReadyNotificationVariables(order.id);
    setCompose({
      templateKey: EMAIL_TEMPLATE_KEYS.ORDER_READY,
      variables: ctx.variables,
      recipientLabel: ctx.recipientLabel,
    });
  }

  return (
    <div className="space-y-8">
      {message && (
        <p className="rounded-xl bg-aqua-50 px-4 py-3 text-sm text-aqua-800" role="status">
          {message}
        </p>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/admin/bestellungen" className="text-sm text-aqua-600 hover:underline">
            ← Bestellungen
          </Link>
          <h1 className="mt-2 font-display text-3xl font-bold text-aqua-900">
            {order.orderNumber}
          </h1>
          <p className="mt-1 text-slate-600">
            {order.participantName ?? "—"} · {order.parentName ?? "—"} ·{" "}
            {order.customerEmail ?? "keine E-Mail"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span
            className={cn(
              "rounded-full px-3 py-1 text-sm font-medium",
              orderStatusColors[order.status],
            )}
          >
            {orderStatusLabels[order.status]}
          </span>
          {order.isReorder && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-900">
              Nachbestellung
            </span>
          )}
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
            {formatEuro(order.totalCents)}
          </span>
        </div>
      </div>

      {order.isReorder && (
        <p className="rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm text-amber-950">
          Diese Bestellung ist eine <span className="font-medium">Nachbestellung</span> – der Kunde
          hat mindestens ein Bild erneut bestellt. Bitte wie eine reguläre Bestellung bearbeiten.
        </p>
      )}

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-aqua-900">Ablauf</h2>
        <p className="mt-1 text-sm text-slate-500">
          Auswahl → Bearbeitung → Sichtung → Benachrichtigung → Download
        </p>
        <div className="mt-4">
          <OrderFlowTimeline order={order} />
        </div>
      </section>

      <section className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending || order.status === "PROCESSING"}
          onClick={() =>
            startTransition(async () => {
              await startOrderProcessing(order.id);
              setMessage("Bearbeitung gestartet.");
            })
          }
        >
          <Play className="mr-2 h-4 w-4" aria-hidden />
          Bearbeitung starten
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await markAllOrderItemsReady(order.id);
              setMessage("Alle Bilder als fertig markiert.");
            })
          }
        >
          Alle fertig
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={pending}
          onClick={() => openNotifyDialog()}
        >
          <Bell className="mr-2 h-4 w-4" aria-hidden />
          Kunde benachrichtigen
        </Button>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-aqua-900">
          Fotos zur Bearbeitung ({order.items.length})
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {order.items.map((item) => (
            <li key={item.id} className="overflow-hidden rounded-xl border border-slate-100">
              <div className="relative aspect-[3/4] bg-slate-100">
                <Image
                  src={item.previewUrl}
                  alt={item.filename}
                  fill
                  className="object-cover"
                  sizes="200px"
                  unoptimized={item.previewUrl.startsWith("/uploads/")}
                />
                <span className="absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
                  #{item.position}
                </span>
              </div>
              <div className="space-y-2 p-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="min-w-0 truncate text-xs font-medium text-slate-700">
                    {item.filename}
                  </p>
                  {item.isReorderItem && (
                    <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-900">
                      Nachbestellung
                    </span>
                  )}
                </div>
                <Label htmlFor={`status-${item.id}`} className="text-xs text-slate-500">
                  Status
                </Label>
                <select
                  id={`status-${item.id}`}
                  className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                  value={item.status}
                  disabled={pending}
                  onChange={(e) =>
                    startTransition(async () => {
                      await updateOrderItemStatus(
                        item.id,
                        e.target.value as OrderItemStatus,
                      );
                      setMessage("Foto-Status aktualisiert.");
                    })
                  }
                >
                  {ITEM_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {orderItemStatusLabels[s]}
                    </option>
                  ))}
                </select>
                <span
                  className={cn(
                    "inline-block rounded-full px-2 py-0.5 text-[10px] font-medium",
                    orderItemStatusColors[item.status],
                  )}
                >
                  {orderItemStatusLabels[item.status]}
                </span>

                {item.downloadUrl ? (
                  <Button asChild size="sm" variant="outline" className="w-full">
                    <a href={item.downloadUrl} download={item.filename}>
                      <Download className="mr-1 h-3 w-3" aria-hidden />
                      {item.hasFinalFile ? "Final prüfen" : "Download prüfen"}
                    </a>
                  </Button>
                ) : (
                  <label className="flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-dashed border-aqua-200 bg-aqua-50/30 px-2 py-2 text-xs text-aqua-800 hover:bg-aqua-50">
                    <Upload className="h-3 w-3" aria-hidden />
                    Fertiges Bild hochladen
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      disabled={pending}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const fd = new FormData();
                        fd.set("itemId", item.id);
                        fd.set("file", file);
                        startTransition(async () => {
                          const res = await uploadOrderItemFinal(fd);
                          setMessage(res.error ?? "Fertiges Bild hochgeladen.");
                        });
                        e.target.value = "";
                      }}
                    />
                  </label>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {compose && (
        <NotificationComposeDialog
          open={!!compose}
          onOpenChange={(open) => {
            if (!open) setCompose(null);
          }}
          templateKey={compose.templateKey}
          variables={compose.variables}
          title="Bestellung fertig – Kunde benachrichtigen"
          description="E-Mail mit Download-Link und Bestellstatus."
          recipientLabel={compose.recipientLabel}
          onConfirm={(draft) =>
            new Promise<void>((resolve) => {
              startTransition(async () => {
                await notifyOrderReady(order.id, draft);
                setMessage("Kunde benachrichtigt.");
                setCompose(null);
                resolve();
              });
            })
          }
        />
      )}

      {pending && (
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Wird gespeichert…
        </p>
      )}
    </div>
  );
}
