"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { shootingFilterOptions } from "@/lib/shooting-filters";
import { cn } from "@/lib/utils";

export function ShootingsCategoryFilter() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get("kategorie") ?? "alle";

  return (
    <nav
      className="flex flex-wrap gap-2"
      aria-label="Termine nach Kategorie filtern"
    >
      {shootingFilterOptions.map((opt) => {
        const href =
          opt.value === "alle"
            ? pathname
            : `${pathname}?kategorie=${opt.value}`;
        const isActive = active === opt.value;

        return (
          <Link
            key={opt.value}
            href={href}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-aqua-600 text-white shadow-sm"
                : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-aqua-50 hover:text-aqua-800",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {opt.label}
          </Link>
        );
      })}
    </nav>
  );
}
