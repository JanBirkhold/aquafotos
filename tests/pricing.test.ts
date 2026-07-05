import { describe, expect, it } from "vitest";
import {
  calculatePhotoTotal,
  DEFAULT_PRICING,
  getPricingBreakdown,
} from "@/lib/pricing";

describe("calculatePhotoTotal", () => {
  it("returns 0 for empty selection", () => {
    expect(calculatePhotoTotal(0)).toBe(0);
    expect(calculatePhotoTotal(-1)).toBe(0);
  });

  it("applies tiered pricing", () => {
    const pricing = {
      firstImagePrice: 3500,
      secondImagePrice: 2500,
      additionalPrice: 1500,
    };
    expect(calculatePhotoTotal(1, pricing)).toBe(3500);
    expect(calculatePhotoTotal(2, pricing)).toBe(6000);
    expect(calculatePhotoTotal(5, pricing)).toBe(10500);
  });

  it("uses default pricing when omitted", () => {
    expect(calculatePhotoTotal(3, DEFAULT_PRICING)).toBe(
      DEFAULT_PRICING.firstImagePrice +
        DEFAULT_PRICING.secondImagePrice +
        DEFAULT_PRICING.additionalPrice,
    );
  });
});

describe("getPricingBreakdown", () => {
  it("returns line items matching total", () => {
    const count = 4;
    const items = getPricingBreakdown(count);
    const sum = items.reduce((acc, item) => acc + item.cents, 0);
    expect(sum).toBe(calculatePhotoTotal(count));
    expect(items).toHaveLength(3);
  });
});
