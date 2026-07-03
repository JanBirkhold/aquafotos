import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { ObfuscatedEmailLink } from "@/components/obfuscated-email";
import { createPageMetadata } from "@/lib/seo";
import { getBreadcrumbSchema } from "@/lib/schema";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = createPageMetadata({
  title: "Impressum – AquaFotos Barntrup",
  description:
    "Impressum und Angaben gemäß § 5 TMG für AquaFotos Unterwasserfotografie in Barntrup, Verantwortlicher Kasimir Eckhardt.",
  path: "/impressum",
});

export default function ImpressumPage() {
  return (
    <>
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Start", url: siteConfig.url },
          { name: "Impressum", url: `${siteConfig.url}/impressum` },
        ])}
      />
      <article className="section-padding mx-auto max-w-3xl pt-28 prose prose-slate prose-headings:font-display prose-headings:text-aqua-900">
        <h1>Impressum</h1>
        <h2>Angaben gemäß § 5 TMG</h2>
        <p>
          <strong>{siteConfig.name}</strong>
          <br />
          {siteConfig.address.street}
          <br />
          {siteConfig.address.postalCode} {siteConfig.address.city}
        </p>
        <h2>Verantwortlich für den Inhalt</h2>
        <p>
          {siteConfig.owner.name}
          <br />
          {siteConfig.address.street}
          <br />
          {siteConfig.address.postalCode} {siteConfig.address.city}
        </p>
        <h2>Kontakt</h2>
        <p>
          Telefon:{" "}
          <a href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}>
            {siteConfig.phoneDisplay}
          </a>
          <br />
          E-Mail: <ObfuscatedEmailLink />
        </p>
        <h2>Haftungsausschluss</h2>
        <p>
          Die Inhalte dieser Seite wurden mit größter Sorgfalt erstellt. Für
          die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir
          jedoch keine Gewähr übernehmen.
        </p>
      </article>
    </>
  );
}
