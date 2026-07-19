import type { Metadata } from "next";
import Link from "next/link";
import { OffersSection } from "@/components/sections/offers-section";
import { JsonLd } from "@/components/json-ld";
import { Button } from "@/components/ui/button";
import { createPageMetadata } from "@/lib/seo";
import { getBreadcrumbSchema } from "@/lib/schema";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = createPageMetadata({
  title: "Angebote – Unterwasser & Familie in Lippe / OWL",
  description:
    "Unterwasser-Shootings, Familien- & Kinderfotos sowie WeihnachtsMinis bei AquaFotos – Barntrup, Detmold, Lage, Bad Salzuflen.",
  path: "/angebote",
});

export default function AngebotePage() {
  return (
    <>
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Start", url: siteConfig.url },
          { name: "Angebote", url: `${siteConfig.url}/angebote` },
        ])}
      />
      <div className="section-padding bg-gradient-to-b from-aqua-50 to-sand-50 pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl font-bold text-aqua-900">
            Angebote & Pakete
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Professionelle Unterwasserfotografie für jeden Anlass – in Barntrup und der Region
            Lippe / OWL.
          </p>
          <Button asChild className="mt-6">
            <Link href="/shootings">Termin finden</Link>
          </Button>
        </div>
      </div>
      <OffersSection />
    </>
  );
}
