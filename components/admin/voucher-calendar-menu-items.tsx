"use client";

import { CalendarPlus, Download } from "lucide-react";
import {
  buildGoogleCalendarUrl,
  buildOutlookWebUrl,
  calendarIcsFilename,
  downloadIcsFile,
  type CalendarEventInput,
} from "@/lib/calendar-export";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

type Props = CalendarEventInput;

export function VoucherCalendarMenuItems({ title, description, date, time, location, uid }: Props) {
  const event: CalendarEventInput = { title, description, date, time, location, uid };
  const filename = calendarIcsFilename(title, date);

  return (
    <>
      <DropdownMenuItem asChild>
        <a href={buildGoogleCalendarUrl(event)} target="_blank" rel="noopener noreferrer">
          <CalendarPlus className="mr-2 h-4 w-4" aria-hidden />
          Google Kalender
        </a>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <a href={buildOutlookWebUrl(event)} target="_blank" rel="noopener noreferrer">
          <CalendarPlus className="mr-2 h-4 w-4" aria-hidden />
          Outlook
        </a>
      </DropdownMenuItem>
      <DropdownMenuItem
        onSelect={(e) => {
          e.preventDefault();
          downloadIcsFile(event, filename);
        }}
      >
        <Download className="mr-2 h-4 w-4" aria-hidden />
        Termin (.ics)
      </DropdownMenuItem>
    </>
  );
}
