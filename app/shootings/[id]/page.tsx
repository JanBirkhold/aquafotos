import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, MapPin } from "lucide-react";
import { EventRegistrationForm } from "@/components/sections/event-registration-form";
import { WaitlistForm } from "@/components/sections/waitlist-form";
import { createPageMetadata } from "@/lib/seo";
import {
  getEventById,
  getSpotsLeft,
  formatEventDate,
  serializeEvent,
} from "@/lib/events";
import { shootingTypeLabels } from "@/lib/shooting-types";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) return {};

  return createPageMetadata({
    title: `${event.title} – Termin buchen`,
    description: `${shootingTypeLabels[event.shootingType]} am ${formatEventDate(event.date)} in ${event.location}.`,
    path: `/shootings/${id}`,
  });
}

export default async function ShootingDetailPage({ params }: Props) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();

  const spotsLeft = getSpotsLeft(event);
  const isFull = spotsLeft === 0;

  return (
    <div className="pt-28">
      <section className="section-padding bg-sand-50">
        <div className="mx-auto max-w-3xl">
          <Link href="/shootings" className="text-sm text-aqua-600 hover:underline">
            ← Alle Shootings
          </Link>
          <p className="mt-4 text-sm font-medium text-aqua-600">
            {shootingTypeLabels[event.shootingType]}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-aqua-900 sm:text-4xl">
            {event.title}
          </h1>
          {event.description && (
            <p className="mt-4 text-lg text-slate-600">{event.description}</p>
          )}
          <ul className="mt-6 space-y-2 text-slate-600">
            <li className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-aqua-500" />
              {formatEventDate(event.date)}
              {event.startTime && ` · ${event.startTime}`}
              {event.endTime && ` – ${event.endTime}`}
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-aqua-500" />
              {event.location}
            </li>
          </ul>
          <p className="mt-4 text-sm font-medium text-slate-700">
            {event._count.participants} von {event.maxParticipants} Plätze
            vergeben
            {!isFull && ` · ${spotsLeft} frei`}
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="mx-auto max-w-3xl">
          {isFull ? (
            event.allowWaitlist ? (
              <WaitlistForm eventId={event.id} category={event.category} />
            ) : (
              <p className="text-slate-600">Dieser Termin ist ausgebucht.</p>
            )
          ) : (
            <EventRegistrationForm event={serializeEvent(event)} />
          )}
        </div>
      </section>
    </div>
  );
}
