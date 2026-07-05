"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { SHOOTING_INFO_CATEGORIES, type ShootingInfoSlug } from "@/lib/shooting-info-content";

type Props = {
  activeSlug?: ShootingInfoSlug;
  className?: string;
};

export function ShootingInfoCategoryNav({ activeSlug, className }: Props) {
  return (
    <nav
      className={cn("flex flex-wrap justify-center gap-2", className)}
      aria-label="Shooting-Kategorien"
    >
      {SHOOTING_INFO_CATEGORIES.map((cat) => (
        <Link
          key={cat.slug}
          href={`/info?kategorie=${cat.slug}`}
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
            activeSlug === cat.slug
              ? "border-aqua-600 bg-aqua-600 text-white"
              : "border-aqua-200 bg-white text-aqua-800 hover:border-aqua-400 hover:bg-aqua-50",
          )}
        >
          {cat.label}
        </Link>
      ))}
      <Link
        href="/info#preise"
        className="rounded-full border border-aqua-200 bg-white px-4 py-2 text-sm font-medium text-aqua-800 transition-colors hover:border-aqua-400 hover:bg-aqua-50"
      >
        Preise
      </Link>
      <Link
        href="/info#faq"
        className="rounded-full border border-aqua-200 bg-white px-4 py-2 text-sm font-medium text-aqua-800 transition-colors hover:border-aqua-400 hover:bg-aqua-50"
      >
        FAQ
      </Link>
    </nav>
  );
}
