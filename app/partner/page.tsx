import type { Metadata } from "next";
import {
  PartnerBecomeHero,
  PartnerBenefitsSection,
  PartnerCtaSection,
  PartnerInquirySection,
  PartnerPillarsSection,
  PartnerProcessSection,
  PartnerSegmentsSection,
} from "@/components/sections/partner-become-sections";
import { PartnersShowcase } from "@/components/sections/partners-showcase";
import { getFeaturedPartners } from "@/lib/actions/partner";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Partner werden – Schwimmbäder, Kitas & mehr",
  description:
    "Mehrwert für Ihre Teilnehmer ohne Aufwand: AquaFotos übernimmt Anmeldung, Galerie, Shop und Abwicklung. Partner werden in OWL.",
  path: "/partner",
});

export default async function PartnerPage() {
  const partners = await getFeaturedPartners();

  return (
    <div className="pt-0">
      <PartnerBecomeHero />
      <PartnerPillarsSection />
      <PartnerProcessSection />
      <PartnerBenefitsSection />

      <PartnersShowcase
        partners={partners}
        title="Partner, die bereits profitieren"
        subtitle="Gemeinsam bieten wir Familien professionelle Fotografie – mit minimalem Aufwand vor Ort."
      />

      <PartnerSegmentsSection />
      <PartnerInquirySection />
      <PartnerCtaSection />
    </div>
  );
}
