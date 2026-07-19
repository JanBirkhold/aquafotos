import Link from "next/link";
import { HeroSection } from "@/components/sections/hero-section";
import { OffersSection } from "@/components/sections/offers-section";
import { TeamSection } from "@/components/sections/team-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PartnersShowcase } from "@/components/sections/partners-showcase";
import { PartnerBecomeHomeSection } from "@/components/sections/partner-become-sections";
import { JsonLd } from "@/components/json-ld";
import { featuredPartners } from "@/lib/featured-partners";
import { getHomepageSchemas } from "@/lib/schema";

const audiences = [
  {
    title: "Eltern mit Babys",
    message: "Die schönsten Erinnerungen entstehen nur einmal.",
    href: "/baby",
  },
  {
    title: "Eltern mit Kindergartenkindern",
    message: "Die Kita-Jahre sind kurz – und die schönsten Momente bleiben für immer.",
    href: "/kita",
  },
  {
    title: "Schwimmbäder",
    message: "Ein Erlebnis, das Familien begeistert – und Sie kaum etwas kostet.",
    href: "/partner",
  },
  {
    title: "Kitas",
    message: "Fotos, die Eltern lieben – ohne Mappenchaos für Ihr Team.",
    href: "/partner",
  },
];

export default function HomePage() {
  return (
    <>
      <JsonLd data={getHomepageSchemas()} />
      <HeroSection />

      <section className="section-padding bg-white">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center font-display text-3xl font-bold text-aqua-900">
            Für wen wir da sind
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {audiences.map((a) => (
              <Card key={a.title} className="border-aqua-100">
                <CardContent className="flex h-full flex-col p-6">
                  <h3 className="font-semibold text-aqua-900">{a.title}</h3>
                  <p className="mt-3 flex-1 text-sm italic text-slate-600">
                    &bdquo;{a.message}&ldquo;
                  </p>
                  <Button asChild variant="link" className="mt-4 h-auto p-0">
                    <Link href={a.href}>Mehr erfahren →</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <OffersSection />
      <PartnersShowcase
        partners={featuredPartners}
        title="Unsere Partner vor Ort"
        subtitle="Schwimmbäder, Kitas und Familieneinrichtungen in Barntrup, Bad Salzuflen und Lippe / OWL."
      />
      <PartnerBecomeHomeSection />
      <TeamSection />

      <section className="section-padding bg-gradient-to-br from-aqua-600 to-aqua-800 text-center text-white">
        <h2 className="font-display text-3xl font-bold">
          Bereit für Ihr Shooting?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-aqua-100">
          Feste Events und persönliche Galerie – klar und unkompliziert.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" variant="secondary">
            <Link href="/shootings">Shooting finden</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
            <Link href="/bilder-bestellen">Bilder bestellen</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
