"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ObfuscatedEmailLink } from "@/components/obfuscated-email";
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

  return (
    <div className="pt-28">
      <section className="section-padding bg-sand-50">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-display text-4xl font-bold text-aqua-900">
            Kontakt
          </h1>
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
              <Select name="shootingType" required>
                <SelectTrigger>
                  <SelectValue placeholder="Shooting-Art" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(shootingTypeLabels) as ShootingType[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {shootingTypeLabels[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input name="location" placeholder="Bevorzugter Ort (optional)" />
              {notifyState?.success && (
                <p className="text-sm text-aqua-700">Erfolgreich angemeldet!</p>
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
              <Select name="shootingType" required>
                <SelectTrigger>
                  <SelectValue placeholder="Shooting-Art" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(shootingTypeLabels) as ShootingType[]).slice(0, 8).map((t) => (
                    <SelectItem key={t} value={t}>
                      {shootingTypeLabels[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input name="preferredDate" type="date" />
              <Textarea name="message" placeholder="Nachricht" />
              {reqState?.success && (
                <p className="text-sm text-aqua-700">Anfrage gesendet!</p>
              )}
              {reqState?.error && (
                <p className="text-sm text-red-600">{reqState.error}</p>
              )}
              <Button type="submit" disabled={reqPending} size="sm">
                Anfrage senden
              </Button>
            </form>
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            Feste Termine?{" "}
            <Link href="/shootings" className="text-aqua-600 underline">
              Shootings finden
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
