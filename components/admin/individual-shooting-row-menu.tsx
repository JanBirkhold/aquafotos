"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarPlus,
  Download,
  ExternalLink,
  Mail,
  MoreHorizontal,
} from "lucide-react";
import { VoucherRedemptionReschedule } from "@/components/admin/voucher-redemption-reschedule";
import {
  buildGoogleCalendarUrl,
  buildOutlookWebUrl,
  calendarIcsFilename,
  downloadIcsFile,
  type CalendarEventInput,
} from "@/lib/calendar-export";
import { siteConfig } from "@/lib/site-config";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type IndividualShootingMenuRow = {
  voucherId: string;
  voucherCode: string;
  purchaseNumber: string | null;
  productTitle: string;
  parentName: string;
  confirmedDate: string;
  confirmedTime: string | null;
  confirmedLocation: string | null;
  currentLabel: string;
  defaultDate: string;
  defaultTime: string;
  defaultLocation: string;
  email: string;
};

type Props = {
  row: IndividualShootingMenuRow;
  showReschedule?: boolean;
};

export function IndividualShootingRowMenu({ row, showReschedule = true }: Props) {
  const [rescheduleOpen, setRescheduleOpen] = useState(false);

  const calendarEvent: CalendarEventInput = {
    title: `${siteConfig.name} – ${row.productTitle}`,
    description: `Gutschein ${row.voucherCode} · ${row.parentName} · ${siteConfig.phoneDisplay}`,
    date: row.confirmedDate,
    time: row.confirmedTime,
    location: row.confirmedLocation,
    uid: `aquafotos-voucher-${row.voucherCode}@${siteConfig.emailDomain}`,
  };

  const icsFilename = calendarIcsFilename(calendarEvent.title, row.confirmedDate);
  const customerUrl = row.purchaseNumber
    ? `/gutschein/erfolg?purchase=${encodeURIComponent(row.purchaseNumber)}`
    : `/gutschein/einloesen?code=${encodeURIComponent(row.voucherCode)}`;

  return (
    <>
      {showReschedule && (
        <VoucherRedemptionReschedule
          voucherId={row.voucherId}
          code={row.voucherCode}
          parentName={row.parentName}
          defaultDate={row.defaultDate}
          defaultTime={row.defaultTime}
          defaultLocation={row.defaultLocation}
          currentLabel={row.currentLabel}
          open={rescheduleOpen}
          onOpenChange={setRescheduleOpen}
          showTrigger={false}
        />
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Aktionen"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {showReschedule && (
            <>
              <DropdownMenuItem onClick={() => setRescheduleOpen(true)}>
                <CalendarPlus className="mr-2 h-4 w-4" aria-hidden />
                Termin ändern
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem asChild>
            <a
              href={buildGoogleCalendarUrl(calendarEvent)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <CalendarPlus className="mr-2 h-4 w-4" aria-hidden />
              Google Kalender
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href={buildOutlookWebUrl(calendarEvent)} target="_blank" rel="noopener noreferrer">
              <CalendarPlus className="mr-2 h-4 w-4" aria-hidden />
              Outlook
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => downloadIcsFile(calendarEvent, icsFilename)}>
            <Download className="mr-2 h-4 w-4" aria-hidden />
            .ics herunterladen
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <a href={`mailto:${row.email}`}>
              <Mail className="mr-2 h-4 w-4" aria-hidden />
              E-Mail schreiben
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={customerUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" aria-hidden />
              Kundenansicht
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/admin/gutscheine">
              <ExternalLink className="mr-2 h-4 w-4" aria-hidden />
              Gutschein-Verwaltung
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}