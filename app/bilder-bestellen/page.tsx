import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = createPageMetadata({
  title: "Bilder bestellen – so funktioniert’s",
  description:
    "So bestellen Sie Ihre AquaFotos aus Barntrup, Detmold, Lage oder Bad Salzuflen: Galerie per E-Mail, Lieblingsbilder wählen, per Überweisung bezahlen.",
  path: "/bilder-bestellen",
});

export default function BilderBestellenPage() {
  return (
    <div className="section-padding min-h-[70vh] pt-28">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-center font-display text-4xl font-bold text-aqua-900">
          Bilder bestellen
        </h1>
        <p className="mt-4 text-center text-lg text-slate-600">
          So funktioniert die Bestellung Ihrer Unterwasserfotos – ohne Aufwand.
        </p>

        <ol className="mt-12 space-y-8">
          <li className="flex gap-4">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-aqua-100 text-sm font-semibold text-aqua-800"
              aria-hidden
            >
              1
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold text-aqua-900">
                Galerie-Link per E-Mail
              </h2>
              <p className="mt-1 text-slate-600">
                Nach dem Shooting erhalten Sie eine E-Mail mit dem Link zu Ihrer
                persönlichen Galerie. Nur Sie sehen Ihre Bilder.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-aqua-100 text-sm font-semibold text-aqua-800"
              aria-hidden
            >
              2
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold text-aqua-900">
                Bilder auswählen
              </h2>
              <p className="mt-1 text-slate-600">
                In der Galerie wählen Sie Ihre Lieblingsbilder aus und bestellen
                Ihre Auswahl. Preise: 1.&nbsp;Bild 35&nbsp;€, 2.&nbsp;Bild 25&nbsp;€,
                jedes weitere 15&nbsp;€.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-aqua-100 text-sm font-semibold text-aqua-800"
              aria-hidden
            >
              3
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold text-aqua-900">
                Bezahlen &amp; erhalten
              </h2>
              <p className="mt-1 text-slate-600">
                Die Zahlung erfolgt per Vorkasse (Überweisung). Bilder aus
                Bestellungen, die per Echtzeit-Überweisung bezahlt werden, werden
                auch unmittelbar nach der Zahlung zugesendet, in der Regel
                innerhalb weniger Minuten. Dies gilt auch an Sonn- und Feiertagen.
              </p>
            </div>
          </li>
        </ol>

        <p className="mt-10 text-center text-sm text-slate-600">
          Bei Verzögerungen erreichen Sie den Support unter{" "}
          <a
            href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
            className="font-medium text-aqua-700 underline underline-offset-2"
          >
            {siteConfig.phoneDisplay}
          </a>
          .
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/info#preise">Zu den Preisen</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/kontakt">Kontakt</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
