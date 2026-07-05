"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CalendarDays, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ObfuscatedEmailLink } from "@/components/obfuscated-email";
import { FormShootingTypeSelect } from "@/components/forms/form-shooting-type-select";
import { siteConfig } from "@/lib/site-config";
import {
  requestIndividualShooting,
  subscribeToShootingNotifications,
} from "@/lib/actions/events";
import { shootingTypeLabels } from "@/lib/shooting-types";
import type { ShootingType } from "@prisma/client";

export function KontaktContent() {
  const [notifyState, notifyAction, notifyPending] = useActionState(
    async (_p: { error?: string; success?: boolean } | null, fd: FormData) =>
      subscribeToShootingNotifications(fd),
    null,
  );

  const [reqState, reqAction, reqPending] = useActionState(
    async (_p: { error?: string; success?: boolean } | null, fd: FormData) =>
      requestIndividualShooting(fd),
    null,
  );

  const shootingOptions = (Object.keys(shootingTypeLabels) as ShootingType[]).map(
    (type) => ({ value: type, label: shootingTypeLabels[type] }),
  );

  return (
    <div className="pt-28">
      <section className="section-padding bg-sand-50">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl font-bold text-aqua-900">
                Kontakt
              </h1>
              <p className="mt-2 max-w-xl text-sm text-slate-600">
                Individuelle Wünsche unten anfragen – feste Termine buchen Sie direkt online.
              </p>
            </div>
            <Button asChild size="lg" className="shrink-0 shadow-lg shadow-aqua-500/20">
              <Link href="/shootings">
                <CalendarDays className="h-5 w-5" aria-hidden />
                Feste Termine – Shootings
              </Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <div className="space-y-4 text-slate-600">
              <a
                href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-3 hover:text-aqua-700"
              >
                <Phone className="h-5 w-5 text-aqua-500" />
                {siteConfig.phoneDisplay}
              </a>
              <ObfuscatedEmailLink className="flex items-center gap-3 hover:text-aqua-700">
                <Mail className="h-5 w-5 text-aqua-500" />
                E-Mail schreiben
              </ObfuscatedEmailLink>
              <p className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-aqua-500" />
                {siteConfig.address.street}, {siteConfig.address.postalCode}{" "}
                {siteConfig.address.city}
              </p>
            </div>

            <form action={notifyAction} className="space-y-4 rounded-3xl glass p-6 lg:col-span-1">
              <h2 className="font-display text-lg font-semibold text-aqua-900">
                Neue Termine – Benachrichtigung
              </h2>
              <p className="text-sm text-slate-600">
                Informieren Sie mich über neue Termine.
              </p>
              <Input name="email" type="email" placeholder="E-Mail *" required />
              <FormShootingTypeSelect
                name="shootingType"
                required
                placeholder="Shooting-Art"
                options={shootingOptions}
              />
              <Input name="location" placeholder="Bevorzugter Ort (optional)" />
              {notifyState?.error && (
                <p className="text-sm text-red-600" role="alert">
                  {notifyState.error}
                </p>
              )}
              {notifyState?.success && (
                <p className="text-sm text-aqua-700" role="status">
                  Erfolgreich angemeldet!
                </p>
              )}
              <Button type="submit" disabled={notifyPending} size="sm">
                Benachrichtigen
              </Button>
            </form>

            <form action={reqAction} className="space-y-4 rounded-3xl glass p-6 lg:col-span-1">
              <h2 className="font-display text-lg font-semibold text-aqua-900">
                Individuelles Shooting
              </h2>
              <p className="text-sm text-slate-600">
                Nur ein Teilnehmer? Wunschdatum anfragen – wir bestätigen den
                Termin per Mail.
              </p>
              <Input name="parentName" placeholder="Name *" required />
              <Input name="childName" placeholder="Kind (optional)" />
              <Input name="email" type="email" placeholder="E-Mail *" required />
              <Input name="phone" type="tel" placeholder="Telefon *" required />
              <FormShootingTypeSelect
                name="shootingType"
                required
                placeholder="Shooting-Art"
                options={shootingOptions.slice(0, 8)}
              />
              <Input name="preferredDate" type="date" />
              <Textarea name="message" placeholder="Nachricht" />
              {reqState?.success && (
                <p className="text-sm text-aqua-700" role="status">
                  Anfrage gespeichert – wir melden uns bei Ihnen!
                </p>
              )}
              {reqState?.error && (
                <p className="text-sm text-red-600">{reqState.error}</p>
              )}
              <Button type="submit" disabled={reqPending} size="sm">
                Anfrage senden
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
