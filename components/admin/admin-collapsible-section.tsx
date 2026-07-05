"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description?: string;
  count: number;
  defaultOpen?: boolean;
  tone?: "green" | "violet" | "amber" | "default";
  children: React.ReactNode;
};

const toneStyles = {
  green: "border-green-200 bg-green-50/40",
  violet: "border-violet-200 bg-violet-50/50",
  amber: "border-amber-200 bg-amber-50/50",
  default: "border-slate-200 bg-white",
};

export function AdminCollapsibleSection({
  title,
  description,
  count,
  defaultOpen = false,
  tone = "default",
  children,
}: Props) {
  return (
    <details
      className={cn("group rounded-2xl border p-5", toneStyles[tone])}
      open={defaultOpen || undefined}
    >
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold text-aqua-900">{title}</h2>
          {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
        </div>
        <span className="flex shrink-0 items-center gap-2 text-sm text-slate-500">
          <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-medium text-slate-700">
            {count}
          </span>
          <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden />
        </span>
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}
