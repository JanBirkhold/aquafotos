"use client";

import { useActionState } from "react";
import { formatEuro, DEFAULT_PRICING } from "@/lib/pricing";
import { updatePricing } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminPreisePage() {
  const [state, action, pending] = useActionState(
    async (_p: { success?: boolean } | null, fd: FormData) => {
      await updatePricing({
        firstImagePrice: Math.round(Number(fd.get("first")) * 100),
        secondImagePrice: Math.round(Number(fd.get("second")) * 100),
        additionalPrice: Math.round(Number(fd.get("additional")) * 100),
      });
      return { success: true };
    },
    null,
  );

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="font-display text-3xl font-bold text-aqua-900">
        Preisverwaltung
      </h1>
      <p className="text-slate-600">
        Staffelpreise werden automatisch im Warenkorb berechnet.
      </p>

      <form action={action} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="first">Erstes Bild (€)</Label>
          <Input
            id="first"
            name="first"
            type="number"
            step="0.01"
            defaultValue={DEFAULT_PRICING.firstImagePrice / 100}
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
            defaultValue={DEFAULT_PRICING.secondImagePrice / 100}
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
            defaultValue={DEFAULT_PRICING.additionalPrice / 100}
            required
          />
        </div>

        <div className="rounded-xl bg-aqua-50 p-4 text-sm text-slate-600">
          <p>Beispiel 5 Bilder: {formatEuro(3500 + 2500 + 3 * 1500)}</p>
        </div>

        {state?.success && (
          <p className="text-sm text-aqua-700">Preise gespeichert.</p>
        )}

        <Button type="submit" disabled={pending}>
          Speichern
        </Button>
      </form>
    </div>
  );
}
