import Link from "next/link";
import {
  buildShootingsListUrl,
  type ShootingListView,
} from "@/lib/admin-shootings-list";
import { cn } from "@/lib/utils";

type Props = {
  view: ShootingListView;
  eventsCount: number;
  einzelCount: number;
  q?: string;
  status?: string;
  actions?: React.ReactNode;
};

export function ShootingAdminViewSwitcher({
  view,
  eventsCount,
  einzelCount,
  q,
  status,
  actions,
}: Props) {
  const eventsHref = buildShootingsListUrl({ ansicht: "events", q, status, page: 1 });
  const einzelHref = buildShootingsListUrl({ ansicht: "einzel", q, page: 1 });

  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Shooting-Ansicht"
        >
          <Link
            href={eventsHref}
            role="tab"
            aria-selected={view === "events"}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
              view === "events"
                ? "bg-white text-aqua-900 shadow-sm ring-1 ring-aqua-200"
                : "text-slate-600 hover:bg-white/70 hover:text-aqua-800",
            )}
          >
            Events
            <span className="ml-1.5 text-xs font-normal text-slate-500">({eventsCount})</span>
          </Link>
          <Link
            href={einzelHref}
            role="tab"
            aria-selected={view === "einzel"}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
              view === "einzel"
                ? "bg-white text-aqua-900 shadow-sm ring-1 ring-violet-200"
                : "text-slate-600 hover:bg-white/70 hover:text-aqua-800",
            )}
          >
            Einzelshootings
            <span className="ml-1.5 text-xs font-normal text-slate-500">({einzelCount})</span>
          </Link>
        </div>

        {actions}
      </div>
    </section>
  );
}
