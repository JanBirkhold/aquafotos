import { prisma } from "@/lib/prisma";
import { addParticipantManual } from "@/lib/actions/admin";
import { finalizePublishedShootingEvent } from "@/lib/event-publish";
import { sendVoucherAppointmentConfirmedEmail } from "@/lib/email";
import { shootingTypeLabels } from "@/lib/shooting-types";
import type { ScheduleAppointmentInput } from "@/lib/appointment-scheduling-shared";

import type {
  ClosedAppointmentRequest,
  OpenAppointmentRequest,
  PlannedAppointmentRequest,
} from "@/lib/appointment-scheduling-types";

export type {
  CancelledAppointmentRequest,
  ClosedAppointmentRequest,
  OpenAppointmentRequest,
  PlannedAppointmentRequest,
  TerminanfragenTab,
} from "@/lib/appointment-scheduling-types";
export type { NewEventInput, ScheduleAppointmentInput } from "@/lib/appointment-scheduling-shared";
export { defaultNewEventFromRequest, defaultNewEventTitle } from "@/lib/appointment-scheduling-shared";

export async function listOpenAppointmentRequests(): Promise<OpenAppointmentRequest[]> {
  try {
    const [rows, paidWithoutRequest] = await Promise.all([
      prisma.individualShootingRequest.findMany({
        where: {
          confirmedDate: null,
          status: { notIn: ["CANCELLED", "ARCHIVED"] },
        },
        include: {
          voucher: { include: { product: true } },
        },
        orderBy: [{ preferredDate: "asc" }, { createdAt: "desc" }],
      }),
      prisma.voucher.findMany({
        where: {
          status: "PAID",
          individualShootingReq: null,
        },
        include: { product: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const fromRequests: OpenAppointmentRequest[] = rows.map(mapOpenAppointmentRow);

    const requestVoucherIds = new Set(
      fromRequests.map((row) => row.voucherId).filter(Boolean) as string[],
    );

    const fromPaidVouchers: OpenAppointmentRequest[] = paidWithoutRequest
      .filter((voucher) => !requestVoucherIds.has(voucher.id))
      .map((voucher) => ({
        id: `voucher-${voucher.id}`,
        parentName: voucher.buyerName,
        childName: voucher.recipientName,
        email: voucher.buyerEmail,
        phone: "",
        shootingType: voucher.product.shootingType ?? "OTHER",
        preferredDate: voucher.preferredDate?.toISOString().slice(0, 10) ?? null,
        message: null,
        status: "PAID",
        createdAt: voucher.createdAt.toISOString(),
        updatedAt: voucher.updatedAt.toISOString(),
        voucherId: voucher.id,
        voucherCode: voucher.code,
        purchaseNumber: voucher.purchaseNumber,
        productTitle: voucher.product.title,
        needsContact: true,
      }));

    return [...fromPaidVouchers, ...fromRequests].sort((a, b) => {
      const dateA = a.preferredDate ?? a.createdAt.slice(0, 10);
      const dateB = b.preferredDate ?? b.createdAt.slice(0, 10);
      return dateA.localeCompare(dateB) || b.createdAt.localeCompare(a.createdAt);
    });
  } catch {
    return [];
  }
}

async function resolveEventId(
  input: ScheduleAppointmentInput,
): Promise<{ eventId: string | null; error?: string }> {
  if (input.newEvent) {
    const publish = input.newEvent.publish === true;
    const event = await prisma.shootingEvent.create({
      data: {
        title: input.newEvent.title.trim(),
        description: input.newEvent.description?.trim() || null,
        category: input.newEvent.category,
        shootingType: input.newEvent.shootingType,
        date: new Date(`${input.confirmedDate}T12:00:00`),
        startTime: input.confirmedTime?.trim() || null,
        location: input.confirmedLocation.trim(),
        maxParticipants: input.newEvent.maxParticipants,
        status: publish ? "PUBLISHED" : "DRAFT",
        publishedAt: publish ? new Date() : null,
      },
    });

    if (publish) {
      await finalizePublishedShootingEvent(event);
    }

    return { eventId: event.id };
  }

  const eventId = input.eventId?.trim() || null;
  if (!eventId) return { eventId: null };

  const event = await prisma.shootingEvent.findUnique({ where: { id: eventId } });
  if (!event) return { eventId: null, error: "Event nicht gefunden." };

  if (event.maxParticipants <= 0) {
    return { eventId: null, error: "Event hat keine freien Plätze-Kapazität." };
  }

  return { eventId };
}

export async function scheduleIndividualShootingRequest(
  requestId: string,
  input: ScheduleAppointmentInput,
): Promise<{
  success?: boolean;
  error?: string;
  emailSent?: boolean;
  emailConfigured?: boolean;
  eventId?: string | null;
}> {
  const req = await prisma.individualShootingRequest.findUnique({
    where: { id: requestId },
    include: { voucher: { include: { product: true } } },
  });

  if (!req) return { error: "Terminanfrage nicht gefunden." };
  if (req.confirmedDate) return { error: "Termin wurde bereits bestätigt." };

  if (input.eventId && input.newEvent) {
    return { error: "Bitte entweder bestehendes Event oder neues Event wählen." };
  }

  const date = new Date(`${input.confirmedDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) {
    return { error: "Ungültiges Datum." };
  }

  const confirmedTime = input.confirmedTime?.trim() || null;
  const confirmedLocation = input.confirmedLocation.trim();
  if (!confirmedLocation) return { error: "Ort fehlt." };

  const { eventId, error: eventError } = await resolveEventId(input);
  if (eventError) return { error: eventError };

  let participantId: string | null = null;

  if (eventId) {
    const participant = await addParticipantManual(
      {
        eventId,
        parentName: req.parentName,
        childName: req.childName?.trim() || req.parentName,
        email: req.email,
        phone: req.phone,
      },
      { skipConfirmationEmail: true },
    );
    participantId = participant.id;
  }

  await prisma.individualShootingRequest.update({
    where: { id: req.id },
    data: {
      confirmedDate: date,
      confirmedTime,
      confirmedLocation,
      eventId,
      participantId,
      status: "CONFIRMED",
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://aquafotos.com";
  const productTitle =
    req.voucher?.product.title ??
    shootingTypeLabels[req.shootingType] ??
    "Individuelles Shooting";

  const delivery = await sendVoucherAppointmentConfirmedEmail({
    to: req.email,
    parentName: req.parentName,
    childName: req.childName,
    productTitle,
    shootingTypeLabel: shootingTypeLabels[req.shootingType],
    confirmedDate: date.toLocaleDateString("de-DE"),
    confirmedDateIso: input.confirmedDate,
    confirmedTime: confirmedTime ?? undefined,
    confirmedLocation,
    contactLink: `${appUrl}/kontakt`,
    purchaseNumber: req.voucher?.purchaseNumber ?? "",
    voucherCode: req.voucher?.code,
  });

  return {
    success: true,
    emailSent: delivery.sent,
    emailConfigured: delivery.configured,
    eventId,
  };
}

function mapOpenAppointmentRow(
  row: Awaited<
    ReturnType<
      typeof prisma.individualShootingRequest.findMany<{
        include: { voucher: { include: { product: true } } };
      }>
    >
  >[number],
): OpenAppointmentRequest {
  return {
    id: row.id,
    parentName: row.parentName,
    childName: row.childName,
    email: row.email,
    phone: row.phone,
    shootingType: row.shootingType,
    preferredDate: row.preferredDate?.toISOString().slice(0, 10) ?? null,
    message: row.message,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    voucherId: row.voucherId,
    voucherCode: row.voucher?.code ?? null,
    purchaseNumber: row.voucher?.purchaseNumber ?? null,
    productTitle: row.voucher?.product.title ?? null,
    needsContact: false,
  };
}

export async function listPlannedAppointmentRequests(): Promise<PlannedAppointmentRequest[]> {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 14);

    const rows = await prisma.individualShootingRequest.findMany({
      where: {
        confirmedDate: { not: null },
        status: { notIn: ["CANCELLED", "ARCHIVED"] },
      },
      include: {
        voucher: { include: { product: true } },
        participant: { include: { _count: { select: { photos: true } } } },
      },
      orderBy: [{ confirmedDate: "asc" }, { confirmedTime: "asc" }],
    });

    return rows
      .filter((row) => row.confirmedDate && row.confirmedDate >= cutoff)
      .map((row) => ({
        ...mapOpenAppointmentRow(row),
        requestId: row.id,
        confirmedDate: row.confirmedDate!.toISOString().slice(0, 10),
        confirmedTime: row.confirmedTime,
        confirmedLocation: row.confirmedLocation,
        hasGalleryData: (row.participant?._count.photos ?? 0) > 0,
      }));
  } catch {
    return [];
  }
}

export async function listCancelledAppointmentRequests(): Promise<ClosedAppointmentRequest[]> {
  try {
    const rows = await prisma.individualShootingRequest.findMany({
      where: { status: "CANCELLED" },
      include: { voucher: { include: { product: true } } },
      orderBy: { updatedAt: "desc" },
      take: 100,
    });

    return rows.map(mapClosedAppointmentRow);
  } catch {
    return [];
  }
}

export async function listArchivedAppointmentRequests(): Promise<ClosedAppointmentRequest[]> {
  try {
    const rows = await prisma.individualShootingRequest.findMany({
      where: { status: "ARCHIVED" },
      include: { voucher: { include: { product: true } } },
      orderBy: { updatedAt: "desc" },
      take: 100,
    });

    return rows.map(mapClosedAppointmentRow);
  } catch {
    return [];
  }
}

function mapClosedAppointmentRow(
  row: Awaited<
    ReturnType<
      typeof prisma.individualShootingRequest.findMany<{
        include: { voucher: { include: { product: true } } };
      }>
    >
  >[number],
): ClosedAppointmentRequest {
  return {
    ...mapOpenAppointmentRow(row),
    requestId: row.id,
    confirmedDate: row.confirmedDate?.toISOString().slice(0, 10) ?? null,
    confirmedTime: row.confirmedTime,
    confirmedLocation: row.confirmedLocation,
    closedAt: row.updatedAt.toISOString(),
  };
}
