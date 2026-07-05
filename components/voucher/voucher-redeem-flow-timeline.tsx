import { Check, Circle, Loader2 } from "lucide-react";
import {
  VOUCHER_REDEEM_FLOW_STEPS,
  computeVoucherRedeemFlowProgress,
  getVoucherRedeemFlowHeadline,
  type VoucherRedeemFlowInput,
  type VoucherRedeemFlowStepId,
} from "@/lib/voucher-redeem-workflow";
import { cn } from "@/lib/utils";

type Props = {
  voucher: VoucherRedeemFlowInput;
  preferredDate?: string | null;
  layout?: "horizontal" | "vertical";
  compact?: boolean;
  showHeadline?: boolean;
  className?: string;
};

export function VoucherRedeemFlowTimeline({
  voucher,
  preferredDate,
  layout = "horizontal",
  compact = false,
  showHeadline = true,
  className,
}: Props) {
  const progress = computeVoucherRedeemFlowProgress(voucher);
  const headline = getVoucherRedeemFlowHeadline(voucher);
  const paymentPending = voucher.status === "PENDING_PAYMENT";

  const stepDescription = (stepId: VoucherRedeemFlowStepId, description: string) => {
    if (stepId === "confirm" && progress.confirm === "active" && preferredDate) {
      return `Wunschtermin: ${new Date(`${preferredDate}T12:00:00`).toLocaleDateString("de-DE")} – wir melden uns zur Bestätigung`;
    }
    return description;
  };

  const timeline =
    layout === "horizontal" ? (
      <ol
        className={cn(
          "relative flex min-w-0 justify-between gap-1 overflow-x-auto pb-1",
          className,
        )}
        aria-label="Einlösung-Fortschritt"
      >
        <div
          className="pointer-events-none absolute left-4 right-4 top-4 h-0.5 bg-slate-200"
          aria-hidden
        />
        {VOUCHER_REDEEM_FLOW_STEPS.map((step, index) => {
          const state = progress[step.id];
          return (
            <li
              key={step.id}
              className="relative z-10 flex min-w-[4rem] flex-1 flex-col items-center px-0.5 sm:min-w-[5rem]"
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
    ) : (
      <ol className={cn("space-y-3", className)} aria-label="Einlösung-Fortschritt">
        {VOUCHER_REDEEM_FLOW_STEPS.map((step, index) => {
          const state = progress[step.id];
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
                  <p className="mt-0.5 text-xs text-slate-500">
                    {stepDescription(step.id, step.description)}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    );

  return (
    <div className="space-y-3">
      {showHeadline && (
        <div>
          <p className="text-sm font-medium text-aqua-900">{headline}</p>
          {paymentPending && (
            <p className="mt-1 text-xs text-amber-800">
              Nach Zahlungseingang können Sie hier einlösen – der Ablauf startet dann bei Schritt
              1.
            </p>
          )}
        </div>
      )}
      {timeline}
    </div>
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

function toVoucherRedeemFlowInput(voucher: {
  status: string;
  confirmedDate: string | null;
  gallery: { galleryReady: boolean } | null;
}): VoucherRedeemFlowInput {
  return {
    status: voucher.status,
    confirmedDate: voucher.confirmedDate,
    galleryReady: voucher.gallery?.galleryReady ?? false,
  };
}

export function VoucherRedeemFlowStatusCard({
  voucher,
  preferredDate,
  className,
}: {
  voucher: {
    status: string;
    confirmedDate: string | null;
    gallery: { galleryReady: boolean } | null;
  };
  preferredDate?: string | null;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-aqua-100 bg-white p-4 shadow-sm sm:p-6",
        className,
      )}
    >
      <h2 className="sr-only">Einlösung-Status</h2>
      <VoucherRedeemFlowTimeline
        voucher={toVoucherRedeemFlowInput(voucher)}
        preferredDate={preferredDate}
        layout="horizontal"
      />
    </section>
  );
}
