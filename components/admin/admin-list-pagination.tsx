import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ADMIN_SHOOTINGS_PAGE_SIZE,
  buildShootingsListUrl,
  type ShootingListView,
} from "@/lib/admin-shootings-list";
import { cn } from "@/lib/utils";

type Props = {
  page: number;
  totalPages: number;
  totalItems: number;
  view: ShootingListView;
  q?: string;
  status?: string;
};

export function AdminListPagination({
  page,
  totalPages,
  totalItems,
  view,
  q,
  status,
}: Props) {
  if (totalItems === 0) return null;

  const prevHref =
    page > 1
      ? buildShootingsListUrl({ ansicht: view, page: page - 1, q, status })
      : null;
  const nextHref =
    page < totalPages
      ? buildShootingsListUrl({ ansicht: view, page: page + 1, q, status })
      : null;

  const from = (page - 1) * ADMIN_SHOOTINGS_PAGE_SIZE + 1;
  const to = Math.min(page * ADMIN_SHOOTINGS_PAGE_SIZE, totalItems);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-600",
      )}
    >
      <p>
        {from}–{to} von {totalItems}
      </p>

      <div className="flex items-center gap-2">
        {prevHref ? (
          <Button asChild variant="outline" size="sm">
            <Link href={prevHref} aria-label="Vorherige Seite">
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Zurück
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Zurück
          </Button>
        )}

        <span className="min-w-[7rem] text-center tabular-nums">
          Seite {page} / {totalPages}
        </span>

        {nextHref ? (
          <Button asChild variant="outline" size="sm">
            <Link href={nextHref} aria-label="Nächste Seite">
              Weiter
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Weiter
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Button>
        )}
      </div>
    </div>
  );
}
