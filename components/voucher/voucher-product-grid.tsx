"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Gift, Loader2, ShoppingCart } from "lucide-react";
import { addVoucherToCart } from "@/lib/actions/voucher";
import { Button } from "@/components/ui/button";
import { formatEuro } from "@/lib/pricing";

export type VoucherProductView = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  priceCents: number;
  shootingTypeLabel: string | null;
};

type Props = {
  products: VoucherProductView[];
  cartCount: number;
};

export function VoucherProductGrid({ products, cartCount }: Props) {
  const router = useRouter();
  const [localCartCount, setLocalCartCount] = useState(cartCount);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    setLocalCartCount(cartCount);
  }, [cartCount]);

  async function handleAdd(productId: string, goToCart: boolean) {
    if (addingId) return;

    setAddingId(productId);
    setAddedId(null);
    try {
      const result = await addVoucherToCart(productId);
      if (result.error) {
        alert(result.error);
        return;
      }
      if (result.cartCount != null) {
        setLocalCartCount(result.cartCount);
      }
      if (goToCart) {
        router.push("/gutschein/warenkorb");
        return;
      }
      setAddedId(productId);
    } finally {
      setAddingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Verschenken Sie unvergessliche AquaFotos-Erlebnisse. Zahlung per Überweisung – Code &
          QR-Code erhalten Sie nach Zahlungsfreigabe per E-Mail.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/gutschein/warenkorb">
            <ShoppingCart className="h-4 w-4" aria-hidden />
            Warenkorb{localCartCount > 0 ? ` (${localCartCount})` : ""}
          </Link>
        </Button>
      </div>

      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          const isAdding = addingId === product.id;
          const wasAdded = addedId === product.id;

          return (
            <li
              key={product.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-aqua-100 bg-white shadow-sm"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-aqua-900">
                {product.imageUrl ? (
                  <>
                    <Image
                      src={product.imageUrl}
                      alt={product.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                      unoptimized={product.imageUrl.startsWith("/uploads/")}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-aqua-950/80 via-aqua-950/20 to-transparent" />
                  </>
                ) : (
                  <div className="flex h-full flex-col justify-end bg-gradient-to-br from-aqua-600 to-aqua-800 p-6">
                    <Gift className="h-8 w-8 text-white/90" aria-hidden />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <h2 className="font-display text-xl font-semibold">{product.title}</h2>
                  {product.shootingTypeLabel && (
                    <p className="mt-1 text-sm text-aqua-100">{product.shootingTypeLabel}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-1 flex-col p-5">
                {product.description && (
                  <p className="text-sm text-slate-600">{product.description}</p>
                )}
                <p className="mt-auto pt-4 font-display text-2xl font-bold text-aqua-900">
                  {formatEuro(product.priceCents)}
                </p>
                {localCartCount > 0 ? (
                  <div className="mt-4 flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={isAdding}
                      aria-busy={isAdding}
                      onClick={() => handleAdd(product.id, false)}
                    >
                      {isAdding ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                          Wird hinzugefügt…
                        </>
                      ) : wasAdded ? (
                        "Im Warenkorb · weiter einkaufen"
                      ) : (
                        "Weiter einkaufen"
                      )}
                    </Button>
                    <Button
                      type="button"
                      className="w-full"
                      disabled={isAdding}
                      onClick={() => handleAdd(product.id, true)}
                    >
                      <ShoppingCart className="h-4 w-4" aria-hidden />
                      Zum Warenkorb
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    className="mt-4 w-full"
                    disabled={isAdding}
                    aria-busy={isAdding}
                    onClick={() => handleAdd(product.id, false)}
                  >
                    {isAdding ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        Wird hinzugefügt…
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4" aria-hidden />
                        In den Warenkorb
                      </>
                    )}
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
