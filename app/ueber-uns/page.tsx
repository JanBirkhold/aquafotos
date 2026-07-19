import type { Metadata } from "next";
import Link from "next/link";
import { TeamSection } from "@/components/sections/team-section";
import { JsonLd } from "@/components/json-ld";
import { Button } from "@/components/ui/button";
import { createPageMetadata } from "@/lib/seo";
import {
  getBreadcrumbSchema,
  getPersonSchema,
  getTeamSchemas,
} from "@/lib/schema";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = createPageMetadata({
  title: "Über uns – Team AquaFotos Barntrup & Lippe",
  description:
    "Annika und Kasimir Eckhardt – AquaFotos. Unterwasserfotografie mit Leidenschaft in Barntrup, Detmold, Lage, Bad Salzuflen und OWL.",
  path: "/ueber-uns",
});

export default function UeberUnsPage() {
  return (
    <>
      <JsonLd
        data={[
          getBreadcrumbSchema([
            { name: "Start", url: siteConfig.url },
            { name: "Über uns", url: `${siteConfig.url}/ueber-uns` },
          ]),
          getPersonSchema(),
          ...getTeamSchemas(),
        ]}
      />
      <div className="section-padding bg-gradient-to-b from-aqua-50/50 to-sand-50 pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl font-bold text-aqua-900">
            Über uns
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            AquaFotos ist ein familiengeführtes Unternehmen aus Barntrup –
            für Familien und Partner in Detmold, Lage, Bad Salzuflen und ganz
            Lippe / OWL. Annika inszeniert die Unterwasserbilder, Kasimir sorgt
            für Technik und den reibungslosen Ablauf.
          </p>
          <Button asChild className="mt-6">
            <Link href="/shootings">Termin finden</Link>
          </Button>
        </div>
      </div>
      <TeamSection showCta={false} />
    </>
  );
}
