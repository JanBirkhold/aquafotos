import { prisma } from "@/lib/prisma";
import type { ShootingCategory, ShootingEvent, ShootingType, EventSlot, Partner } from "@prisma/client";

export type EventWithMeta = ShootingEvent & {
  slots: EventSlot[];
  partner: Partner | null;
  _count: { participants: number; waitlist: number };
};

const demoEvents: EventWithMeta[] = [
  {
    id: "demo-1",
    title: "Unterwasser-Shooting Vitasol Bad Salzuflen",
    description: "Emotionale Unterwasserbilder für Kinder und Familien.",
    category: "UNDERWATER",
    shootingType: "UNDERWATER_CHILD",
    status: "PUBLISHED",
    date: new Date("2026-08-15"),
    startTime: null,
    endTime: null,
    location: "Vitasol Bad Salzuflen",
    locationDetail: null,
    maxParticipants: 15,
    allowWaitlist: true,
    partnerId: null,
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    slots: [
      { id: "s1", eventId: "demo-1", startTime: "09:00", endTime: "09:15", maxParticipants: 1, createdAt: new Date() },
      { id: "s2", eventId: "demo-1", startTime: "09:20", endTime: "09:35", maxParticipants: 1, createdAt: new Date() },
      { id: "s3", eventId: "demo-1", startTime: "09:40", endTime: "09:55", maxParticipants: 1, createdAt: new Date() },
      { id: "s4", eventId: "demo-1", startTime: "10:00", endTime: "10:15", maxParticipants: 1, createdAt: new Date() },
    ],
    partner: null,
    _count: { participants: 12, waitlist: 2 },
  },
  {
    id: "demo-2",
    title: "WeihnachtsMinis Barntrup",
    description: null,
    category: "SEASONAL",
    shootingType: "CHRISTMAS_MINIS",
    status: "PUBLISHED",
    date: new Date("2026-11-28"),
    startTime: null,
    endTime: null,
    location: "AquaFotos Studio Barntrup",
    locationDetail: null,
    maxParticipants: 12,
    allowWaitlist: true,
    partnerId: null,
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    slots: [],
    partner: null,
    _count: { participants: 8, waitlist: 0 },
  },
];

export async function getAdminEvents(): Promise<EventWithMeta[]> {
  try {
    return await prisma.shootingEvent.findMany({
      include: {
        slots: { orderBy: { startTime: "asc" } },
        partner: true,
        _count: { select: { participants: true, waitlist: true } },
      },
      orderBy: { date: "desc" },
    });
  } catch {
    return demoEvents;
  }
}

export async function getPublishedEvents(): Promise<EventWithMeta[]> {
  try {
    return await prisma.shootingEvent.findMany({
      where: { status: { in: ["PUBLISHED", "FULL"] } },
      include: {
        slots: { orderBy: { startTime: "asc" } },
        partner: true,
        _count: { select: { participants: true, waitlist: true } },
      },
      orderBy: { date: "asc" },
    });
  } catch {
    return demoEvents;
  }
}

export async function getEventById(id: string): Promise<EventWithMeta | null> {
  try {
    return await prisma.shootingEvent.findUnique({
      where: { id },
      include: {
        slots: { orderBy: { startTime: "asc" } },
        partner: true,
        _count: { select: { participants: true, waitlist: true } },
      },
    });
  } catch {
    return demoEvents.find((e) => e.id === id) ?? null;
  }
}

export function getSpotsLeft(event: EventWithMeta): number {
  return Math.max(0, event.maxParticipants - event._count.participants);
}

export function formatEventDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export type SerializedEventSlot = {
  id: string;
  startTime: string;
  endTime: string | null;
  maxParticipants: number;
};

/** Client-safe event props (no Date objects) */
export type SerializedEvent = {
  id: string;
  title: string;
  description: string | null;
  category: ShootingCategory;
  shootingType: ShootingType;
  location: string;
  maxParticipants: number;
  allowWaitlist: boolean;
  startTime: string | null;
  endTime: string | null;
  slots: SerializedEventSlot[];
  participantCount: number;
};

export function serializeEvent(event: EventWithMeta): SerializedEvent {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    category: event.category,
    shootingType: event.shootingType,
    location: event.location,
    maxParticipants: event.maxParticipants,
    allowWaitlist: event.allowWaitlist,
    startTime: event.startTime,
    endTime: event.endTime,
    slots: event.slots.map((slot) => ({
      id: slot.id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      maxParticipants: slot.maxParticipants,
    })),
    participantCount: event._count.participants,
  };
}
