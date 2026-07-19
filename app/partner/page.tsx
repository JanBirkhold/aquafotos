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
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Partner werden – Schwimmbäder & Kitas in Lippe / OWL",
  description:
    "Partner von AquaFotos in Barntrup, Detmold, Lage und Bad Salzuflen: QR-Aushang, Anmeldung per WhatsApp/Telefon/Mail, Shooting vor Ort – ohne Shop-Management.",
  path: "/partner",
});

export default function PartnerPage() {
  return (
    <div className="pt-0">
      <PartnerBecomeHero />
      <PartnerPillarsSection />
      <PartnerProcessSection />
      <PartnerBenefitsSection />
      <PartnerSegmentsSection />
      <PartnerInquirySection />
      <PartnerCtaSection />
    </div>
  );
}
