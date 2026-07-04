import type { Metadata } from "next";
import Link from "next/link";
import { VoucherCartView } from "@/components/voucher/voucher-cart-view";
import { Button } from "@/components/ui/button";
import { getVoucherCartSummary } from "@/lib/voucher-queries";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Gutschein-Warenkorb – AquaFotos",
  description: "Gutschein-Warenkorb mit Wunschtermin zur Anmeldung.",
  path: "/gutschein/warenkorb",
});

export default async function GutscheinWarenkorbPage() {
  const cart = await getVoucherCartSummary();

  return (
    <div className="section-padding pt-28">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-center font-display text-4xl font-bold text-aqua-900">
          Gutschein-Warenkorb
        </h1>
        <p className="mt-3 text-center text-sm text-slate-600">
          Pro Gutschein bitte einen Wunschtermin angeben – wir melden uns zur Terminbestätigung.
        </p>

        <div className="mt-10">
          {cart.count === 0 ? (
            <div className="text-center">
              <p className="text-slate-500">Ihr Warenkorb ist leer.</p>
              <Button asChild className="mt-6">
                <Link href="/gutschein">Gutscheine entdecken</Link>
              </Button>
            </div>
          ) : (
            <VoucherCartView cart={cart} />
          )}
        </div>
      </div>
    </div>
  );
}
