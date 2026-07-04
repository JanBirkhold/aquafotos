"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Gift, Loader2, ShoppingCart } from "lucide-react";
import { addVoucherToCart } from "@/lib/actions/voucher";
import { Button } from "@/components/ui/button";
import { formatEuro } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export type VoucherProductView = {
  id: string;
  title: string;
  description: string | null;
  priceCents: number;
  shootingTypeLabel: string | null;
};

type Props = {
  products: VoucherProductView[];
  cartCount: number;
};

export function VoucherProductGrid({ products, cartCount }: Props) {
  const [pending, startTransition] = useTransition();

  function handleAdd(productId: string) {
    startTransition(async () => {
      const result = await addVoucherToCart(productId);
      if (result.error) alert(result.error);
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Verschenken Sie unvergessliche AquaFotos-Erlebnisse – digital oder gedruckt auf
          hochwertiger Gutscheinkarte.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/gutschein/warenkorb">
            <ShoppingCart className="h-4 w-4" aria-hidden />
            Warenkorb{cartCount > 0 ? ` (${cartCount})` : ""}
          </Link>
        </Button>
      </div>

      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <li
            key={product.id}
            className="flex flex-col overflow-hidden rounded-2xl border border-aqua-100 bg-white shadow-sm"
          >
            <div className="bg-gradient-to-br from-aqua-600 to-aqua-800 p-6 text-white">
              <Gift className="h-8 w-8 opacity-90" aria-hidden />
              <h2 className="mt-4 font-display text-xl font-semibold">{product.title}</h2>
              {product.shootingTypeLabel && (
                <p className="mt-1 text-sm text-aqua-100">{product.shootingTypeLabel}</p>
              )}
            </div>
            <div className="flex flex-1 flex-col p-5">
              {product.description && (
                <p className="text-sm text-slate-600">{product.description}</p>
              )}
              <p className="mt-auto pt-4 font-display text-2xl font-bold text-aqua-900">
                {formatEuro(product.priceCents)}
              </p>
              <Button
                type="button"
                className={cn("mt-4 w-full")}
                disabled={pending}
                onClick={() => handleAdd(product.id)}
              >
                {pending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" aria-hidden />
                    In den Warenkorb
                  </>
                )}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
