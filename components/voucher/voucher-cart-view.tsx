"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, Trash2 } from "lucide-react";
import { createVoucherCheckout, removeVoucherFromCart } from "@/lib/actions/voucher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { getVoucherCartSummary } from "@/lib/voucher-queries";
import { formatEuro } from "@/lib/pricing";

type CartSummary = Awaited<ReturnType<typeof getVoucherCartSummary>>;

type Props = {
  cart: CartSummary;
};

export function VoucherCartView({ cart }: Props) {
  const [checkoutPending, startCheckoutTransition] = useTransition();
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function handleRemove(itemId: string) {
    if (removingId || checkoutPending) return;

    setRemovingId(itemId);
    try {
      const result = await removeVoucherFromCart(itemId);
      if (result.error) alert(result.error);
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <form
      className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_320px]"
      action={(fd) =>
        startCheckoutTransition(async () => {
          const items = cart.items.map((item) => ({
            itemId: item.id,
            recipientName: (fd.get(`recipientName-${item.id}`) as string) || undefined,
            personalMessage: (fd.get(`personalMessage-${item.id}`) as string) || undefined,
          }));

          const result = await createVoucherCheckout({
            buyerName: fd.get("buyerName") as string,
            buyerEmail: fd.get("buyerEmail") as string,
            bindingConfirmed: fd.get("bindingConfirmed") === "on",
            items,
          });

          if (result.error) {
            alert(result.error);
            return;
          }
          if (result.url) window.location.href = result.url;
        })
      }
    >
      <div className="space-y-4">
        {cart.items.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-aqua-100 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold text-aqua-900">{item.title}</h2>
                {item.shootingTypeLabel && (
                  <p className="text-sm text-slate-500">{item.shootingTypeLabel}</p>
                )}
                <p className="mt-1 text-sm font-semibold text-aqua-800">
                  {formatEuro(item.priceCents)}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={removingId === item.id || checkoutPending}
                aria-busy={removingId === item.id}
                aria-label="Gutschein entfernen"
                onClick={() => handleRemove(item.id)}
              >
                {removingId === item.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Trash2 className="h-4 w-4" aria-hidden />
                )}
              </Button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor={`recipientName-${item.id}`}>Beschenkte Person (optional)</Label>
                <Input
                  id={`recipientName-${item.id}`}
                  name={`recipientName-${item.id}`}
                  defaultValue={item.recipientName ?? ""}
                  placeholder="z. B. Maria"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor={`personalMessage-${item.id}`}>Persönliche Nachricht (optional)</Label>
                <Input
                  id={`personalMessage-${item.id}`}
                  name={`personalMessage-${item.id}`}
                  defaultValue={item.personalMessage}
                  placeholder="Alles Gute zum Geburtstag!"
                  maxLength={500}
                />
              </div>
            </div>
          </article>
        ))}
      </div>

      <aside className="h-fit rounded-2xl border border-aqua-100 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-aqua-900">Zusammenfassung</h2>
        <p className="mt-2 text-sm text-slate-600">
          Zahlung ausschließlich per <strong>Überweisung</strong>. Code & QR erhalten Sie per
          E-Mail, sobald wir den Zahlungseingang geprüft haben.
        </p>
        <p className="mt-4 flex justify-between border-t border-slate-100 pt-4 font-semibold text-aqua-900">
          <span>Gesamt</span>
          <span>{formatEuro(cart.totalCents)}</span>
        </p>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="buyerName">Ihr Name *</Label>
            <Input id="buyerName" name="buyerName" required autoComplete="name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="buyerEmail">Ihre E-Mail *</Label>
            <Input
              id="buyerEmail"
              name="buyerEmail"
              type="email"
              required
              autoComplete="email"
            />
          </div>
          <label className="flex items-start gap-2 text-sm text-slate-600">
            <input type="checkbox" name="bindingConfirmed" required className="mt-1" />
            <span>
              Ich bestelle verbindlich und überweise den Betrag innerhalb von 7 Tagen. *
            </span>
          </label>
          <Button type="submit" className="w-full" disabled={checkoutPending || removingId !== null}>
            {checkoutPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Wird verarbeitet…
              </>
            ) : (
              "Verbindlich bestellen"
            )}
          </Button>
        </div>

        <Button asChild variant="link" className="mt-3 h-auto w-full p-0">
          <Link href="/gutschein">← Weitere Gutscheine</Link>
        </Button>
      </aside>
    </form>
  );
}
