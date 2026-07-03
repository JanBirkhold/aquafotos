import type { Metadata } from "next";
import { GallerySection } from "@/components/sections/gallery-section";
import { JsonLd } from "@/components/json-ld";
import { createPageMetadata } from "@/lib/seo";
import { getBreadcrumbSchema, getImageGallerySchema } from "@/lib/schema";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = createPageMetadata({
  title: "Galerie – Unterwasserfotos Barntrup",
  description:
    "Entdecken Sie unsere Galerie: Unterwasserfotos für Kinder, Familien, Events und WeihnachtsMinis von AquaFotos in Barntrup und Lippe.",
  path: "/galerie",
});

export default function GaleriePage() {
  return (
    <>
      <JsonLd
        data={[
          getBreadcrumbSchema([
            { name: "Start", url: siteConfig.url },
            { name: "Galerie", url: `${siteConfig.url}/galerie` },
          ]),
          getImageGallerySchema(),
        ]}
      />
      <div className="pt-28">
        <GallerySection showAll />
      </div>
    </>
  );
}
