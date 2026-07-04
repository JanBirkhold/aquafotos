import type { Metadata } from "next";
import Link from "next/link";
import { getFeaturedPartners } from "@/lib/actions/partner";
import { partnerTypes } from "@/lib/shooting-types";
import { PartnersShowcase } from "@/components/sections/partners-showcase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Partner – Schwimmbäder, Kitas & mehr",
  description:
    "Werden Sie AquaFotos Partner: Schwimmbäder, Kitas, Hebammen und Familienzentren profitieren von Premium-Fotografie ohne Aufwand.",
  path: "/partner",
});

export default async function PartnerPage() {
  const partners = await getFeaturedPartners();

  return (
    <div className="pt-28">
      <section className="section-padding bg-gradient-to-b from-aqua-50 to-sand-50">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl font-bold text-aqua-900">
            Partner werden
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Mehrwert für Ihre Teilnehmer – ohne Aufwand für Sie. Wir übernehmen
            Anmeldung, Galerie, Shop und Abwicklung.
          </p>
        </div>
      </section>

      <PartnersShowcase partners={partners} />

      <section className="section-padding bg-sand-50">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center font-display text-2xl font-bold text-aqua-900">
            Für wen wir Partner sind
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {partnerTypes.map((p) => (
              <Card key={p.type}>
                <CardHeader>
                  <CardTitle>{p.title}</CardTitle>
                  <p className="text-sm text-red-600/80">Problem: {p.problem}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-medium text-aqua-800">
                    &bdquo;{p.message}&ldquo;
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mx-auto mt-12 max-w-xl text-center">
            <Button asChild size="lg">
              <Link href="/kontakt">Partnerschaft anfragen</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
