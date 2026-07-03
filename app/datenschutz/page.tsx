import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { createPageMetadata } from "@/lib/seo";
import { getBreadcrumbSchema } from "@/lib/schema";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = createPageMetadata({
  title: "Datenschutz – AquaFotos Barntrup",
  description:
    "Datenschutzerklärung von AquaFotos: Informationen zur Verarbeitung personenbezogener Daten, Cookies im Bestellprozess und Ihre Rechte.",
  path: "/datenschutz",
});

export default function DatenschutzPage() {
  return (
    <>
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Start", url: siteConfig.url },
          { name: "Datenschutz", url: `${siteConfig.url}/datenschutz` },
        ])}
      />
      <article className="section-padding mx-auto max-w-3xl pt-28 prose prose-slate prose-headings:font-display prose-headings:text-aqua-900">
        <h1>Datenschutzerklärung</h1>
        <p>
          Der Schutz Ihrer persönlichen Daten ist uns wichtig. Nachfolgend
          informieren wir Sie über die Verarbeitung personenbezogener Daten auf
          der Website {siteConfig.name}.
        </p>
        <h2>Verantwortlicher</h2>
        <p>
          {siteConfig.owner.name}, {siteConfig.address.street},{" "}
          {siteConfig.address.postalCode} {siteConfig.address.city}
        </p>
        <h2>Cookies im Bestellprozess</h2>
        <p>
          Im Bestellprozess werden Cookies für Authentifizierung und Warenkorb
          verwendet. Diese sind für die Bestellfunktion technisch erforderlich.
        </p>
        <h2>Kontaktformular & Terminanfrage</h2>
        <p>
          Wenn Sie uns über das Kontakt- bzw. Terminformular eine Anfrage
          senden, werden Ihre Angaben zur Bearbeitung der Anfrage gespeichert.
        </p>
        <h2>Ihre Rechte</h2>
        <p>
          Sie haben das Recht auf Auskunft, Berichtigung, Löschung und
          Einschränkung der Verarbeitung Ihrer personenbezogenen Daten sowie
          das Recht auf Datenübertragbarkeit.
        </p>
      </article>
    </>
  );
}
