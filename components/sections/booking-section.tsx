"use client";

import { useActionState } from "react";
import { Calendar, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormShootingTypeSelect } from "@/components/forms/form-shooting-type-select";
import { requestIndividualShooting } from "@/lib/actions/events";
import { shootingTypeLabels } from "@/lib/shooting-types";
import type { ShootingType } from "@prisma/client";

const underwaterOptions = (
  [
    "UNDERWATER_BABY",
    "UNDERWATER_TODDLER",
    "UNDERWATER_CHILD",
    "UNDERWATER_FAMILY",
    "UNDERWATER_SIBLINGS",
    "CHRISTMAS_MINIS",
    "OTHER",
  ] as ShootingType[]
).map((type) => ({ value: type, label: shootingTypeLabels[type] }));

export function BookingSection() {
  const [state, action, pending] = useActionState(
    async (_p: { error?: string; success?: boolean } | null, fd: FormData) =>
      requestIndividualShooting(fd),
    null,
  );

  return (
    <section
      id="termin"
      aria-labelledby="booking-heading"
      className="section-padding relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-aqua-600 via-aqua-700 to-aqua-900" />
      <div className="water-shimmer absolute inset-0 opacity-30" aria-hidden="true" />

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center text-white">
          <Calendar className="mx-auto h-10 w-10 text-aqua-200" aria-hidden="true" />
          <h2
            id="booking-heading"
            className="mt-4 font-display text-3xl font-bold sm:text-4xl"
          >
            Bereit für besondere Unterwasserbilder?
          </h2>
          <p className="mt-4 text-lg text-aqua-100">
            Sichern Sie sich jetzt Ihren Termin für ein individuelles AquaFotos
            Shooting.
          </p>
        </div>

        {state?.success ? (
          <div
            className="mt-10 rounded-3xl glass p-8 text-center"
            role="status"
          >
            <h3 className="text-xl font-semibold text-aqua-900">
              Vielen Dank für Ihre Anfrage!
            </h3>
            <p className="mt-2 text-slate-600">
              Wir melden uns in Kürze bei Ihnen, um Ihren Wunschtermin zu
              bestätigen.
            </p>
          </div>
        ) : (
          <form
            action={action}
            className="mt-10 space-y-5 rounded-3xl glass p-6 sm:p-8"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="parentName">Name *</Label>
                <Input
                  id="parentName"
                  name="parentName"
                  required
                  autoComplete="name"
                  placeholder="Ihr Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefonnummer *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  placeholder="0157 …"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-Mail *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="ihre@email.de"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="preferredDate">Wunschdatum</Label>
                <Input id="preferredDate" name="preferredDate" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shooting-type">Shooting-Art *</Label>
                <FormShootingTypeSelect
                  id="shooting-type"
                  name="shootingType"
                  required
                  placeholder="Shooting-Art wählen"
                  options={underwaterOptions}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Nachricht</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Erzählen Sie uns von Ihrem Wunsch-Shooting …"
              />
            </div>

            {state?.error && (
              <p className="text-sm text-red-600" role="alert">
                {state.error}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={pending}>
              <Send className="h-4 w-4" aria-hidden="true" />
              Termin anfragen
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
