import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  categoryShootingTypes,
  getServiceBySlug,
  shootingTypeLabels,
} from "@/lib/shooting-types";
import type { ServicePage } from "@/lib/shooting-types";

type ServicePageTemplateProps = {
  service: ServicePage;
};

export function ServicePageTemplate({ service }: ServicePageTemplateProps) {
  const types = categoryShootingTypes[service.category];

  return (
    <>
      <section className="relative min-h-[50vh] overflow-hidden pt-28">
        <div className="absolute inset-0">
          <Image
            src={service.image}
            alt={service.imageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-aqua-950/85 via-aqua-900/70 to-aqua-950/50" />
        </div>
        <div className="relative mx-auto max-w-7xl section-padding">
          <p className="text-sm font-semibold uppercase tracking-wider text-aqua-200">
            {service.audience}
          </p>
          <h1 className="mt-2 max-w-2xl font-display text-4xl font-bold text-white sm:text-5xl">
            {service.headline}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-aqua-100">{service.subline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/shootings">Shooting finden</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/kontakt">Kontakt aufnehmen</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="section-padding bg-sand-50">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold text-aqua-900">
              Ihre Herausforderungen
            </h2>
            <ul className="mt-4 space-y-3">
              {service.problems.map((p) => (
                <li key={p} className="flex gap-3 text-slate-600">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-aqua-500" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <Card className="border-aqua-100">
            <CardContent className="p-8">
              <p className="font-display text-xl font-semibold text-aqua-800">
                &bdquo;{service.message}&ldquo;
              </p>
              <p className="mt-4 text-slate-600">
                AquaFotos begleitet Sie persönlich – von der Anmeldung bis zur
                fertigen Galerie. Keine freien Kalenderbuchungen, sondern
                durchdachte Events mit klarer Terminlogik.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="section-padding">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-2xl font-bold text-aqua-900">
            Unsere {service.title}-Angebote
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {types.map((type) => (
              <Link
                key={type}
                href={`/shootings?typ=${type}`}
                className="group flex items-center justify-between rounded-2xl border border-aqua-100 bg-white p-5 transition-shadow hover:shadow-lg hover:shadow-aqua-900/5"
              >
                <span className="font-medium text-slate-700 group-hover:text-aqua-700">
                  {shootingTypeLabels[type]}
                </span>
                <ArrowRight className="h-4 w-4 text-aqua-400 transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-aqua-950 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-aqua-300" />
          <h2 className="mt-4 font-display text-2xl font-bold">
            Bereit für Ihr Shooting?
          </h2>
          <p className="mt-3 text-aqua-100">
            Verfügbare Termine, Restplätze und Warteliste – alles transparent
            online.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link href="/shootings">Termine ansehen</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

export function createServicePage(slug: string) {
  const service = getServiceBySlug(slug);
  if (!service) return null;
  return service;
}
