"use client";

import { useState } from "react";
import { Bookmark, CalendarCheck, Copy } from "lucide-react";
import { AddToCalendarActions } from "@/components/shared/add-to-calendar-actions";
import { formatConfirmedAppointmentLabel } from "@/lib/voucher-appointment-format";
import { getVoucherSuccessUrl } from "@/lib/voucher-links";
import { siteConfig } from "@/lib/site-config";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  confirmedDate: string;
  confirmedTime: string | null;
  confirmedLocation: string | null;
  eventTitle: string;
  voucherCode?: string;
  purchaseNumber?: string;
  compact?: boolean;
};

export function VoucherConfirmedAppointment({
  confirmedDate,
  confirmedTime,
  confirmedLocation,
  eventTitle,
  voucherCode,
  purchaseNumber,
  compact = false,
}: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const label = formatConfirmedAppointmentLabel({
    confirmedDate: new Date(confirmedDate),
    confirmedTime,
    confirmedLocation,
  });
  const statusUrl = purchaseNumber ? getVoucherSuccessUrl(purchaseNumber) : null;

  async function copyStatusLink() {
    if (!statusUrl) return;
    try {
      await navigator.clipboard.writeText(statusUrl);
      setMessage("Link kopiert – Seite bookmarken oder speichern.");
    } catch {
      setMessage("Link konnte nicht kopiert werden.");
    }
  }

  return (
    <div
      className={
        compact
          ? "rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-left text-sm"
          : "mt-4 w-full rounded-xl border border-green-200 bg-green-50 p-4 text-left"
      }
    >
      <p className="flex items-center gap-2 font-medium text-green-900">
        <CalendarCheck className="h-4 w-4 shrink-0" aria-hidden />
        Termin bestätigt
      </p>
      <p className={cn(compact ? "mt-1 text-green-800" : "mt-2 text-sm text-green-800")}>
        {label}
      </p>
      <AddToCalendarActions
        compact
        title={`${siteConfig.name} – ${eventTitle}`}
        description={
          voucherCode
            ? `Gutschein ${voucherCode} · ${siteConfig.phoneDisplay}`
            : `${siteConfig.name} Shooting · ${siteConfig.phoneDisplay}`
        }
        date={confirmedDate}
        time={confirmedTime}
        location={confirmedLocation}
        uid={voucherCode ? `aquafotos-voucher-${voucherCode}@${siteConfig.emailDomain}` : undefined}
      />
      {statusUrl && (
        <div
          className={cn(
            "rounded-lg border border-green-200/80 bg-white/70 p-3",
            compact ? "mt-2" : "mt-3",
          )}
        >
          <p className="flex items-center gap-2 text-xs font-medium text-green-900">
            <Bookmark className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Status-Seite bookmarken
          </p>
          <p className="mt-1 text-xs text-green-800">
            Termin, Galerie und Gutschein-Status jederzeit abrufen:
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm" className="h-8 text-xs">
              <a href={statusUrl}>Zur Status-Seite</a>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={copyStatusLink}
            >
              <Copy className="h-3.5 w-3.5" aria-hidden />
              Link kopieren
            </Button>
          </div>
          {message && (
            <p className="mt-2 text-xs text-slate-600" role="status">
              {message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
