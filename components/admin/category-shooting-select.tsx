"use client";

import { useMemo, useState } from "react";
import { shootingCategoryLabels, categoryShootingTypes, shootingTypeLabels } from "@/lib/shooting-types";
import type { ShootingCategory, ShootingType } from "@prisma/client";
import { Label } from "@/components/ui/label";

type Props = {
  defaultCategory?: ShootingCategory;
  defaultShootingType?: ShootingType;
};

export function CategoryShootingSelect({
  defaultCategory = "UNDERWATER",
  defaultShootingType,
}: Props) {
  const [category, setCategory] = useState<ShootingCategory>(defaultCategory);

  const shootingTypes = useMemo(
    () => categoryShootingTypes[category] ?? [],
    [category],
  );

  const resolvedDefaultType =
    defaultShootingType && shootingTypes.includes(defaultShootingType)
      ? defaultShootingType
      : shootingTypes[0];

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="category">Event-Kategorie (Website-Zuordnung)</Label>
        <select
          id="category"
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as ShootingCategory)}
          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
          required
        >
          {Object.entries(shootingCategoryLabels).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-500">
          Bestimmt Filter auf „Termine finden“ und Kategorie auf der Website
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="shootingType">Shooting-Art</Label>
        <select
          id="shootingType"
          name="shootingType"
          key={category}
          defaultValue={resolvedDefaultType}
          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
          required
        >
          {shootingTypes.map((type) => (
            <option key={type} value={type}>
              {shootingTypeLabels[type]}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
