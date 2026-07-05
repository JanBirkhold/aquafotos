import Link from "next/link";
import {
  CalendarCheck,
  Camera,
  CheckCircle2,
  ClipboardList,
  Handshake,
  ShoppingBag,
  Sparkles,
  Users,
} from "lucide-react";
import { PartnerInquiryForm } from "@/components/sections/partner-inquiry-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  partnerBenefits,
  partnerHero,
  partnerPillars,
  partnerSegments,
  partnerSteps,
} from "@/lib/partner-marketing";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const pillarIcons = {
  anmeldung: ClipboardList,
  galerie: Camera,
  shop: ShoppingBag,
  abwicklung: CalendarCheck,
} as const;

export function PartnerBecomeHero() {
  return (
    <section className="section-padding bg-gradient-to-b from-aqua-50 via-white to-sand-50">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-aqua-600">
          Kooperation
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold text-aqua-900 sm:text-5xl">
          {partnerHero.headline}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
          {partnerHero.subline}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="#partner-anfrage">{partnerHero.ctaPrimary}</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="#ablauf">{partnerHero.ctaSecondary}</Link>
          </Button>
        </div>
        <p className="mt-6 text-sm text-slate-500">
          Schwimmbäder · Kitas · Hebammen · Familienzentren in OWL & Umgebung
        </p>
      </div>
    </section>
  );
}

export function PartnerPillarsSection() {
  return (
    <section className="section-padding bg-white">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold text-aqua-900">
            Alles aus einer Hand
          </h2>
          <p className="mt-3 text-slate-600">
            Sie stellen den Raum und Ihre Zielgruppe – wir liefern die komplette
            Fotografie-Infrastruktur.
          </p>
        </div>
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {partnerPillars.map((pillar) => {
            const Icon = pillarIcons[pillar.id];
            return (
              <li key={pillar.id}>
                <Card className="h-full border-aqua-100 shadow-sm transition-shadow hover:shadow-md">
                  <CardContent className="p-6">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-aqua-100 text-aqua-700">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <h3 className="mt-4 font-display text-lg font-semibold text-aqua-900">
                      {pillar.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {pillar.description}
                    </p>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export function PartnerProcessSection() {
  return (
    <section id="ablauf" className="section-padding bg-sand-50">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold text-aqua-900">
            So läuft die Partnerschaft
          </h2>
          <p className="mt-3 text-slate-600">
            Vier Schritte – danach haben Sie ein fertiges Premium-Angebot, ohne
            laufenden Verwaltungsaufwand.
          </p>
        </div>
        <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {partnerSteps.map((step) => (
            <li
              key={step.step}
              className="relative rounded-2xl border border-aqua-100 bg-white p-6 shadow-sm"
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full bg-aqua-600 text-sm font-bold text-white"
                aria-hidden
              >
                {step.step}
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-aqua-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function PartnerBenefitsSection() {
  return (
    <section className="section-padding bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
        <div className="rounded-2xl border border-aqua-100 bg-aqua-50/40 p-8">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-aqua-600" aria-hidden />
            <h2 className="font-display text-2xl font-bold text-aqua-900">
              Ihr Mehrwert
            </h2>
          </div>
          <ul className="mt-6 space-y-3">
            {partnerBenefits.forYou.map((item) => (
              <li key={item} className="flex gap-3 text-slate-700">
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-green-600"
                  aria-hidden
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-8">
          <div className="flex items-center gap-3">
            <Handshake className="h-6 w-6 text-aqua-600" aria-hidden />
            <h2 className="font-display text-2xl font-bold text-aqua-900">
              Unser Service für Sie
            </h2>
          </div>
          <ul className="mt-6 space-y-3">
            {partnerBenefits.weHandle.map((item) => (
              <li key={item} className="flex gap-3 text-slate-700">
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-aqua-600"
                  aria-hidden
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function PartnerSegmentsSection() {
  return (
    <section className="section-padding bg-sand-50">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold text-aqua-900">
            Passend für Ihre Einrichtung
          </h2>
          <p className="mt-3 text-slate-600">
            Egal ob Becken, Gruppenraum oder Familiencafé – wir sprechen die Sprache
            Ihrer Zielgruppe.
          </p>
        </div>
        <ul className="mt-12 grid gap-6 sm:grid-cols-2">
          {partnerSegments.map((segment) => (
            <li key={segment.type}>
              <Card className="h-full overflow-hidden border-aqua-100">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-aqua-700 to-aqua-800 px-6 py-4 text-white">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 opacity-90" aria-hidden />
                      <h3 className="font-display text-xl font-semibold">
                        {segment.title}
                      </h3>
                    </div>
                    <p className="mt-2 text-sm text-aqua-100">{segment.hook}</p>
                  </div>
                  <ul className="space-y-3 p-6">
                    {segment.benefits.map((benefit) => (
                      <li
                        key={benefit}
                        className={cn("flex gap-3 text-sm text-slate-700")}
                      >
                        <CheckCircle2
                          className="mt-0.5 h-4 w-4 shrink-0 text-aqua-600"
                          aria-hidden
                        />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function PartnerInquirySection() {
  return (
    <section id="partner-anfrage" className="section-padding bg-gradient-to-b from-sand-50 to-white">
      <div className="mx-auto max-w-xl">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold text-aqua-900">
            Termin anfragen
          </h2>
          <p className="mt-3 text-slate-600">
            Unternehmen, Ort und E-Mail – wir melden uns mit einem unverbindlichen
            Terminvorschlag. Kein Telefon, kein langes Formular.
          </p>
        </div>
        <div className="mt-8">
          <PartnerInquiryForm />
        </div>
      </div>
    </section>
  );
}

export function PartnerCtaSection() {
  return (
    <section className="section-padding bg-gradient-to-br from-aqua-800 to-aqua-950 text-white">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-display text-3xl font-bold">Noch Fragen?</h2>
        <p className="mt-4 text-lg text-aqua-100">
          Rufen Sie uns an – wir erklären den Ablauf in wenigen Minuten.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" variant="secondary">
            <Link href="#partner-anfrage">Termin per E-Mail anfragen</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/30 bg-transparent text-white hover:bg-white/10"
          >
            <Link href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}>
              {siteConfig.phoneDisplay} anrufen
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
