"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { parsePricingInput } from "@/lib/form-validation";
import { formatEuro, calculatePhotoTotal, type PricingTier } from "@/lib/pricing";
import { updatePricing } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  pricing: PricingTier;
};

export function PhotoPricingPanel({ pricing }: Props) {
  const [state, action, pending] = useActionState(
    async (_p: { success?: boolean; error?: string } | null, fd: FormData) => {
      const parsed = parsePricingInput({
        firstImagePrice: fd.get("first"),
        secondImagePrice: fd.get("second"),
        additionalPrice: fd.get("additional"),
      });

      if (!parsed.ok) {
        return { error: parsed.error };
      }

      const result = await updatePricing(parsed.pricing);
      if (result?.error) return { error: result.error };
      return { success: true };
    },
    null,
  );

  const exampleTotal = calculatePhotoTotal(5, pricing);

  return (
    <section className="max-w-lg space-y-4">
      <div>
        <h2 className="font-display text-2xl font-bold text-aqua-900">Bildpreise (Staffel)</h2>
        <p className="mt-1 text-sm text-slate-600">
          Gilt für Foto-Bestellungen in der Galerie – automatische Berechnung im Warenkorb.
        </p>
      </div>

      <form action={action} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="first">Erstes Bild (€)</Label>
          <Input
            id="first"
            name="first"
            type="number"
            step="0.01"
            min="0.01"
            defaultValue={pricing.firstImagePrice / 100}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="second">Zweites Bild (€)</Label>
          <Input
            id="second"
            name="second"
            type="number"
            step="0.01"
            min="0.01"
            defaultValue={pricing.secondImagePrice / 100}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="additional">Jedes weitere Bild (€)</Label>
          <Input
            id="additional"
            name="additional"
            type="number"
            step="0.01"
            min="0.01"
            defaultValue={pricing.additionalPrice / 100}
            required
          />
        </div>

        <div className="rounded-xl bg-aqua-50 p-4 text-sm text-slate-600">
          <p>Beispiel 5 Bilder: {formatEuro(exampleTotal)}</p>
        </div>

        {state?.error && (
          <p className="text-sm text-red-600" role="alert">
            {state.error}
          </p>
        )}
        {state?.success && (
          <p className="text-sm text-aqua-700" role="status">
            Bildpreise gespeichert.
          </p>
        )}

        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Speichern…
            </>
          ) : (
            "Bildpreise speichern"
          )}
        </Button>
      </form>
    </section>
  );
}
