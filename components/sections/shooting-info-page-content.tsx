import Link from "next/link";
import {
  CalendarDays,
  Camera,
  Gift,
  MapPin,
  Users,
} from "lucide-react";
import { FaqSection } from "@/components/sections/faq-section";
import { HowToSection } from "@/components/sections/how-to-section";
import { ShootingInfoCategoryNav } from "@/components/sections/shooting-info-category-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatEventDate,
  getPublishedEvents,
  getSpotsLeft,
} from "@/lib/events";
import { formatEuro } from "@/lib/pricing";
import { getActivePricing } from "@/lib/shop-queries";
import { siteConfig } from "@/lib/site-config";
import {
  HOW_TO_BLOCKS,
  type ShootingInfoSlug,
} from "@/lib/shooting-info-content";
import { shootingCategoryLabels } from "@/lib/shooting-types";

type Props = {
  activeCategory?: ShootingInfoSlug;
};

export async function ShootingInfoPageContent({ activeCategory }: Props) {
  const [events, pricing] = await Promise.all([getPublishedEvents(), getActivePricing()]);

  return (
    <>
      <section className="section-padding pb-8 pt-4">
        <div className="mx-auto max-w-7xl">
          <ShootingInfoCategoryNav activeSlug={activeCategory} />
        </div>
      </section>

      <section className="section-padding bg-white pt-0">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 text-center">
            <h2 className="font-display text-2xl font-bold text-aqua-900 sm:text-3xl">
              So funktioniert&apos;s
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-slate-600">
              Ablauf, Anmeldung und Galerie – für jedes Shooting-Angebot erklärt.
            </p>
          </div>
          {HOW_TO_BLOCKS.map((block) => (
            <HowToSection key={block.slug} block={block} />
          ))}
        </div>
      </section>

      <section className="section-padding bg-sand-50" id="termine">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-2xl font-bold text-aqua-900 sm:text-3xl">
            Aktuelle Termine
          </h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            Restplätze, Warteliste und Online-Anmeldung. Bilder bestellen Sie danach in der{" "}
            <Link href="/bilder-bestellen" className="text-aqua-700 underline underline-offset-2">
              persönlichen Galerie
            </Link>
            .
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {events.length === 0 ? (
              <Card className="md:col-span-2">
                <CardContent className="p-8 text-center text-slate-600">
                  <CalendarDays className="mx-auto h-10 w-10 text-aqua-400" aria-hidden />
                  <p className="mt-4 font-medium text-aqua-900">Nächster Termin folgt.</p>
                  <p className="mt-2 text-sm">
                    <Link href="/kontakt" className="text-aqua-700 underline">
                      Benachrichtigung anfordern
                    </Link>
                  </p>
                </CardContent>
              </Card>
            ) : (
              events.map((event) => {
                const spotsLeft = getSpotsLeft(event);
                const isFull = spotsLeft === 0;

                return (
                  <Card key={event.id}>
                    <CardHeader className="pb-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-aqua-600">
                        {shootingCategoryLabels[event.category]}
                      </p>
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-slate-600">
                        <li className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-aqua-500" aria-hidden />
                          {formatEventDate(event.date)}
                        </li>
                        <li className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-aqua-500" aria-hidden />
                          {event.location}
                        </li>
                        <li className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-aqua-500" aria-hidden />
                          {isFull
                            ? "Ausgebucht – Warteliste möglich"
                            : `${spotsLeft} Restplätze`}
                        </li>
                      </ul>
                      <Button asChild className="mt-4" size="sm">
                        <Link href={`/shootings/${event.id}`}>
                          {isFull ? "Zur Warteliste" : "Jetzt anmelden"}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          <div className="mt-8 rounded-2xl border border-aqua-100 bg-white p-6 sm:p-8">
            <h3 className="font-display text-xl font-semibold text-aqua-900">
              Jetzt anmelden
            </h3>
            <p className="mt-2 text-slate-600">
              Melden Sie sich vorab online an. Ohne Voranmeldung ist eine Teilnahme nicht möglich,
              wenn die Höchstteilnehmerzahl erreicht ist.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/shootings">Alle Termine</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/kontakt">Individuelle Anfrage</Link>
              </Button>
              <Button asChild variant="outline">
                <a href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}>
                  {siteConfig.phoneDisplay}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding scroll-mt-28 bg-white" id="preise">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-2xl font-bold text-aqua-900 sm:text-3xl">
            Preise
          </h2>
          <div className="mt-6 grid gap-8 lg:grid-cols-2">
            <div className="text-slate-600">
              <p>
                Die <strong className="font-medium text-aqua-900">Teilnahme</strong> an unseren
                Shootings ist grundsätzlich kostenfrei – abgesehen von ggf. Eintritt (Schwimmbad)
                oder vereinbarten Konditionen vor Ort.
              </p>
              <p className="mt-4">
                Bilder erwerben Sie optional: hochwertig aufbereitete JPG-Dateien inklusive
                Nutzungsrechte für private Zwecke.
              </p>
              <p className="mt-4 text-sm text-slate-500">
                Bestellung über Ihre Galerie. Bei Echtzeit-Überweisung stehen Dateien in der Regel
                innerhalb weniger Minuten bereit.
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

      <section className="section-padding bg-gradient-to-br from-aqua-50 to-sand-50">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-aqua-900 sm:text-3xl">
                <Gift className="h-7 w-7 text-aqua-600" aria-hidden />
                Gutschein verschenken
              </h2>
              <p className="mt-4 text-slate-600">
                Ideal zu Geburtstagen, Weihnachten oder als besondere Überraschung – für alle
                Shooting-Arten. Wunschtermin wählen, per Überweisung zahlen, Code & QR nach Freigabe.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/gutschein">Gutschein erwerben</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/gutschein/einloesen">Gutschein einlösen</Link>
                </Button>
              </div>
            </div>
            <div className="rounded-2xl border border-aqua-100 bg-white p-6 text-sm text-slate-600 shadow-sm">
              <p className="font-medium text-aqua-900">So funktioniert&apos;s</p>
              <ol className="mt-3 list-inside list-decimal space-y-2">
                <li>Gutschein auswählen und Wunschtermin angeben</li>
                <li>Verbindlich bestellen und per Überweisung zahlen</li>
                <li>Code & QR erhalten, Termin online einlösen</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding scroll-mt-28 bg-sand-50" id="faq">
        <FaqSection grouped />
      </section>
    </>
  );
}
