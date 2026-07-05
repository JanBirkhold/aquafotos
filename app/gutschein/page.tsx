import type { Metadata } from "next";
import Link from "next/link";
import { VoucherPageHero } from "@/components/voucher/voucher-page-hero";
import { VoucherProductGrid } from "@/components/voucher/voucher-product-grid";
import { getActiveVoucherProducts, getVoucherCartCount } from "@/lib/voucher-queries";
import { shootingTypeLabels } from "@/lib/shooting-types";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Gutschein kaufen – AquaFotos",
  description:
    "Verschenken Sie Unterwasser- und Familienfotoshootings. Gutschein online bestellen – Zahlung per Überweisung.",
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
    imageUrl: p.imageUrl,
    priceCents: p.priceCents,
    shootingTypeLabel: p.shootingType ? shootingTypeLabels[p.shootingType] : null,
  }));

  return (
    <>
      <VoucherPageHero />

      <div id="gutscheine" className="section-padding scroll-mt-28 bg-sand-50">
        <div className="mx-auto max-w-7xl">
          {productViews.length === 0 ? (
            <p className="text-center text-slate-500">
              Aktuell keine Gutscheine verfügbar.{" "}
              <Link href="/kontakt" className="text-aqua-600 hover:underline">
                Kontaktieren Sie uns
              </Link>
              .
            </p>
          ) : (
            <VoucherProductGrid products={productViews} cartCount={cartCount} />
          )}
        </div>
      </div>
    </>
  );
}
