import type { Metadata } from "next";
import Link from "next/link";
import { PhotoPricingPanel } from "@/components/admin/photo-pricing-panel";
import { VoucherProductsPanel } from "@/components/admin/voucher-products-panel";
import { getAllVoucherProductsForAdmin } from "@/lib/actions/voucher-admin";
import { getActivePricing } from "@/lib/shop-queries";

export const metadata: Metadata = {
  title: "Preise & Gutscheine – Admin",
};

export default async function AdminPreisePage() {
  const [pricing, rawProducts] = await Promise.all([
    getActivePricing(),
    getAllVoucherProductsForAdmin(),
  ]);

  const products = rawProducts.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    imageUrl: p.imageUrl,
    priceCents: p.priceCents,
    shootingType: p.shootingType,
    sortOrder: p.sortOrder,
    active: p.active,
    soldCount: p._count.vouchers,
  }));

  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-display text-3xl font-bold text-aqua-900">
          Preise & Gutscheine
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Bild-Staffelpreise für die Galerie und Gutschein-Angebote im Shop. Bestellungen verwalten
          Sie unter{" "}
          <Link href="/admin/gutscheine" className="text-aqua-700 underline underline-offset-2">
            Gutscheine
          </Link>
          .
        </p>
      </div>

      <PhotoPricingPanel pricing={pricing} />
      <VoucherProductsPanel products={products} />
    </div>
  );
}
