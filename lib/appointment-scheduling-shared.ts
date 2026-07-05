import { getCategoryForShootingType, shootingTypeLabels } from "@/lib/shooting-types";
import type { ShootingCategory, ShootingType } from "@prisma/client";

export type NewEventInput = {
  title: string;
  category: ShootingCategory;
  shootingType: ShootingType;
  maxParticipants: number;
  description?: string;
  publish?: boolean;
};

export type ScheduleAppointmentInput = {
  confirmedDate: string;
  confirmedTime?: string;
  confirmedLocation: string;
  eventId?: string;
  newEvent?: NewEventInput;
};

export function defaultNewEventTitle(productTitle: string, parentName: string): string {
  return `${productTitle} – ${parentName}`.slice(0, 120);
}

export function formatAppointmentDate(date: Date): string {
  return date.toLocaleDateString("de-DE");
}

export function appointmentChanged(
  previous: { date: Date; time: string | null; location: string | null },
  next: { date: Date; time: string | null; location: string | null },
): boolean {
  return (
    formatAppointmentDate(previous.date) !== formatAppointmentDate(next.date) ||
    (previous.time ?? "") !== (next.time ?? "") ||
    (previous.location ?? "") !== (next.location ?? "")
  );
}

export function defaultNewEventFromRequest(request: {
  shootingType: ShootingType;
  productTitle: string | null;
  parentName: string;
}): NewEventInput {
  const shootingType = request.shootingType;
  const productTitle = request.productTitle ?? shootingTypeLabels[shootingType];
  return {
    title: defaultNewEventTitle(productTitle, request.parentName),
    category: getCategoryForShootingType(shootingType),
    shootingType,
    maxParticipants: 12,
  };
}
