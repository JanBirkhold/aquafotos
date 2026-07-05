import { siteConfig } from "@/lib/site-config";

export type CalendarEventInput = {
  title: string;
  description?: string;
  date: string;
  time?: string | null;
  location?: string | null;
  durationMinutes?: number;
  uid?: string;
};

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function formatIcsLocal(date: Date): string {
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  );
}

function formatIcsDateOnly(date: Date): string {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export function resolveCalendarTimes(input: CalendarEventInput): {
  allDay: boolean;
  start: Date;
  end: Date;
} {
  const [year, month, day] = input.date.split("-").map(Number);
  const duration = input.durationMinutes ?? 90;

  if (input.time?.trim()) {
    const [hours, minutes] = input.time.trim().split(":").map(Number);
    const start = new Date(year, month - 1, day, hours, minutes, 0);
    const end = new Date(start.getTime() + duration * 60_000);
    return { allDay: false, start, end };
  }

  const start = new Date(year, month - 1, day, 0, 0, 0);
  const end = new Date(year, month - 1, day + 1, 0, 0, 0);
  return { allDay: true, start, end };
}

export function buildGoogleCalendarUrl(input: CalendarEventInput): string {
  const { allDay, start, end } = resolveCalendarTimes(input);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: input.title,
    details: input.description ?? `${siteConfig.name} Shooting-Termin`,
  });

  if (input.location?.trim()) {
    params.set("location", input.location.trim());
  }

  if (allDay) {
    params.set("dates", `${formatIcsDateOnly(start)}/${formatIcsDateOnly(end)}`);
  } else {
    params.set("dates", `${formatIcsLocal(start)}/${formatIcsLocal(end)}`);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildIcsContent(input: CalendarEventInput): string {
  const { allDay, start, end } = resolveCalendarTimes(input);
  const uid = input.uid ?? `${Date.now()}@${siteConfig.emailDomain}`;
  const now = formatIcsLocal(new Date());
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AquaFotos//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    allDay
      ? `DTSTART;VALUE=DATE:${formatIcsDateOnly(start)}`
      : `DTSTART:${formatIcsLocal(start)}`,
    allDay
      ? `DTEND;VALUE=DATE:${formatIcsDateOnly(end)}`
      : `DTEND:${formatIcsLocal(end)}`,
    `SUMMARY:${escapeIcsText(input.title)}`,
  ];

  if (input.description?.trim()) {
    lines.push(`DESCRIPTION:${escapeIcsText(input.description.trim())}`);
  }
  if (input.location?.trim()) {
    lines.push(`LOCATION:${escapeIcsText(input.location.trim())}`);
  }

  lines.push("END:VEVENT", "END:VCALENDAR");
  return `${lines.join("\r\n")}\r\n`;
}

export function calendarIcsFilename(title: string, date: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `AquaFotos-${slug || "termin"}-${date}.ics`;
}

export function buildCalendarAttachment(input: CalendarEventInput): {
  filename: string;
  content: Buffer;
} {
  return {
    filename: calendarIcsFilename(input.title, input.date),
    content: Buffer.from(buildIcsContent(input), "utf-8"),
  };
}

export function downloadIcsFile(input: CalendarEventInput, filename: string) {
  const blob = new Blob([buildIcsContent(input)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function buildOutlookWebUrl(input: CalendarEventInput): string {
  const { allDay, start, end } = resolveCalendarTimes(input);
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: input.title,
    body: input.description ?? `${siteConfig.name} Shooting-Termin`,
  });

  if (input.location?.trim()) {
    params.set("location", input.location.trim());
  }

  if (allDay) {
    params.set("startdt", start.toISOString().slice(0, 10));
    params.set("enddt", end.toISOString().slice(0, 10));
    params.set("allday", "true");
  } else {
    params.set("startdt", start.toISOString());
    params.set("enddt", end.toISOString());
  }

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}
