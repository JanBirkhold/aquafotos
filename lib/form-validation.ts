import { ShootingType } from "@prisma/client";
import type { PricingTier } from "@/lib/pricing";

export function parseEuroCents(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

export function validatePricingCents(pricing: PricingTier):
  | { ok: true; pricing: PricingTier }
  | { ok: false; error: string } {
  const values = [
    pricing.firstImagePrice,
    pricing.secondImagePrice,
    pricing.additionalPrice,
  ];

  if (values.some((value) => !Number.isFinite(value) || value < 0)) {
    return { ok: false, error: "Bitte gültige Preise eingeben." };
  }

  return { ok: true, pricing };
}

export function parsePricingInput(data: {
  firstImagePrice: unknown;
  secondImagePrice: unknown;
  additionalPrice: unknown;
}):
  | { ok: true; pricing: PricingTier }
  | { ok: false; error: string } {
  const firstImagePrice = parseEuroCents(data.firstImagePrice);
  const secondImagePrice = parseEuroCents(data.secondImagePrice);
  const additionalPrice = parseEuroCents(data.additionalPrice);

  if (
    firstImagePrice === null ||
    secondImagePrice === null ||
    additionalPrice === null
  ) {
    return { ok: false, error: "Bitte gültige Preise eingeben." };
  }

  return validatePricingCents({
    firstImagePrice,
    secondImagePrice,
    additionalPrice,
  });
}

export function parseShootingType(value: unknown): ShootingType | null {
  if (typeof value !== "string" || !value.trim()) return null;
  if (Object.values(ShootingType).includes(value as ShootingType)) {
    return value as ShootingType;
  }
  return null;
}
