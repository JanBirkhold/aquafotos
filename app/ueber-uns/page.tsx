import type { Metadata } from "next";
import Link from "next/link";
import { TeamSection } from "@/components/sections/team-section";
import { JsonLd } from "@/components/json-ld";
import { Button } from "@/components/ui/button";
import { createPageMetadata } from "@/lib/seo";
import { getBreadcrumbSchema, getTeamSchemas } from "@/lib/schema";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = createPageMetadata({
  title: "Über uns – Team AquaFotos Barntrup",
  description:
    "Lernen Sie Annika und Kasimir Eckhardt kennen – das Team hinter AquaFotos. Unterwasserfotografie mit Leidenschaft in Barntrup und Lippe.",
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
            Annika inszeniert die Unterwasserbilder, Kasimir sorgt für Technik
            und den reibungslosen Bestellprozess.
          </p>
          <Button asChild className="mt-6">
            <Link href="/#termin">Termin buchen</Link>
          </Button>
        </div>
      </div>
      <TeamSection showCta={false} />
    </>
  );
}
