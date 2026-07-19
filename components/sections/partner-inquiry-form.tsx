"use client";

import { Building2, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { siteConfig } from "@/lib/site-config";

export function PartnerInquiryForm() {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const company = String(fd.get("company") ?? "").trim();
    const location = String(fd.get("location") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const subject = encodeURIComponent(`Partner-Anfrage: ${company}`);
    const body = encodeURIComponent(
      `Unternehmen: ${company}\nOrt: ${location}\nE-Mail: ${email}\n\nNachricht:\n`,
    );
    window.location.href = `mailto:${siteConfig.emailUser}@${siteConfig.emailDomain}?subject=${subject}&body=${body}`;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-aqua-100 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="company">
            <Building2 className="mr-1 inline h-4 w-4" aria-hidden />
            Unternehmen*
          </Label>
          <Input id="company" name="company" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">
            <MapPin className="mr-1 inline h-4 w-4" aria-hidden />
            Ort*
          </Label>
          <Input id="location" name="location" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">
            <Mail className="mr-1 inline h-4 w-4" aria-hidden />
            E-Mail*
          </Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <Button type="submit" className="w-full">
          Anfrage per E-Mail öffnen
        </Button>
      </div>
    </form>
  );
}
