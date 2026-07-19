import type { Metadata } from "next";
import { GallerySection } from "@/components/sections/gallery-section";
import { JsonLd } from "@/components/json-ld";
import { createPageMetadata } from "@/lib/seo";
import { getBreadcrumbSchema, getImageGallerySchema } from "@/lib/schema";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = createPageMetadata({
  title: "Galerie – Unterwasserfotos Barntrup, Detmold & Lippe",
  description:
    "Galerie: Unterwasserfotos von AquaFotos aus Barntrup, Detmold, Lage und Bad Salzuflen – emotionale Momente unter Wasser.",
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
        <GallerySection showAll showFilters={false} />
      </div>
    </>
  );
}
