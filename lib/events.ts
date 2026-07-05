import { prisma } from "@/lib/prisma";
import { ADMIN_SHOOTINGS_PAGE_SIZE } from "@/lib/admin-shootings-list";
import type { AdminShootingPipelineInput } from "@/lib/admin-shooting-pipeline-status";
import type { ShootingCategory, ShootingEvent, ShootingType, EventSlot, Partner, EventStatus, PhotoProcessingStatus } from "@prisma/client";

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
      where: excludeVoucherEinzelGalleryShellEvents,
      include: eventListInclude,
      orderBy: { date: "desc" },
    });
  } catch {
    return demoEvents;
  }
}

const eventListInclude = {
  slots: { orderBy: { startTime: "asc" as const } },
  partner: true,
  _count: { select: { participants: true, waitlist: true } },
} as const;

/** Technische Galerie-Events für Gutschein-Einzelshootings ohne Event-Zuordnung */
const excludeVoucherEinzelGalleryShellEvents = {
  NOT: {
    participants: {
      some: {
        individualShootingReq: {
          voucherId: { not: null },
          eventId: null,
        },
      },
    },
  },
} as const;

function buildAdminEventsWhere(input: { q?: string; status?: string }) {
  const where: {
    status?: EventStatus;
    OR?: Array<
      | { title: { contains: string; mode: "insensitive" } }
      | { location: { contains: string; mode: "insensitive" } }
      | { description: { contains: string; mode: "insensitive" } }
    >;
    NOT?: typeof excludeVoucherEinzelGalleryShellEvents.NOT;
  } = { ...excludeVoucherEinzelGalleryShellEvents };

  const validStatuses: EventStatus[] = [
    "DRAFT",
    "PUBLISHED",
    "FULL",
    "COMPLETED",
    "CANCELLED",
  ];
  if (input.status && validStatuses.includes(input.status as EventStatus)) {
    where.status = input.status as EventStatus;
  }

  const q = input.q?.trim();
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { location: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  return where;
}

export async function listAdminEventsPaginated(input: {
  page: number;
  q?: string;
  status?: string;
  pageSize?: number;
}): Promise<{ items: EventWithMeta[]; total: number }> {
  const pageSize = input.pageSize ?? ADMIN_SHOOTINGS_PAGE_SIZE;
  const page = Math.max(1, input.page);
  const where = buildAdminEventsWhere(input);

  try {
    const [items, total] = await Promise.all([
      prisma.shootingEvent.findMany({
        where,
        include: eventListInclude,
        orderBy: { date: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.shootingEvent.count({ where }),
    ]);
    return { items, total };
  } catch {
    const filtered = demoEvents.filter((event) => {
      if (input.status && event.status !== input.status) return false;
      const q = input.q?.trim().toLowerCase();
      if (!q) return true;
      return (
        event.title.toLowerCase().includes(q) ||
        event.location.toLowerCase().includes(q) ||
        (event.description?.toLowerCase().includes(q) ?? false)
      );
    });
    const start = (page - 1) * pageSize;
    return {
      items: filtered.slice(start, start + pageSize),
      total: filtered.length,
    };
  }
}

export async function countAdminEvents(): Promise<number> {
  try {
    return await prisma.shootingEvent.count({
      where: excludeVoucherEinzelGalleryShellEvents,
    });
  } catch {
    return demoEvents.length;
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

export type VoucherAssignableEvent = {
  id: string;
  title: string;
  date: string;
  startTime: string | null;
  location: string;
  spotsLeft: number;
};

export async function getEventsForVoucherAssignment(): Promise<VoucherAssignableEvent[]> {
  try {
    const events = await prisma.shootingEvent.findMany({
      where: {
        status: { in: ["PUBLISHED", "FULL", "DRAFT"] },
        date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
      include: { _count: { select: { participants: true } } },
      orderBy: { date: "asc" },
    });

    return events.map((event) => ({
      id: event.id,
      title: event.title,
      date: event.date.toISOString().slice(0, 10),
      startTime: event.startTime,
      location: event.location,
      spotsLeft: Math.max(0, event.maxParticipants - event._count.participants),
    }));
  } catch {
    return [];
  }
}

export type ConfirmedIndividualShooting = {
  id: string;
  parentName: string;
  childName: string | null;
  email: string;
  phone: string;
  confirmedDate: string;
  confirmedTime: string | null;
  confirmedLocation: string | null;
  voucherCode: string | null;
  productTitle: string | null;
  voucherId: string | null;
  purchaseNumber: string | null;
  shootingType: string | null;
  status: string;
  preferredDate: string | null;
  message: string | null;
  eventId: string | null;
  participantId: string | null;
  pipelineParticipant: AdminShootingPipelineInput["participant"];
};

export type IndividualShootingParticipant = {
  id: string;
  participantNumber: number;
  parentName: string;
  childName: string;
  email: string;
  phone: string;
  status: string;
  registrationSource: string;
  qrDataUrl: string | null;
  qrCode: string | null;
  accessCode: string | null;
  confirmationSentAt: string | null;
  confirmedAt: string | null;
  galleryViewedAt: string | null;
  orderedAt: string | null;
  photoCount: number;
  photos: { id: string; filename: string; storageKey: string; processingStatus: PhotoProcessingStatus }[];
};

export type IndividualShootingDetail = ConfirmedIndividualShooting & {
  participant: IndividualShootingParticipant | null;
  galleryEventId: string | null;
};

function mapIndividualShootingRow(
  row: {
    id: string;
    parentName: string;
    childName: string | null;
    email: string;
    phone: string;
    confirmedDate: Date | null;
    confirmedTime: string | null;
    confirmedLocation: string | null;
    status: string;
    preferredDate: Date | null;
    message: string | null;
    shootingType: import("@prisma/client").ShootingType;
    eventId: string | null;
    participantId: string | null;
    participant: {
      status: import("@prisma/client").ParticipantStatus;
      galleryAccess: { accessCode: string } | null;
      photos: { processingStatus: import("@prisma/client").PhotoProcessingStatus }[];
    } | null;
    voucher: {
      id: string;
      code: string;
      purchaseNumber: string;
      preferredDate: Date | null;
      product: { title: string };
    } | null;
  },
): ConfirmedIndividualShooting {
  return {
    id: row.id,
    parentName: row.parentName,
    childName: row.childName,
    email: row.email,
    phone: row.phone,
    confirmedDate: row.confirmedDate!.toISOString().slice(0, 10),
    confirmedTime: row.confirmedTime,
    confirmedLocation: row.confirmedLocation,
    voucherCode: row.voucher?.code ?? null,
    productTitle: row.voucher?.product.title ?? null,
    voucherId: row.voucher?.id ?? null,
    purchaseNumber: row.voucher?.purchaseNumber ?? null,
    shootingType: row.shootingType,
    status: row.status,
    preferredDate:
      (row.preferredDate ?? row.voucher?.preferredDate)?.toISOString().slice(0, 10) ?? null,
    message: row.message,
    eventId: row.eventId,
    participantId: row.participantId,
    pipelineParticipant: row.participant
      ? {
          status: row.participant.status,
          galleryAccess: row.participant.galleryAccess,
          photos: row.participant.photos,
        }
      : null,
  };
}

const individualShootingInclude = {
  voucher: { include: { product: true } },
  participant: {
    include: {
      galleryAccess: { select: { accessCode: true } },
      photos: { select: { id: true, processingStatus: true } },
    },
  },
} as const;

const individualShootingDetailInclude = {
  voucher: { include: { product: true } },
  participant: {
    include: {
      galleryAccess: true,
      qrCode: true,
      photos: {
        select: { id: true, filename: true, storageKey: true, processingStatus: true },
        orderBy: { sortOrder: "asc" as const },
      },
    },
  },
} as const;

function mapParticipantDetail(
  participant: NonNullable<
    Awaited<
      ReturnType<
        typeof prisma.individualShootingRequest.findFirst<{
          include: typeof individualShootingDetailInclude;
        }>
      >
    >
  >["participant"],
): IndividualShootingParticipant | null {
  if (!participant) return null;

  return {
    id: participant.id,
    participantNumber: participant.participantNumber,
    parentName: participant.parentName,
    childName: participant.childName,
    email: participant.email,
    phone: participant.phone,
    status: participant.status,
    registrationSource: participant.registrationSource,
    qrDataUrl: participant.qrCode?.qrDataUrl ?? null,
    qrCode: participant.qrCode?.code ?? null,
    accessCode: participant.galleryAccess?.accessCode ?? null,
    confirmationSentAt: participant.confirmationSentAt?.toISOString() ?? null,
    confirmedAt: participant.confirmedAt?.toISOString() ?? null,
    galleryViewedAt: participant.galleryViewedAt?.toISOString() ?? null,
    orderedAt: participant.orderedAt?.toISOString() ?? null,
    photoCount: participant.photos.length,
    photos: participant.photos.map((photo) => ({
      id: photo.id,
      filename: photo.filename,
      storageKey: photo.storageKey,
      processingStatus: photo.processingStatus,
    })),
  };
}

function buildIndividualShootingsWhere(input: { q?: string }) {
  const base = {
    confirmedDate: { not: null },
    voucherId: { not: null },
    eventId: null,
    status: { notIn: ["CANCELLED", "ARCHIVED"] },
  };

  const q = input.q?.trim();
  if (!q) return base;

  return {
    ...base,
    OR: [
      { parentName: { contains: q, mode: "insensitive" as const } },
      { childName: { contains: q, mode: "insensitive" as const } },
      { email: { contains: q, mode: "insensitive" as const } },
      { phone: { contains: q, mode: "insensitive" as const } },
      { confirmedLocation: { contains: q, mode: "insensitive" as const } },
      { voucher: { code: { contains: q, mode: "insensitive" as const } } },
      { voucher: { purchaseNumber: { contains: q, mode: "insensitive" as const } } },
      { voucher: { product: { title: { contains: q, mode: "insensitive" as const } } } },
    ],
  };
}

export async function listConfirmedIndividualShootingsPaginated(input: {
  page: number;
  q?: string;
  pageSize?: number;
}): Promise<{ items: ConfirmedIndividualShooting[]; total: number }> {
  const pageSize = input.pageSize ?? ADMIN_SHOOTINGS_PAGE_SIZE;
  const page = Math.max(1, input.page);
  const where = buildIndividualShootingsWhere(input);

  try {
    const [rows, total] = await Promise.all([
      prisma.individualShootingRequest.findMany({
        where,
        include: individualShootingInclude,
        orderBy: [{ confirmedDate: "desc" }, { confirmedTime: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.individualShootingRequest.count({ where }),
    ]);

    return { items: rows.map(mapIndividualShootingRow), total };
  } catch {
    return { items: [], total: 0 };
  }
}

export async function countConfirmedIndividualShootings(): Promise<number> {
  try {
    return await prisma.individualShootingRequest.count({
      where: buildIndividualShootingsWhere({}),
    });
  } catch {
    return 0;
  }
}

export async function getConfirmedVoucherIndividualShootings(): Promise<
  ConfirmedIndividualShooting[]
> {
  try {
    const rows = await prisma.individualShootingRequest.findMany({
      where: {
        confirmedDate: { not: null },
        voucherId: { not: null },
        eventId: null,
      },
      include: individualShootingInclude,
      orderBy: [{ confirmedDate: "desc" }, { confirmedTime: "asc" }],
    });

    return rows.map(mapIndividualShootingRow);
  } catch {
    return [];
  }
}

export async function getIndividualShootingById(
  id: string,
): Promise<IndividualShootingDetail | null> {
  try {
    const row = await prisma.individualShootingRequest.findFirst({
      where: {
        id,
        confirmedDate: { not: null },
        voucherId: { not: null },
        eventId: null,
      },
      include: individualShootingDetailInclude,
    });

    if (!row?.confirmedDate) return null;

    const participant = mapParticipantDetail(row.participant);

    return {
      ...mapIndividualShootingRow(row),
      participant,
      galleryEventId: row.participant?.eventId ?? null,
    };
  } catch {
    return null;
  }
}
