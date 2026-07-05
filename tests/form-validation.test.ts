import { describe, expect, it } from "vitest";
import { ShootingType } from "@prisma/client";
import {
  parseEuroCents,
  parsePricingInput,
  parseShootingType,
} from "@/lib/form-validation";

describe("parseEuroCents", () => {
  it("converts euro strings to cents", () => {
    expect(parseEuroCents("35")).toBe(3500);
    expect(parseEuroCents(25.5)).toBe(2550);
  });

  it("rejects invalid values", () => {
    expect(parseEuroCents("")).toBeNull();
    expect(parseEuroCents("abc")).toBeNull();
    expect(parseEuroCents(-1)).toBeNull();
    expect(parseEuroCents(Number.NaN)).toBeNull();
  });
});

describe("parsePricingInput", () => {
  it("accepts valid admin pricing form data", () => {
    const result = parsePricingInput({
      firstImagePrice: "35",
      secondImagePrice: "25",
      additionalPrice: "15",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.pricing).toEqual({
        firstImagePrice: 3500,
        secondImagePrice: 2500,
        additionalPrice: 1500,
      });
    }
  });

  it("rejects NaN admin input", () => {
    const result = parsePricingInput({
      firstImagePrice: "foo",
      secondImagePrice: "25",
      additionalPrice: "15",
    });
    expect(result).toEqual({ ok: false, error: "Bitte gültige Preise eingeben." });
  });
});

describe("parseShootingType", () => {
  it("accepts valid prisma enum values", () => {
    expect(parseShootingType(ShootingType.UNDERWATER_BABY)).toBe(
      ShootingType.UNDERWATER_BABY,
    );
  });

  it("rejects missing or invalid Radix select values", () => {
    expect(parseShootingType(null)).toBeNull();
    expect(parseShootingType("")).toBeNull();
    expect(parseShootingType("unterwasser")).toBeNull();
  });
});

describe("validatePricingCents", () => {
  it("rejects NaN cent values from broken admin math", async () => {
    const { validatePricingCents } = await import("@/lib/form-validation");
    expect(
      validatePricingCents({
        firstImagePrice: Number.NaN,
        secondImagePrice: 2500,
        additionalPrice: 1500,
      }),
    ).toEqual({ ok: false, error: "Bitte gültige Preise eingeben." });
  });
});
