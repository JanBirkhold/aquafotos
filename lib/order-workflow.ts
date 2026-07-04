import type { OrderItemStatus, OrderStatus } from "@prisma/client";

export const ORDER_FLOW_STEPS = [
  {
    id: "selection",
    label: "Auswahl",
    description: "Bilder in der Galerie ausgewählt und bestellt",
  },
  {
    id: "paid",
    label: "Bestellt",
    description: "Zahlung eingegangen – Bearbeitung wird geplant",
  },
  {
    id: "processing",
    label: "Bearbeitung",
    description: "Entfernung Wasserzeichen, Retusche, Export in Druckqualität",
  },
  {
    id: "review",
    label: "Sichtung",
    description: "Qualitätskontrolle vor Freigabe",
  },
  {
    id: "notification",
    label: "Benachrichtigung",
    description: "Sie erhalten eine E-Mail, sobald Ihre Bilder bereitstehen",
  },
  {
    id: "download",
    label: "Download",
    description: "Fertige Bilder ohne Wasserzeichen herunterladen",
  },
] as const;

export type OrderFlowStepId = (typeof ORDER_FLOW_STEPS)[number]["id"];

export const orderStatusLabels: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Zahlung ausstehend",
  PAID: "Bezahlt",
  PROCESSING: "In Bearbeitung",
  READY: "Bereit zum Download",
  DELIVERED: "Ausgeliefert",
  CANCELLED: "Storniert",
};

export const orderStatusColors: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "bg-amber-100 text-amber-800",
  PAID: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-violet-100 text-violet-800",
  READY: "bg-green-100 text-green-800",
  DELIVERED: "bg-slate-100 text-slate-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export const orderItemStatusLabels: Record<OrderItemStatus, string> = {
  AWAITING_PROCESSING: "Wartet auf Bearbeitung",
  IN_PROCESSING: "In Bearbeitung",
  IN_REVIEW: "Sichtung / QC",
  READY: "Fertig",
};

export const orderItemStatusColors: Record<OrderItemStatus, string> = {
  AWAITING_PROCESSING: "bg-slate-100 text-slate-700",
  IN_PROCESSING: "bg-violet-100 text-violet-800",
  IN_REVIEW: "bg-amber-100 text-amber-800",
  READY: "bg-green-100 text-green-800",
};

export function computeOrderFlowProgress(order: {
  status: OrderStatus;
  paidAt: Date | null;
  processingStartedAt: Date | null;
  readyNotifiedAt: Date | null;
  deliveredAt: Date | null;
  items: { status: OrderItemStatus; finalStorageKey: string | null }[];
}): Record<OrderFlowStepId, "done" | "active" | "pending"> {
  const hasPaid = order.status !== "PENDING_PAYMENT" && order.status !== "CANCELLED";
  const anyProcessing = order.items.some(
    (i) => i.status === "IN_PROCESSING" || i.status === "IN_REVIEW" || i.status === "READY",
  );
  const anyReview = order.items.some((i) => i.status === "IN_REVIEW" || i.status === "READY");
  const allReady =
    order.items.length > 0 && order.items.every((i) => i.status === "READY");
  const notified = !!order.readyNotifiedAt;
  const downloadable =
    allReady && (order.status === "READY" || order.status === "DELIVERED");

  return {
    selection: hasPaid ? "done" : "pending",
    paid: hasPaid ? "done" : order.status === "PENDING_PAYMENT" ? "active" : "pending",
    processing:
      order.status === "PROCESSING" || anyProcessing
        ? allReady
          ? "done"
          : "active"
        : hasPaid
          ? "pending"
          : "pending",
    review: anyReview ? (allReady ? "done" : "active") : "pending",
    notification: notified ? "done" : allReady ? "active" : "pending",
    download: downloadable ? "done" : allReady ? "active" : "pending",
  };
}

export function getActiveOrderFlowStep(order: {
  status: OrderStatus;
  paidAt: Date | null;
  processingStartedAt: Date | null;
  readyNotifiedAt: Date | null;
  deliveredAt: Date | null;
  items: { status: OrderItemStatus; finalStorageKey: string | null }[];
}): (typeof ORDER_FLOW_STEPS)[number] | null {
  const progress = computeOrderFlowProgress(order);
  const active = ORDER_FLOW_STEPS.find((step) => progress[step.id] === "active");
  if (active) return active;

  const allDone = ORDER_FLOW_STEPS.every((step) => progress[step.id] === "done");
  if (allDone) return ORDER_FLOW_STEPS[ORDER_FLOW_STEPS.length - 1];

  return ORDER_FLOW_STEPS.find((step) => progress[step.id] === "pending") ?? null;
}

export function syncOrderStatusFromItems(
  items: { status: OrderItemStatus }[],
  current: OrderStatus,
): OrderStatus {
  if (current === "CANCELLED" || current === "PENDING_PAYMENT") return current;
  if (items.length === 0) return current;

  const allReady = items.every((i) => i.status === "READY");
  const anyActive = items.some(
    (i) =>
      i.status === "IN_PROCESSING" ||
      i.status === "IN_REVIEW" ||
      i.status === "AWAITING_PROCESSING",
  );

  if (allReady) return "READY";
  if (anyActive) return "PROCESSING";
  return current;
}
