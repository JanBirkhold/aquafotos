export type PricingTier = {
  firstImagePrice: number;
  secondImagePrice: number;
  additionalPrice: number;
};

export const DEFAULT_PRICING: PricingTier = {
  firstImagePrice: 3500,
  secondImagePrice: 2500,
  additionalPrice: 1500,
};

export function calculatePhotoTotal(
  count: number,
  pricing: PricingTier = DEFAULT_PRICING,
): number {
  if (count <= 0) return 0;
  if (count === 1) return pricing.firstImagePrice;
  if (count === 2) return pricing.firstImagePrice + pricing.secondImagePrice;

  return (
    pricing.firstImagePrice +
    pricing.secondImagePrice +
    (count - 2) * pricing.additionalPrice
  );
}

export function formatEuro(cents: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function getPricingBreakdown(
  count: number,
  pricing: PricingTier = DEFAULT_PRICING,
): { label: string; cents: number }[] {
  if (count <= 0) return [];

  const items: { label: string; cents: number }[] = [
    { label: "1. Bild", cents: pricing.firstImagePrice },
  ];

  if (count >= 2) {
    items.push({ label: "2. Bild", cents: pricing.secondImagePrice });
  }

  if (count > 2) {
    items.push({
      label: `${count - 2}× weitere Bilder`,
      cents: (count - 2) * pricing.additionalPrice,
    });
  }

  return items;
}
