import type { Metadata } from "next";
import { OrderInfoNotices } from "@/components/sections/cart-notice";
import { GalleryAccessForm } from "@/components/sections/gallery-access-form";
import { createPageMetadata } from "@/lib/seo";
import { formatEuro } from "@/lib/pricing";

export const metadata: Metadata = createPageMetadata({
  title: "Bilder bestellen – Ihre Galerie",
  description:
    "Zugang zu Ihrer persönlichen AquaFotos Galerie mit Zugangscode und E-Mail. Bilder auswählen und online bestellen.",
  path: "/bilder-bestellen",
});

type Props = {
  searchParams: Promise<{ code?: string }>;
};

export default async function BilderBestellenPage({ searchParams }: Props) {
  const { code } = await searchParams;

  return (
    <div className="section-padding min-h-[70vh] pt-28">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-display text-4xl font-bold text-aqua-900">
          Bilder bestellen
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Nur Ihre Familie sieht Ihre Bilder. Zugangscode und E-Mail aus Ihrer
          Anmeldungsbestätigung eingeben.
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Preise ab {formatEuro(3500)} · Staffelpreise für mehrere Bilder
        </p>
      </div>
      <div className="mt-10">
        <GalleryAccessForm defaultAccessCode={code} />
      </div>
      <OrderInfoNotices />
    </div>
  );
}
