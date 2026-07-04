"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Loader2, Trash2 } from "lucide-react";
import {
  createVoucherCheckout,
  removeVoucherFromCart,
  updateVoucherCartItem,
} from "@/lib/actions/voucher";
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
  const [pending, startTransition] = useTransition();

  function saveItem(
    itemId: string,
    data: { recipientName?: string; preferredDate?: string; personalMessage?: string },
  ) {
    startTransition(async () => {
      const result = await updateVoucherCartItem(itemId, data);
      if (result.error) alert(result.error);
    });
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_320px]">
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
                disabled={pending}
                aria-label="Gutschein entfernen"
                onClick={() =>
                  startTransition(async () => {
                    await removeVoucherFromCart(item.id);
                  })
                }
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </Button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`recipient-${item.id}`}>Beschenkte Person (optional)</Label>
                <Input
                  id={`recipient-${item.id}`}
                  defaultValue={item.recipientName ?? ""}
                  placeholder="z. B. Maria"
                  onBlur={(e) =>
                    saveItem(item.id, { recipientName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`date-${item.id}`}>Wunschtermin zur Anmeldung *</Label>
                <Input
                  id={`date-${item.id}`}
                  type="date"
                  required
                  defaultValue={item.preferredDate}
                  min={new Date().toISOString().slice(0, 10)}
                  onBlur={(e) =>
                    saveItem(item.id, { preferredDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor={`message-${item.id}`}>Persönliche Nachricht (optional)</Label>
                <Input
                  id={`message-${item.id}`}
                  defaultValue={item.personalMessage}
                  placeholder="Alles Gute zum Geburtstag!"
                  maxLength={500}
                  onBlur={(e) =>
                    saveItem(item.id, { personalMessage: e.target.value })
                  }
                />
              </div>
            </div>
          </article>
        ))}
      </div>

      <aside className="h-fit rounded-2xl border border-aqua-100 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-aqua-900">Zusammenfassung</h2>
        <p className="mt-2 text-sm text-slate-600">
          {cart.count} Gutschein{cart.count !== 1 ? "e" : ""} · Code & QR-Code erhalten Sie per
          E-Mail nach dem Kauf.
        </p>
        <p className="mt-4 flex justify-between border-t border-slate-100 pt-4 font-semibold text-aqua-900">
          <span>Gesamt</span>
          <span>{formatEuro(cart.totalCents)}</span>
        </p>

        <form
          className="mt-6 space-y-4"
          action={(fd) =>
            startTransition(async () => {
              const result = await createVoucherCheckout({
                buyerName: fd.get("buyerName") as string,
                buyerEmail: fd.get("buyerEmail") as string,
                bindingConfirmed: fd.get("bindingConfirmed") === "on",
              });
              if (result.error) {
                alert(result.error);
                return;
              }
              if (result.url) window.location.href = result.url;
            })
          }
        >
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
            <span>Ich bestelle verbindlich die ausgewählten Gutscheine. *</span>
          </label>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Wird verarbeitet…
              </>
            ) : (
              "Gutschein kaufen"
            )}
          </Button>
        </form>

        <Button asChild variant="link" className="mt-3 h-auto w-full p-0">
          <Link href="/gutschein">← Weitere Gutscheine</Link>
        </Button>
      </aside>
    </div>
  );
}
