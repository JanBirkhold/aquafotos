import { Check, Circle, Loader2 } from "lucide-react";
import {
  ORDER_FLOW_STEPS,
  computeOrderFlowProgress,
  type OrderFlowStepId,
} from "@/lib/order-workflow";
import type { OrderItemStatus, OrderStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

export type OrderFlowTimelineOrder = {
  status: OrderStatus;
  paidAt: string | null;
  processingStartedAt: string | null;
  readyNotifiedAt: string | null;
  deliveredAt: string | null;
  items: {
    status: OrderItemStatus;
    finalStorageKey?: string | null;
    downloadUrl?: string | null;
  }[];
};

type Props = {
  order: OrderFlowTimelineOrder;
  layout?: "grid" | "vertical" | "horizontal";
  compact?: boolean;
};

export function OrderFlowTimeline({
  order,
  layout = "grid",
  compact = false,
}: Props) {
  const progress = computeOrderFlowProgress({
    status: order.status,
    paidAt: order.paidAt ? new Date(order.paidAt) : null,
    processingStartedAt: order.processingStartedAt
      ? new Date(order.processingStartedAt)
      : null,
    readyNotifiedAt: order.readyNotifiedAt ? new Date(order.readyNotifiedAt) : null,
    deliveredAt: order.deliveredAt ? new Date(order.deliveredAt) : null,
    items: order.items.map((i) => ({
      status: i.status,
      finalStorageKey: i.finalStorageKey ?? i.downloadUrl ?? null,
    })),
  });

  if (layout === "horizontal") {
    return (
      <ol
        className="relative flex min-w-0 justify-between gap-1 overflow-x-auto pb-1"
        aria-label="Bestellablauf"
      >
        <div
          className="pointer-events-none absolute left-4 right-4 top-4 h-0.5 bg-slate-200"
          aria-hidden
        />
        {ORDER_FLOW_STEPS.map((step, index) => {
          const state = progress[step.id as OrderFlowStepId];
          return (
            <li
              key={step.id}
              className="relative z-10 flex min-w-[4.75rem] flex-1 flex-col items-center px-0.5"
            >
              <StepIcon state={state} stepNumber={index + 1} size="sm" />
              <p
                className={cn(
                  "mt-2 text-center text-[11px] font-medium leading-tight sm:text-xs",
                  state === "done" && "text-green-800",
                  state === "active" && "text-aqua-800",
                  state === "pending" && "text-slate-500",
                )}
              >
                {step.label}
              </p>
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <ol
      className={cn(
        layout === "vertical" || compact
          ? "space-y-3"
          : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
      )}
      aria-label="Bestellablauf"
    >
      {ORDER_FLOW_STEPS.map((step, index) => {
        const state = progress[step.id as OrderFlowStepId];
        return (
          <li
            key={step.id}
            className={cn(
              "relative flex gap-3 rounded-xl border p-3",
              state === "done" && "border-green-200 bg-green-50/50",
              state === "active" && "border-aqua-300 bg-aqua-50/60 ring-1 ring-aqua-200",
              state === "pending" && "border-slate-100 bg-slate-50/50 opacity-80",
            )}
          >
            <StepIcon state={state} stepNumber={index + 1} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-aqua-900">{step.label}</p>
              {!compact && (
                <p className="mt-0.5 text-xs text-slate-500">{step.description}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function StepIcon({
  state,
  stepNumber,
  size = "md",
}: {
  state: "done" | "active" | "pending";
  stepNumber: number;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-8 w-8" : "h-8 w-8";
  const icon = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  if (state === "done") {
    return (
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full bg-green-600 text-white",
          dim,
        )}
      >
        <Check className={icon} aria-hidden />
      </span>
    );
  }
  if (state === "active") {
    return (
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full bg-aqua-600 text-white",
          dim,
        )}
      >
        <Loader2 className={cn(icon, "animate-spin")} aria-hidden />
      </span>
    );
  }
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600",
        dim,
      )}
    >
      <Circle className="h-3 w-3" aria-hidden />
      <span className="sr-only">Schritt {stepNumber}</span>
    </span>
  );
}
