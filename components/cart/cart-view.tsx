"use client";

import { useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createCheckoutSession,
  removeFromCart,
} from "@/lib/actions/shop";
import type { getCartSummary } from "@/lib/shop-queries";
import { formatEuro } from "@/lib/pricing";

type CartSummary = NonNullable<Awaited<ReturnType<typeof getCartSummary>>>;

type Props = {
  cart: CartSummary;
  customerEmail: string;
};

export function CartView({ cart, customerEmail }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        {cart.items.map((item, index) => (
          <div
            key={item.id}
            className="flex gap-4 rounded-2xl border border-aqua-100 bg-white p-4 shadow-sm"
          >
            <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
              <Image
                src={item.src}
                alt={item.filename}
                fill
                className="object-cover"
                unoptimized={item.src.startsWith("/uploads/")}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-aqua-900">Bild {index + 1}</p>
              <p className="truncate text-xs text-slate-500">{item.filename}</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {formatEuro(
                  index === 0
                    ? cart.pricing.firstImagePrice
                    : index === 1
                      ? cart.pricing.secondImagePrice
                      : cart.pricing.additionalPrice,
                )}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0"
              disabled={pending}
              aria-label={`${item.filename} entfernen`}
              onClick={() =>
                startTransition(async () => {
                  await removeFromCart(item.photoId, cart.accessCode);
                })
              }
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        ))}
      </div>

      <aside className="h-fit rounded-2xl border border-aqua-100 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-aqua-900">Zusammenfassung</h2>
        {cart.hasReorderItems && (
          <p className="mt-3 rounded-xl border border-amber-100 bg-amber-50/80 p-3 text-xs text-amber-950">
            Diese Bestellung enthält <span className="font-medium">Nachbestellungen</span> – wir
            bearbeiten die Bilder erneut für Sie. Vielen Dank!
          </p>
        )}
        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          {cart.breakdown.map((line) => (
            <li key={line.label} className="flex justify-between gap-4">
              <span>{line.label}</span>
              <span>{formatEuro(line.cents)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between border-t border-slate-100 pt-4 font-semibold text-aqua-900">
          <span>Gesamt</span>
          <span>{formatEuro(cart.totalCents)}</span>
        </p>

        <form
          className="mt-6 space-y-4"
          action={(fd) =>
            startTransition(async () => {
              const result = await createCheckoutSession({
                accessCode: cart.accessCode,
                email: fd.get("email") as string,
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
            <Label htmlFor="email">E-Mail für Bestellbestätigung *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              defaultValue={customerEmail}
            />
          </div>
          <label className="flex items-start gap-2 text-sm text-slate-600">
            <input type="checkbox" name="bindingConfirmed" required className="mt-1" />
            <span>Ich bestelle verbindlich die ausgewählten Bilder. *</span>
          </label>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Wird verarbeitet…
              </>
            ) : (
              "Jetzt bestellen"
            )}
          </Button>
        </form>

        <Button asChild variant="link" className="mt-3 h-auto w-full p-0">
          <Link href={`/galerie/${cart.accessCode}`}>← Zurück zur Galerie</Link>
        </Button>
      </aside>
    </div>
  );
}
