"use client";

import { CalendarPlus, Download } from "lucide-react";
import {
  buildGoogleCalendarUrl,
  buildOutlookWebUrl,
  calendarIcsFilename,
  downloadIcsFile,
  type CalendarEventInput,
} from "@/lib/calendar-export";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = CalendarEventInput & {
  className?: string;
  size?: "sm" | "default";
  compact?: boolean;
  variant?: "buttons" | "links";
};

export function AddToCalendarActions({
  className,
  size = "sm",
  compact = false,
  variant = "buttons",
  ...event
}: Props) {
  const filename = calendarIcsFilename(event.title, event.date);
  const googleUrl = buildGoogleCalendarUrl(event);
  const outlookUrl = buildOutlookWebUrl(event);

  if (variant === "links") {
    return (
      <div className={cn("flex flex-wrap gap-x-2 gap-y-1 text-[11px]", className)}>
        <a
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-aqua-700 underline underline-offset-2"
        >
          Google
        </a>
        <a
          href={outlookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-aqua-700 underline underline-offset-2"
        >
          Outlook
        </a>
        <button
          type="button"
          className="font-medium text-aqua-700 underline underline-offset-2"
          onClick={() => downloadIcsFile(event, filename)}
        >
          .ics
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-wrap gap-2",
        compact ? "mt-2" : "mt-3",
        className,
      )}
    >
      <Button asChild variant="outline" size={size}>
        <a
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <CalendarPlus className="mr-2 h-4 w-4" aria-hidden />
          Google Kalender
        </a>
      </Button>
      <Button asChild variant="outline" size={size}>
        <a href={outlookUrl} target="_blank" rel="noopener noreferrer">
          <CalendarPlus className="mr-2 h-4 w-4" aria-hidden />
          Outlook
        </a>
      </Button>
      <Button
        type="button"
        variant="outline"
        size={size}
        onClick={() => downloadIcsFile(event, filename)}
      >
        <Download className="mr-2 h-4 w-4" aria-hidden />
        .ics
      </Button>
    </div>
  );
}
