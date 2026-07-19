import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import { ObfuscatedEmailLink } from "@/components/obfuscated-email";
import { PUBLIC_SHOOTING_EVENT } from "@/lib/public-shooting-event";

export const metadata: Metadata = createPageMetadata({
  title: "Shootings & Termine – Bad Salzuflen, Detmold & Lippe",
  description:
    "Unterwasser-Shootings für Babys und Kleinkinder u. a. im VitaSol Bad Salzuflen – für Familien aus Detmold, Lage, Barntrup und OWL. Anmeldung per Telefon, WhatsApp oder E-Mail.",
  path: "/shootings",
});

export default function ShootingsPage() {
  const event = PUBLIC_SHOOTING_EVENT;

  return (
    <div className="pt-28">
      <section className="section-padding bg-gradient-to-b from-aqua-50/60 to-sand-50">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-4xl font-bold text-aqua-900">
            Shooting finden
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Aktueller Termin. Ablauf &amp; Preise unter{" "}
            <Link href="/info" className="text-aqua-700 underline underline-offset-2">
              Info &amp; FAQ
            </Link>
            .
          </p>

          <article className="mt-10 rounded-2xl border border-aqua-100 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-medium uppercase tracking-wide text-aqua-600">
              Unterwasser
            </p>
            <h2 className="mt-2 font-display text-xl font-semibold text-aqua-900 sm:text-2xl">
              {event.title}
            </h2>
            <ul className="mt-5 space-y-3 text-slate-600">
              <li className="flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0 text-aqua-500" aria-hidden />
                {event.dateLabel}
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-aqua-500" aria-hidden />
                {event.location}
              </li>
            </ul>
            <p className="mt-4 text-sm text-slate-500">{event.note}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <a href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}>
                  <Phone className="h-4 w-4" aria-hidden />
                  {siteConfig.phoneDisplay}
                </a>
              </Button>
              <Button asChild variant="outline">
                <ObfuscatedEmailLink>E-Mail schreiben</ObfuscatedEmailLink>
              </Button>
              <Button asChild variant="outline">
                <Link href="/kontakt">Kontakt</Link>
              </Button>
            </div>
          </article>

          <p className="mt-8 text-sm text-slate-500">
            Keine passende Veranstaltung? Schreiben Sie uns – bei Interesse planen wir
            zeitnah einen Termin.
          </p>
        </div>
      </section>
    </div>
  );
}
