"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  joinWaitlist,
  type WaitlistFormState,
} from "@/lib/actions/events";
import { getRegistrationFields } from "@/lib/registration-fields";
import type { ShootingCategory } from "@prisma/client";

type Props = {
  eventId: string;
  category: ShootingCategory;
};

export function WaitlistForm({ eventId, category }: Props) {
  const fields = getRegistrationFields(category);
  const [state, action, pending] = useActionState<WaitlistFormState, FormData>(
    joinWaitlist,
    null,
  );

  if (state?.success) {
    return (
      <p className="rounded-2xl bg-aqua-50 p-4 text-sm text-aqua-800" role="status">
        Sie stehen auf der Warteliste. Wir informieren Sie bei freien Plätzen.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-3 rounded-2xl border border-aqua-100 bg-white p-5">
      <h4 className="font-semibold text-aqua-900">Auf Warteliste setzen</h4>
      <input type="hidden" name="eventId" value={eventId} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="parentName" placeholder={fields.parentLabel.replace(" *", "")} required />
        <Input name="childName" placeholder={fields.waitlistChildPlaceholder} />
      </div>
      <Input name="email" type="email" placeholder="E-Mail *" required />
      <Input name="phone" type="tel" placeholder="Telefon" />
      {state?.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" variant="outline" disabled={pending} size="sm">
        Auf Warteliste
      </Button>
    </form>
  );
}
