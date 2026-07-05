"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type View = "all" | "confirmed";

type Props = {
  allCount: number;
  confirmedCount: number;
  all: React.ReactNode;
  confirmed: React.ReactNode;
};

export function VoucherAdminViewSwitcher({
  allCount,
  confirmedCount,
  all,
  confirmed,
}: Props) {
  const [view, setView] = useState<View>("all");

  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div
        className="flex flex-wrap gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-3"
        role="tablist"
        aria-label="Gutschein-Ansicht"
      >
        <button
          type="button"
          role="tab"
          aria-selected={view === "all"}
          className={cn(
            "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
            view === "all"
              ? "bg-white text-aqua-900 shadow-sm ring-1 ring-aqua-200"
              : "text-slate-600 hover:bg-white/70 hover:text-aqua-800",
          )}
          onClick={() => setView("all")}
        >
          Alle Gutscheine
          <span className="ml-1.5 text-xs font-normal text-slate-500">({allCount})</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "confirmed"}
          className={cn(
            "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
            view === "confirmed"
              ? "bg-white text-aqua-900 shadow-sm ring-1 ring-green-200"
              : "text-slate-600 hover:bg-white/70 hover:text-aqua-800",
          )}
          onClick={() => setView("confirmed")}
        >
          Bestätigte Termine
          <span className="ml-1.5 text-xs font-normal text-slate-500">({confirmedCount})</span>
        </button>
      </div>

      <div role="tabpanel" className={view === "all" ? undefined : "hidden"}>
        {all}
      </div>
      <div role="tabpanel" className={view === "confirmed" ? undefined : "hidden"}>
        {confirmed}
      </div>
    </section>
  );
}
