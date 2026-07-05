"use client";

import { useState } from "react";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  buildShootingsListUrl,
  type ShootingListView,
} from "@/lib/admin-shootings-list";
import { cn } from "@/lib/utils";

const eventStatusOptions = [
  { value: "", label: "Alle Status" },
  { value: "DRAFT", label: "Entwurf" },
  { value: "PUBLISHED", label: "Live" },
  { value: "FULL", label: "Voll" },
  { value: "COMPLETED", label: "Fertig" },
  { value: "CANCELLED", label: "Abgesagt" },
] as const;

type Props = {
  view: ShootingListView;
  q: string;
  status?: string;
  filteredCount: number;
  totalCount: number;
};

export function ShootingAdminFilter({ view, q, status, filteredCount, totalCount }: Props) {
  const hasFilters = Boolean(q || (view === "events" && status));
  const [open, setOpen] = useState(hasFilters);

  const resetHref = buildShootingsListUrl({ ansicht: view });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="flex items-center gap-2 text-sm font-medium text-aqua-900">
          <SlidersHorizontal className="h-4 w-4 text-aqua-600" aria-hidden />
          Suche & Filter
          {hasFilters && (
            <span className="rounded-full bg-aqua-100 px-2 py-0.5 text-xs font-normal text-aqua-800">
              aktiv
            </span>
          )}
        </span>
        <span className="flex items-center gap-2 text-xs text-slate-500">
          {hasFilters ? (
            <span>
              {filteredCount} Treffer
              {filteredCount !== totalCount ? ` von ${totalCount}` : ""}
            </span>
          ) : (
            <span>{totalCount} Einträge</span>
          )}
          <ChevronDown
            className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
            aria-hidden
          />
        </span>
      </button>

      {open && (
        <form
          method="get"
          className="space-y-4 border-t border-slate-100 px-4 py-4"
          action="/admin/shootings"
        >
          {view === "einzel" && <input type="hidden" name="ansicht" value="einzel" />}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block space-y-1.5 sm:col-span-2 lg:col-span-2">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Suche
              </span>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden
                />
                <Input
                  name="q"
                  defaultValue={q}
                  placeholder={
                    view === "events"
                      ? "Titel, Ort, Beschreibung …"
                      : "Name, E-Mail, Gutschein, Kaufnummer …"
                  }
                  className="pl-9"
                  autoComplete="off"
                />
              </div>
            </label>

            {view === "events" && (
              <label className="block space-y-1.5">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Status
                </span>
                <select
                  name="status"
                  defaultValue={status ?? ""}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {eventStatusOptions.map((option) => (
                    <option key={option.value || "all"} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" size="sm">
              <Search className="mr-1.5 h-4 w-4" aria-hidden />
              Anwenden
            </Button>
            {hasFilters && (
              <Button asChild type="button" variant="outline" size="sm">
                <Link href={resetHref}>
                  <X className="mr-1.5 h-4 w-4" aria-hidden />
                  Zurücksetzen
                </Link>
              </Button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
