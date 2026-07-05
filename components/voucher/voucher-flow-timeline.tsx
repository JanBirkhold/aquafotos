import { Check, Circle, Loader2 } from "lucide-react";
import {
  VOUCHER_FLOW_STEPS,
  computeVoucherFlowProgress,
  type VoucherFlowInput,
  type VoucherFlowStepId,
} from "@/lib/voucher-workflow";
import { cn } from "@/lib/utils";

type Props = {
  voucher: VoucherFlowInput;
  layout?: "horizontal" | "vertical";
  compact?: boolean;
  className?: string;
};

export function VoucherFlowTimeline({
  voucher,
  layout = "horizontal",
  compact = false,
  className,
}: Props) {
  const progress = computeVoucherFlowProgress(voucher);

  if (layout === "horizontal") {
    return (
      <ol
        className={cn(
          "relative flex min-w-0 justify-between gap-1 overflow-x-auto pb-1",
          className,
        )}
        aria-label="Gutschein-Ablauf"
      >
        <div
          className="pointer-events-none absolute left-4 right-4 top-4 h-0.5 bg-slate-200"
          aria-hidden
        />
        {VOUCHER_FLOW_STEPS.map((step, index) => {
          const state = progress[step.id as VoucherFlowStepId];
          return (
            <li
              key={step.id}
              className="relative z-10 flex min-w-[3.5rem] flex-1 flex-col items-center px-0.5 sm:min-w-[4.75rem]"
            >
              <StepIcon state={state} stepNumber={index + 1} size="sm" />
              <p
                className={cn(
                  "mt-2 text-center text-[10px] font-medium leading-tight sm:text-xs",
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
    <ol className={cn("space-y-3", className)} aria-label="Gutschein-Ablauf">
      {VOUCHER_FLOW_STEPS.map((step, index) => {
        const state = progress[step.id as VoucherFlowStepId];
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
  const dim = "h-8 w-8";
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
