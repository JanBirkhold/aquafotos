"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  registerForEvent,
  type RegisterFormState,
} from "@/lib/actions/events";
import type { SerializedEvent } from "@/lib/events";
import { getRegistrationFields } from "@/lib/registration-fields";
import { cn } from "@/lib/utils";

type Props = {
  event: SerializedEvent;
};

const selectClassName = cn(
  "flex h-11 w-full rounded-2xl border border-aqua-200/60 bg-white/80 px-4 py-2 text-sm shadow-sm",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-500",
);

export function EventRegistrationForm({ event }: Props) {
  const fields = getRegistrationFields(event.category);
  const [state, action, pending] = useActionState<RegisterFormState, FormData>(
    registerForEvent,
    null,
  );

  if (state?.success) {
    const emailWarning = state.emailSent === false;

    return (
      <div
        className={cn(
          "rounded-3xl border p-8 text-center",
          emailWarning ? "border-amber-200 bg-amber-50" : "border-aqua-200 bg-aqua-50",
        )}
        role="status"
      >
        <h3 className="font-display text-xl font-semibold text-aqua-900">
          Anmeldung erfolgreich!
        </h3>
        {state.emailSent !== false && (
          <p className="mt-2 text-slate-600">
            Vielen Dank – Sie erhalten eine Bestätigung per E-Mail.
          </p>
        )}
        {state.emailNotice && (
          <p className="mt-2 text-sm text-amber-800" role="note">
            {state.emailNotice}
          </p>
        )}
        {state.accessCode && (
          <p className="mt-4 rounded-2xl bg-white px-4 py-3 font-mono text-sm text-aqua-800">
            Ihr Zugangscode: <strong>{state.accessCode}</strong>
          </p>
        )}
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4 rounded-3xl glass p-6 sm:p-8">
      <input type="hidden" name="eventId" value={event.id} />
      <h3 className="font-display text-xl font-semibold text-aqua-900">
        Jetzt anmelden
      </h3>

      {event.slots.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="slotId">Uhrzeit wählen *</Label>
          <select id="slotId" name="slotId" required className={selectClassName}>
            <option value="">Bitte wählen</option>
            {event.slots.map((slot) => (
              <option key={slot.id} value={slot.id}>
                {slot.startTime}
                {slot.endTime ? ` – ${slot.endTime}` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="parentName">{fields.parentLabel}</Label>
          <Input id="parentName" name="parentName" required autoComplete="name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="childName">{fields.childLabel}</Label>
          <Input id="childName" name="childName" required autoComplete="name" />
        </div>
      </div>

      <div className={cn("grid gap-4", fields.showChildAge ? "sm:grid-cols-2" : "")}>
        {fields.showChildAge && (
          <div className="space-y-2">
            <Label htmlFor="childAge">{fields.childAgeLabel}</Label>
            <Input id="childAge" name="childAge" type="number" min={0} max={18} />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="phone">Telefon *</Label>
          <Input id="phone" name="phone" type="tel" required autoComplete="tel" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-Mail *</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>

      <label className="flex items-start gap-3 text-sm text-slate-600">
        <input type="checkbox" name="gdprConsent" required className="mt-1" />
        <span>
          Ich willige in die Verarbeitung meiner Daten gemäß der{" "}
          <Link href="/datenschutz" className="text-aqua-600 underline">
            Datenschutzerklärung
          </Link>{" "}
          ein. *
        </span>
      </label>

      {state?.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Wird gesendet…" : "Verbindlich anmelden"}
      </Button>
    </form>
  );
}
