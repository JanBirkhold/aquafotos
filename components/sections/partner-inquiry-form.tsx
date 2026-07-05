"use client";

import { useActionState } from "react";
import { Loader2, Building2, MapPin, Mail } from "lucide-react";
import {
  submitPartnerInquiry,
  type PartnerInquiryState,
} from "@/lib/actions/partner";
import { EmailSubmitSuccess } from "@/components/ui/email-submit-success";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PartnerInquiryForm() {
  const [state, formAction, pending] = useActionState<PartnerInquiryState, FormData>(
    submitPartnerInquiry,
    null,
  );

  if (state?.success) {
    return (
      <EmailSubmitSuccess
        title={state.emailSent ? "Anfrage gesendet" : "Anfrage gespeichert"}
        message="Vielen Dank! Wir melden uns per E-Mail mit einem Terminvorschlag."
        emailSent={state.emailSent}
        emailNotice={state.emailNotice}
      />
    );
  }

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-aqua-100 bg-white p-6 shadow-sm sm:p-8"
    >
      {state?.error && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {state.error}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="company">Unternehmen / Einrichtung *</Label>
          <div className="relative">
            <Building2
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <Input
              id="company"
              name="company"
              required
              autoComplete="organization"
              placeholder="z. B. Vitasol Therme"
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Ort *</Label>
          <div className="relative">
            <MapPin
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <Input
              id="location"
              name="location"
              required
              autoComplete="address-level2"
              placeholder="z. B. Bad Salzuflen"
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Ihre E-Mail *</Label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="kontakt@beispiel.de"
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <label className="mt-5 flex items-start gap-2 text-sm text-slate-600">
        <input type="checkbox" name="gdprConsent" required className="mt-1" />
        <span>
          Ich willige ein, dass AquaFotos meine Angaben zur Bearbeitung der Partner-Anfrage
          per E-Mail nutzt. *
        </span>
      </label>

      <Button type="submit" className="mt-6 w-full sm:w-auto" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Wird gesendet…
          </>
        ) : (
          "Termin per E-Mail anfragen"
        )}
      </Button>
    </form>
  );
}
