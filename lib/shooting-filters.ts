import type { ShootingCategory } from "@prisma/client";

export const shootingFilterOptions: {
  value: string;
  label: string;
  category?: ShootingCategory;
}[] = [
  { value: "alle", label: "Alle Termine" },
  { value: "unterwasser", label: "Unterwasser", category: "UNDERWATER" },
  { value: "kita", label: "Kita", category: "KITA" },
  { value: "baby", label: "Baby", category: "BABY" },
  { value: "familie", label: "Familie", category: "FAMILY" },
  { value: "aktionen", label: "Aktionen", category: "SEASONAL" },
];

export function categoryFromSlug(slug: string | undefined): ShootingCategory | null {
  if (!slug || slug === "alle") return null;
  const match = shootingFilterOptions.find((o) => o.value === slug);
  return match?.category ?? null;
}

export function filterLabelFromSlug(slug: string | undefined): string | null {
  if (!slug || slug === "alle") return null;
  return shootingFilterOptions.find((o) => o.value === slug)?.label ?? null;
}
