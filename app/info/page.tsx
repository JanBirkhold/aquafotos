import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { InfoCategoryScroller } from "@/components/sections/info-category-scroller";
import { ShootingInfoPageContent } from "@/components/sections/shooting-info-page-content";
import { createPageMetadata } from "@/lib/seo";
import { getBreadcrumbSchema } from "@/lib/schema";
import { siteConfig } from "@/lib/site-config";
import {
  getFaqSchemaFromItems,
  type ShootingInfoSlug,
} from "@/lib/shooting-info-content";

export const metadata: Metadata = createPageMetadata({
  title: "Info & FAQ – Ablauf, Preise & Anmeldung",
  description:
    "So funktioniert's bei AquaFotos: Ablauf für Unterwasser-, Kita-, Baby-, Familien- und Aktions-Shootings. Termine, Bildpreise und häufige Fragen.",
  path: "/info",
});

const VALID_CATEGORIES = new Set<ShootingInfoSlug>([
  "unterwasser",
  "kita",
  "baby",
  "familie",
  "aktionen",
]);

type Props = {
  searchParams: Promise<{ kategorie?: string }>;
};

export default async function InfoPage({ searchParams }: Props) {
  const { kategorie } = await searchParams;
  const activeCategory =
    kategorie && VALID_CATEGORIES.has(kategorie as ShootingInfoSlug)
      ? (kategorie as ShootingInfoSlug)
      : undefined;

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
              Info & FAQ
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Ablauf, Anmeldung und Preise für alle Shooting-Arten – Unterwasser, Kita, Baby,
              Familie und saisonale Aktionen.
            </p>
          </div>
        </section>
        <InfoCategoryScroller category={activeCategory} />
        <ShootingInfoPageContent activeCategory={activeCategory} />
      </div>
    </>
  );
}
