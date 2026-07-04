import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShootingsCategoryFilter } from "@/components/sections/shootings-category-filter";
import { categoryFromSlug, filterLabelFromSlug } from "@/lib/shooting-filters";
import { createPageMetadata } from "@/lib/seo";
import {
  getPublishedEvents,
  getSpotsLeft,
  formatEventDate,
} from "@/lib/events";
import { shootingCategoryLabels, shootingTypeLabels } from "@/lib/shooting-types";

export const metadata: Metadata = createPageMetadata({
  title: "Shootings & Termine – AquaFotos",
  description:
    "Verfügbare Fotoshootings in Barntrup und OWL: Unterwasser, Kita, Baby, Familie und Aktionen. Restplätze live einsehen.",
  path: "/shootings",
});

type Props = {
  searchParams: Promise<{ kategorie?: string }>;
};

export default async function ShootingsPage({ searchParams }: Props) {
  const { kategorie } = await searchParams;
  const categoryFilter = categoryFromSlug(kategorie);
  const allEvents = await getPublishedEvents();
  const events = categoryFilter
    ? allEvents.filter((e) => e.category === categoryFilter)
    : allEvents;

  const activeLabel = filterLabelFromSlug(kategorie);

  return (
    <div className="pt-28">
      <section className="section-padding bg-gradient-to-b from-aqua-50/60 to-sand-50">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-display text-4xl font-bold text-aqua-900">
            Termine finden
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Alle Events auf einen Blick – oder nach Kategorie filtern.
            Feste Termine mit Teilnehmerlimit, Restplätzen und Warteliste.
          </p>
          <div className="mt-8">
            <Suspense fallback={<div className="h-10 animate-pulse rounded-full bg-aqua-100" />}>
              <ShootingsCategoryFilter />
            </Suspense>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="mx-auto max-w-7xl">
          {activeLabel && (
            <p className="mb-6 text-sm text-slate-500">
              {events.length} Termin{events.length !== 1 ? "e" : ""} in{" "}
              <span className="font-medium text-aqua-800">{activeLabel}</span>
              {" · "}
              <Link href="/shootings" className="text-aqua-600 hover:underline">
                Alle anzeigen
              </Link>
            </p>
          )}

          <div className="grid gap-6">
            {events.length === 0 ? (
              <p className="text-center text-slate-500">
                {activeLabel
                  ? `Keine Termine in „${activeLabel}". `
                  : "Aktuell keine Termine. "}
                <Link href="/kontakt" className="text-aqua-600 underline">
                  Benachrichtigung anfordern
                </Link>
              </p>
            ) : (
              events.map((event) => {
                const spotsLeft = getSpotsLeft(event);
                const isFull = spotsLeft === 0;

                return (
                  <Card key={event.id}>
                    <CardHeader>
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-aqua-100 px-2.5 py-0.5 text-xs font-medium text-aqua-800">
                              {shootingCategoryLabels[event.category]}
                            </span>
                            <p className="text-sm font-medium text-aqua-600">
                              {shootingTypeLabels[event.shootingType]}
                            </p>
                          </div>
                          <CardTitle className="mt-1">{event.title}</CardTitle>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-medium ${
                            isFull
                              ? "bg-amber-100 text-amber-800"
                              : "bg-aqua-100 text-aqua-800"
                          }`}
                        >
                          {isFull
                            ? "Ausgebucht"
                            : `${event._count.participants} von ${event.maxParticipants} Plätze vergeben`}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="flex flex-wrap gap-4 text-sm text-slate-600">
                        <li className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-aqua-500" aria-hidden />
                          {formatEventDate(event.date)}
                        </li>
                        <li className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-aqua-500" aria-hidden />
                          {event.location}
                        </li>
                        {!isFull && (
                          <li className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-aqua-500" aria-hidden />
                            {spotsLeft} Restplätze
                          </li>
                        )}
                      </ul>
                      <Button asChild className="mt-4">
                        <Link href={`/shootings/${event.id}`}>
                          {isFull ? "Warteliste" : "Anmelden"}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
