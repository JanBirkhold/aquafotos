import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { ShootingInfoPageContent } from "@/components/sections/shooting-info-page-content";
import { createPageMetadata } from "@/lib/seo";
import { getBreadcrumbSchema } from "@/lib/schema";
import { siteConfig } from "@/lib/site-config";
import { getFaqSchemaFromItems } from "@/lib/shooting-info-content";

export const metadata: Metadata = createPageMetadata({
  title: "Info & FAQ – Unterwasser-Shooting Barntrup, Detmold & Lippe",
  description:
    "Ablauf, Anmeldung und Preise für Unterwasser-Shootings von AquaFotos in Barntrup, Detmold, Lage, Bad Salzuflen und OWL.",
  path: "/info",
});

export default function InfoPage() {
  return (
    <>
      <JsonLd
        data={[
          getBreadcrumbSchema([
            { name: "Start", url: siteConfig.url },
            { name: "Info & FAQ", url: `${siteConfig.url}/info` },
          ]),
          getFaqSchemaFromItems(),
        ]}
      />
      <div className="pt-28">
        <section className="section-padding bg-gradient-to-b from-aqua-50/60 to-sand-50 pb-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-display text-4xl font-bold text-aqua-900 sm:text-5xl">
              Info &amp; FAQ
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Ablauf, Anmeldung und Preise für Unterwasser-Veranstaltungen in
              Barntrup, Detmold, Lage, Bad Salzuflen und ganz Lippe / OWL.
            </p>
          </div>
        </section>
        <ShootingInfoPageContent />
      </div>
    </>
  );
}
