import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ObfuscatedEmailLink } from "@/components/obfuscated-email";
import { createPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = createPageMetadata({
  title: "Kontakt – AquaFotos Barntrup, Detmold & Lippe",
  description:
    "Kontakt zu AquaFotos in Barntrup: Unterwasserfotografie für Detmold, Lage, Bad Salzuflen und OWL. Telefon, WhatsApp oder E-Mail.",
  path: "/kontakt",
});

export default function KontaktPage() {
  return (
    <div className="pt-28">
      <section className="section-padding bg-sand-50">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-4xl font-bold text-aqua-900">Kontakt</h1>
          <p className="mt-3 text-slate-600">
            Schreiben oder rufen Sie uns an – wir betreuen Familien und Partner in
            Barntrup, Detmold, Lage, Bad Salzuflen und Umgebung.
          </p>

          <ul className="mt-10 space-y-4 text-slate-700">
            <li>
              <a
                href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-3 hover:text-aqua-700"
              >
                <Phone className="h-5 w-5 text-aqua-500" aria-hidden />
                {siteConfig.phoneDisplay}
              </a>
            </li>
            <li>
              <ObfuscatedEmailLink className="inline-flex items-center gap-3 hover:text-aqua-700">
                <Mail className="h-5 w-5 text-aqua-500" aria-hidden />
                E-Mail schreiben
              </ObfuscatedEmailLink>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-aqua-500" aria-hidden />
              <span>
                {siteConfig.address.street}, {siteConfig.address.postalCode}{" "}
                {siteConfig.address.city}
              </span>
            </li>
          </ul>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/shootings">Termine ansehen</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/info">Info &amp; FAQ</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
