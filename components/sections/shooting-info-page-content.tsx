import Link from "next/link";
import {
  CalendarDays,
  Camera,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { FaqSection } from "@/components/sections/faq-section";
import { HowToSection } from "@/components/sections/how-to-section";
import { ShootingInfoCategoryNav } from "@/components/sections/shooting-info-category-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEuro, DEFAULT_PRICING } from "@/lib/pricing";
import { siteConfig } from "@/lib/site-config";
import { HOW_TO_BLOCK } from "@/lib/shooting-info-content";
import { PUBLIC_SHOOTING_EVENT } from "@/lib/public-shooting-event";
import { ObfuscatedEmailLink } from "@/components/obfuscated-email";

export function ShootingInfoPageContent() {
  const pricing = DEFAULT_PRICING;
  const event = PUBLIC_SHOOTING_EVENT;

  return (
    <>
      <section className="section-padding pb-4 pt-4">
        <div className="mx-auto max-w-7xl">
          <ShootingInfoCategoryNav />
        </div>
      </section>

      <section className="section-padding bg-white pt-0">
        <div className="mx-auto max-w-7xl">
          <HowToSection block={HOW_TO_BLOCK} />
        </div>
      </section>

      <section className="section-padding bg-sand-50" id="veranstaltungen">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-2xl font-bold text-aqua-900 sm:text-3xl">
            Veranstaltungen &amp; Preise
          </h2>
          <p className="mt-3 max-w-3xl text-slate-600">
            Babys und Kleinkinder mit oder ohne Eltern bzw. Geschwister. Hier finden Sie
            Informationen zu den AquaBaby- &amp; AquaBambini-Terminen u.&nbsp;a. im VitaSol in
            Bad Salzuflen.
          </p>

          <article className="mt-8 max-w-xl rounded-2xl border border-aqua-100 bg-white p-6 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-aqua-600">
              Babys / Kleinkinder
            </p>
            <h3 className="mt-2 font-display text-lg font-semibold text-aqua-900">
              {event.title}
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-aqua-500" aria-hidden />
                {event.dateLabel}
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-aqua-500" aria-hidden />
                {event.location}
              </li>
            </ul>
            <Button asChild className="mt-5" size="sm">
              <Link href="/shootings">Zum Termin</Link>
            </Button>
          </article>

          <div className="mt-8 rounded-2xl border border-aqua-100 bg-white p-6 sm:p-8">
            <h3 className="font-display text-xl font-semibold text-aqua-900">
              Jetzt für eine Veranstaltung anmelden
            </h3>
            <p className="mt-2 text-slate-600">
              Per WhatsApp-Nachricht, telefonisch oder per Mail. Um teilzunehmen, melden Sie
              sich bitte vorher an. Ohne Voranmeldung ist bei voller Teilnehmerzahl keine
              Teilnahme möglich. Bei zu geringer Nachfrage können Termine abgesagt werden –
              Angemeldete werden informiert.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild>
                <a href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}>
                  <Phone className="h-4 w-4" aria-hidden />
                  {siteConfig.phoneDisplay}
                </a>
              </Button>
              <Button asChild variant="outline">
                <ObfuscatedEmailLink className="inline-flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" aria-hidden />
                  E-Mail schreiben
                </ObfuscatedEmailLink>
              </Button>
              <Button asChild variant="outline">
                <Link href="/shootings">Termine online</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Keine passende Veranstaltung dabei? Schreiben Sie uns – bei Interesse planen wir
              zeitnah einen Termin.
            </p>
          </div>

          <p className="mt-6 text-sm text-slate-600">
            Bilder aus Bestellungen, die per Echtzeit-Überweisung bezahlt werden, werden auch
            unmittelbar nach der Zahlung zugesendet, in der Regel innerhalb weniger Minuten.
            Das gilt auch an Sonn- und Feiertagen. Bei Verzögerungen erreichen Sie den Support
            unter{" "}
            <a
              href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
              className="font-medium text-aqua-700 underline underline-offset-2"
            >
              {siteConfig.phoneDisplay}
            </a>
            .
          </p>
        </div>
      </section>

      <section className="section-padding scroll-mt-28 bg-white" id="preise">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-2xl font-bold text-aqua-900 sm:text-3xl">
            Preise bei unseren Veranstaltungen
          </h2>
          <div className="mt-6 grid gap-8 lg:grid-cols-2">
            <div className="space-y-4 text-slate-600">
              <p>
                Die Teilnahme an unseren Veranstaltungen ist grundsätzlich{" "}
                <strong className="font-medium text-aqua-900">kostenfrei</strong>, abgesehen von
                den Kosten für den Eintritt, die das jeweilige Schwimmbad erhebt.
              </p>
              <p>
                Im Anschluss haben Sie die Möglichkeit, die entstandenen Lichtbildwerke zu
                erwerben. Dabei erwerben Sie eine einmalige Erinnerung in Form einer hochwertig
                aufbereiteten Datei (.jpg) und damit verbunden jegliche Nutzungsrechte für Ihre
                privaten Zwecke.
              </p>
              <p>
                Das erste Werk kostet{" "}
                <strong className="text-aqua-900">{formatEuro(pricing.firstImagePrice)}</strong>,
                das zweite{" "}
                <strong className="text-aqua-900">{formatEuro(pricing.secondImagePrice)}</strong>{" "}
                und jedes weitere{" "}
                <strong className="text-aqua-900">{formatEuro(pricing.additionalPrice)}</strong>.
                Die Zahlung erfolgt per Vorkasse (Überweisung).
              </p>
            </div>
            <Card className="border-aqua-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Camera className="h-5 w-5 text-aqua-600" aria-hidden />
                  Bildpreise (Staffel)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-slate-700">
                  <li className="flex justify-between border-b border-slate-100 pb-2">
                    <span>1. Bild</span>
                    <span className="font-semibold text-aqua-900">
                      {formatEuro(pricing.firstImagePrice)}
                    </span>
                  </li>
                  <li className="flex justify-between border-b border-slate-100 pb-2">
                    <span>2. Bild</span>
                    <span className="font-semibold text-aqua-900">
                      {formatEuro(pricing.secondImagePrice)}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>jedes weitere Bild</span>
                    <span className="font-semibold text-aqua-900">
                      {formatEuro(pricing.additionalPrice)}
                    </span>
                  </li>
                </ul>
                <Button asChild className="mt-6 w-full" variant="outline">
                  <Link href="/bilder-bestellen">Zur Galerie</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="section-padding scroll-mt-28 bg-sand-50" id="faq">
        <FaqSection
          grouped={false}
          description="Kurze Antworten zu Anmeldung, Ablauf, Preisen und Bestellung."
        />
      </section>
    </>
  );
}
