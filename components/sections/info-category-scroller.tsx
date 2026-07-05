"use client";

import { useEffect } from "react";
import type { ShootingInfoSlug } from "@/lib/shooting-info-content";

const VALID: ShootingInfoSlug[] = [
  "unterwasser",
  "kita",
  "baby",
  "familie",
  "aktionen",
];

const EXTRA_TARGETS = new Set(["preise", "faq"]);

function resolveTarget(category?: ShootingInfoSlug): string | null {
  if (category) return category;

  const hash = window.location.hash.slice(1);
  if (hash && (VALID.includes(hash as ShootingInfoSlug) || EXTRA_TARGETS.has(hash))) {
    return hash;
  }

  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get("kategorie");
  if (fromQuery && VALID.includes(fromQuery as ShootingInfoSlug)) return fromQuery;

  return null;
}

type Props = {
  category?: ShootingInfoSlug;
};

export function InfoCategoryScroller({ category }: Props) {
  useEffect(() => {
    const target = resolveTarget(category);
    if (!target) return;

    const timer = window.setTimeout(() => {
      document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);

    return () => window.clearTimeout(timer);
  }, [category]);

  return null;
}
