import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import {
  CartNotice,
  OrderInfoNotices,
} from "@/components/sections/cart-notice";
import { createPageMetadata } from "@/lib/seo";
import { getBreadcrumbSchema } from "@/lib/schema";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = createPageMetadata({
  title: "Warenkorb – Bilder bestellen",
  description:
    "Ihr AquaFotos Warenkorb: Unterwasserfotos auswählen und online bestellen. Hochauflösende Dateien nach dem Kauf ohne Wasserzeichen.",
  path: "/warenkorb",
});

export default function WarenkorbPage() {
  return (
    <>
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Start", url: siteConfig.url },
          { name: "Warenkorb", url: `${siteConfig.url}/warenkorb` },
        ])}
      />
      <div className="section-padding pt-28">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-center font-display text-4xl font-bold text-aqua-900">
            Warenkorb
          </h1>
          <div className="mt-10">
            <CartNotice empty />
          </div>
          <OrderInfoNotices />
        </div>
      </div>
    </>
  );
}
