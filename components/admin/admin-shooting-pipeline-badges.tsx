import { cn } from "@/lib/utils";
import {
  getAdminShootingPipelineSteps,
  type AdminPipelineStepState,
  type AdminShootingPipelineInput,
} from "@/lib/admin-shooting-pipeline-status";

type Props = {
  input: AdminShootingPipelineInput;
  layout?: "inline" | "stack";
  compact?: boolean;
  className?: string;
};

const stateStyles: Record<AdminPipelineStepState, string> = {
  done: "bg-green-100 text-green-800 border-green-200",
  active: "bg-aqua-100 text-aqua-900 border-aqua-200 ring-1 ring-aqua-200",
  pending: "bg-slate-100 text-slate-500 border-slate-200",
  warning: "bg-amber-100 text-amber-900 border-amber-200",
};

export function AdminShootingPipelineBadges({
  input,
  layout = "inline",
  compact = false,
  className,
}: Props) {
  const steps = getAdminShootingPipelineSteps(input);

  return (
    <ul
      className={cn(
        layout === "inline" ? "flex flex-wrap gap-1" : "space-y-1",
        className,
      )}
      aria-label="Shooting-Fortschritt"
    >
      {steps.map((step) => (
        <li key={step.id}>
          <span
            title={step.detail ? `${step.label}: ${step.detail}` : step.label}
            className={cn(
              "inline-flex max-w-full items-center gap-1 rounded-full border px-2 py-0.5 font-medium",
              compact ? "text-[10px]" : "text-[11px]",
              stateStyles[step.state],
            )}
          >
            <span>{step.label}</span>
            {step.detail && !compact && (
              <span className="truncate opacity-80">· {step.detail}</span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function AdminShootingPipelineSummary({
  input,
  className,
}: {
  input: AdminShootingPipelineInput;
  className?: string;
}) {
  const steps = getAdminShootingPipelineSteps(input);
  const active = steps.find((s) => s.state === "active");

  return (
    <div className={cn("space-y-1.5", className)}>
      {active && (
        <p className="text-xs font-medium text-aqua-900">
          Nächster Schritt: {active.detail ?? active.label}
        </p>
      )}
      <AdminShootingPipelineBadges input={input} compact />
    </div>
  );
}
