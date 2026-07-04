import type { Metadata } from "next";
import Link from "next/link";
import { VoucherProductGrid } from "@/components/voucher/voucher-product-grid";
import { Button } from "@/components/ui/button";
import { getActiveVoucherProducts, getVoucherCartCount } from "@/lib/voucher-queries";
import { shootingTypeLabels } from "@/lib/shooting-types";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Gutschein kaufen – AquaFotos",
  description:
    "Verschenken Sie Unterwasser- und Familienfotoshootings. Gutschein online kaufen mit Wunschtermin und QR-Code.",
  path: "/gutschein",
});

export default async function GutscheinPage() {
  const [products, cartCount] = await Promise.all([
    getActiveVoucherProducts(),
    getVoucherCartCount(),
  ]);

  const productViews = products.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    priceCents: p.priceCents,
    shootingTypeLabel: p.shootingType ? shootingTypeLabels[p.shootingType] : null,
  }));

  return (
    <div className="section-padding pt-28">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold text-aqua-900">Gutschein verschenken</h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Unvergessliche Erinnerungen unter Wasser oder im Studio – als Geschenk mit
            Wunschtermin und persönlichem QR-Code.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild variant="outline">
              <Link href="/gutschein/einloesen">Gutschein einlösen</Link>
            </Button>
            <Button asChild>
              <Link href="/gutschein/warenkorb">Zum Warenkorb{cartCount > 0 ? ` (${cartCount})` : ""}</Link>
            </Button>
          </div>
        </div>

        {productViews.length === 0 ? (
          <p className="mt-16 text-center text-slate-500">
            Aktuell keine Gutscheine verfügbar.{" "}
            <Link href="/kontakt" className="text-aqua-600 hover:underline">
              Kontaktieren Sie uns
            </Link>
            .
          </p>
        ) : (
          <div className="mt-12">
            <VoucherProductGrid products={productViews} cartCount={cartCount} />
          </div>
        )}
      </div>
    </div>
  );
}
