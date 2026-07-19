import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import { Button } from "@/components/ui/button";
import { ObfuscatedEmailLink } from "@/components/obfuscated-email";

export const metadata: Metadata = createPageMetadata({
  title: "Gutschein kaufen – Unterwasserfotos Lippe / OWL",
  description:
    "Gutschein für AquaFotos-Unterwasserfotos: Anfrage per E-Mail oder Telefon – für Familien in Barntrup, Detmold, Lage und Bad Salzuflen.",
  path: "/gutschein",
});

export default function GutscheinPage() {
  return (
    <div className="pt-28">
      <section className="section-padding bg-gradient-to-b from-aqua-50/60 to-sand-50">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-4xl font-bold text-aqua-900 sm:text-5xl">
            Herzlich Willkommen bei Aquafotos!
          </h1>
          <h2 className="mt-6 font-display text-2xl font-semibold text-aqua-800">
            Gutschein kaufen
          </h2>
          <p className="mt-4 text-slate-600">
            Die Zahlung erfolgt per Vorkasse (Überweisung). Sobald der Zahlungseingang
            festgestellt wurde, erhalten Sie den Gutscheincode per E-Mail. Der Code kann bei
            der nächsten Bestellung eingelöst werden, sodass sich der zu zahlende Betrag um den
            Gutscheinwert reduziert.
          </p>
          <p className="mt-6 text-slate-600">
            Schreiben Sie uns Ihren gewünschten Betrag sowie Vorname, Nachname und E-Mail –
            wir senden Ihnen die Überweisungsdaten zu.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <ObfuscatedEmailLink>Gutschein per E-Mail anfragen</ObfuscatedEmailLink>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}>
                {siteConfig.phoneDisplay}
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/kontakt">Kontakt</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
