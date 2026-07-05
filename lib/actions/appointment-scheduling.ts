"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { deletePhotoFile } from "@/lib/admin-photos";
import { auth, isStaffRole } from "@/lib/auth";
import { scheduleIndividualShootingRequest } from "@/lib/appointment-scheduling";
import {
  appointmentChanged,
  defaultNewEventFromRequest,
  formatAppointmentDate,
  type NewEventInput,
} from "@/lib/appointment-scheduling-shared";
import { sendVoucherAppointmentCancelledEmail, sendVoucherAppointmentChangedEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { shootingTypeLabels } from "@/lib/shooting-types";
import { ShootingCategory, ShootingType } from "@prisma/client";

async function requireStaff() {
  const session = await auth();
  if (!session?.user || !isStaffRole(session.user.role)) {
    throw new Error("Unauthorized");
  }
}

function revalidateAppointmentPaths(requestId?: string, eventId?: string | null) {
  revalidatePath("/admin/terminanfragen");
  revalidatePath("/admin/shootings");
  revalidatePath("/admin/gutscheine");
  revalidatePath("/admin/bestellungen");
  revalidatePath("/gutschein/einloesen");
  revalidatePath("/gutschein/erfolg");
  if (requestId) {
    revalidatePath(`/admin/shootings/einzel/${requestId}`);
  }
  if (eventId) {
    revalidatePath(`/admin/shootings/${eventId}`);
  }
}

const newEventSchema = z.object({
  title: z.string().min(2),
  category: z.nativeEnum(ShootingCategory),
  shootingType: z.nativeEnum(ShootingType),
  maxParticipants: z.number().int().min(1).max(500),
  description: z.string().optional(),
  publish: z.boolean().optional(),
});

const scheduleSchema = z.object({
  requestId: z.string().min(1),
  confirmedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  confirmedTime: z.string().optional(),
  confirmedLocation: z.string().min(2),
  eventId: z.string().optional(),
  newEvent: newEventSchema.optional(),
});

const rescheduleSchema = z.object({
  requestId: z.string().min(1),
  confirmedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  confirmedTime: z.string().optional(),
  confirmedLocation: z.string().min(2),
  notifyMessage: z.string().optional(),
});

const cancelSchema = z.object({
  requestId: z.string().min(1),
  reason: z.string().optional(),
});

export async function confirmIndividualShootingAppointment(input: {
  requestId: string;
  confirmedDate: string;
  confirmedTime?: string;
  confirmedLocation: string;
  eventId?: string;
  newEvent?: NewEventInput;
}) {
  try {
    await requireStaff();

    const parsed = scheduleSchema.safeParse(input);
    if (!parsed.success) {
      return { error: "Bitte Datum und Ort ausfüllen." };
    }

    const result = await scheduleIndividualShootingRequest(parsed.data.requestId, {
      confirmedDate: parsed.data.confirmedDate,
      confirmedTime: parsed.data.confirmedTime,
      confirmedLocation: parsed.data.confirmedLocation,
      eventId: parsed.data.eventId,
      newEvent: parsed.data.newEvent,
    });

    if (result.error) return { error: result.error };

    revalidateAppointmentPaths(parsed.data.requestId, result.eventId);

    return {
      success: true,
      emailSent: result.emailSent,
      emailConfigured: result.emailConfigured,
      eventId: result.eventId,
    };
  } catch {
    return { error: "Terminbestätigung fehlgeschlagen." };
  }
}

export async function reopenCancelledAppointmentRequest(input: { requestId: string }) {
  try {
    await requireStaff();

    const parsed = cancelSchema.safeParse(input);
    if (!parsed.success) {
      return { error: "Ungültige Anfrage." };
    }

    const req = await prisma.individualShootingRequest.findUnique({
      where: { id: parsed.data.requestId },
    });

    if (!req) return { error: "Terminanfrage nicht gefunden." };
    if (req.status !== "CANCELLED") {
      return { error: "Nur abgesagte Anfragen können wieder geöffnet werden." };
    }

    await prisma.individualShootingRequest.update({
      where: { id: req.id },
      data: {
        status: req.voucherId ? "VOUCHER_REDEEMED" : "PENDING",
        confirmedDate: null,
        confirmedTime: null,
        confirmedLocation: null,
        eventId: null,
        participantId: null,
      },
    });

    revalidateAppointmentPaths(req.id);

    return { success: true };
  } catch {
    return { error: "Anfrage konnte nicht wieder geöffnet werden." };
  }
}

export async function cancelOpenAppointmentRequest(input: {
  requestId: string;
  reason?: string;
}) {
  try {
    await requireStaff();

    const parsed = cancelSchema.safeParse(input);
    if (!parsed.success) {
      return { error: "Ungültige Anfrage." };
    }

    const req = await prisma.individualShootingRequest.findUnique({
      where: { id: parsed.data.requestId },
    });

    if (!req) return { error: "Terminanfrage nicht gefunden." };
    if (req.confirmedDate) {
      return { error: "Termin ist bereits geplant – bitte „Termin absagen“ verwenden." };
    }
    if (req.status === "CANCELLED") {
      return { success: true };
    }
    if (req.status === "ARCHIVED") {
      return { error: "Archivierte Anfragen können nicht abgesagt werden." };
    }

    await prisma.individualShootingRequest.update({
      where: { id: req.id },
      data: { status: "CANCELLED" },
    });

    revalidateAppointmentPaths(req.id);

    return { success: true };
  } catch {
    return { error: "Anfrage konnte nicht abgesagt werden." };
  }
}

export async function cancelConfirmedAppointment(input: {
  requestId: string;
  reason?: string;
}) {
  try {
    await requireStaff();

    const parsed = cancelSchema.safeParse(input);
    if (!parsed.success) {
      return { error: "Ungültige Anfrage." };
    }

    const req = await prisma.individualShootingRequest.findUnique({
      where: { id: parsed.data.requestId },
      include: {
        voucher: { include: { product: true } },
        participant: { include: { _count: { select: { photos: true } } } },
      },
    });

    if (!req) return { error: "Terminanfrage nicht gefunden." };
    if (!req.confirmedDate) {
      return { error: "Noch kein Termin geplant." };
    }
    if ((req.participant?._count.photos ?? 0) > 0) {
      return {
        error:
          "Shooting hat Fotos in der Galerie – bitte „Archivieren“ statt absagen.",
      };
    }

    const previous = {
      date: req.confirmedDate,
      time: req.confirmedTime,
      location: req.confirmedLocation,
    };
    const linkedEventId = req.eventId;

    if (req.participantId) {
      await prisma.participant.update({
        where: { id: req.participantId },
        data: { status: "CANCELLED" },
      });
    }

    await prisma.individualShootingRequest.update({
      where: { id: req.id },
      data: {
        status: "CANCELLED",
        eventId: null,
        participantId: null,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://aquafotos.com";
    const productTitle =
      req.voucher?.product.title ??
      shootingTypeLabels[req.shootingType] ??
      "Individuelles Shooting";

    const delivery = await sendVoucherAppointmentCancelledEmail({
      to: req.email,
      parentName: req.parentName,
      childName: req.childName,
      productTitle,
      shootingTypeLabel: shootingTypeLabels[req.shootingType],
      previousDate: formatAppointmentDate(previous.date!),
      previousTime: previous.time ?? undefined,
      previousLocation: previous.location ?? "—",
      reason: parsed.data.reason?.trim() || undefined,
      contactLink: `${appUrl}/kontakt`,
      purchaseNumber: req.voucher?.purchaseNumber ?? "",
      voucherCode: req.voucher?.code,
    });

    revalidateAppointmentPaths(req.id, linkedEventId);

    if (!delivery.configured) {
      return {
        success: true,
        emailConfigured: false,
        message:
          "Termin abgesagt, aber E-Mail-Versand ist nicht konfiguriert (RESEND_API_KEY fehlt).",
      };
    }

    if (!delivery.sent) {
      return {
        error:
          delivery.error ?? "Termin abgesagt, aber Benachrichtigung konnte nicht gesendet werden.",
      };
    }

    return {
      success: true,
      emailSent: true,
      emailConfigured: true,
      message: `Termin abgesagt – Benachrichtigung an ${req.email} gesendet. Eintrag unter „Abgesagt“.`,
    };
  } catch {
    return { error: "Terminabsage fehlgeschlagen." };
  }
}

export async function archiveConfirmedAppointment(input: { requestId: string }) {
  try {
    await requireStaff();

    const parsed = cancelSchema.safeParse(input);
    if (!parsed.success) {
      return { error: "Ungültige Anfrage." };
    }

    const req = await prisma.individualShootingRequest.findUnique({
      where: { id: parsed.data.requestId },
      include: {
        participant: { include: { _count: { select: { photos: true } } } },
      },
    });

    if (!req) return { error: "Terminanfrage nicht gefunden." };
    if (!req.confirmedDate) {
      return { error: "Noch kein Termin geplant." };
    }
    if (req.status === "ARCHIVED") {
      return { success: true };
    }
    if ((req.participant?._count.photos ?? 0) === 0) {
      return {
        error: "Ohne Galerie-Fotos bitte „Termin absagen“ verwenden.",
      };
    }

    await prisma.individualShootingRequest.update({
      where: { id: req.id },
      data: { status: "ARCHIVED" },
    });

    revalidateAppointmentPaths(req.id, req.eventId);

    return {
      success: true,
      message: "Shooting archiviert – Galerie und Fotos bleiben erhalten. Eintrag unter „Archiv“.",
    };
  } catch {
    return { error: "Archivierung fehlgeschlagen." };
  }
}

export async function previewArchivedAppointmentDelete(input: { requestId: string }) {
  try {
    await requireStaff();

    const parsed = cancelSchema.safeParse(input);
    if (!parsed.success) {
      return { error: "Ungültige Anfrage." };
    }

    const context = await loadArchivedDeleteContext(parsed.data.requestId);
    if (context.error) return { error: context.error };

    return {
      orderNumbers: context.orderNumbers,
      preservedOrderCount: context.orderIds.length,
    };
  } catch {
    return { error: "Vorschau fehlgeschlagen." };
  }
}

export async function deleteArchivedAppointmentRequest(input: { requestId: string }) {
  try {
    await requireStaff();

    const parsed = cancelSchema.safeParse(input);
    if (!parsed.success) {
      return { error: "Ungültige Anfrage." };
    }

    const context = await loadArchivedDeleteContext(parsed.data.requestId);
    if (context.error || !context.req) {
      return { error: context.error ?? "Terminanfrage nicht gefunden." };
    }

    const { req, participant, galleryEventId, photos, orderIds, orderNumbers } = context;

    for (const photo of photos) {
      await deletePhotoFile(photo.storageKey);
      if (photo.previewKey) {
        await deletePhotoFile(photo.previewKey);
      }
    }

    const photoIds = photos.map((photo) => photo.id);
    const participantId = participant?.id ?? null;
    const now = new Date();

    await prisma.$transaction(async (tx) => {
      for (const photo of photos) {
        for (const item of photo.orderItems) {
          if (item.order.status === "CANCELLED") continue;

          await tx.orderItem.update({
            where: { id: item.id },
            data: {
              archivedFilename: photo.filename,
              photoId: null,
            },
          });
        }
      }

      if (orderIds.length > 0) {
        await tx.order.updateMany({
          where: {
            id: { in: orderIds },
            status: { not: "CANCELLED" },
          },
          data: {
            status: "SOURCE_DELETED",
            sourceDeletedAt: now,
            archivedParentName: participant?.parentName ?? undefined,
            archivedChildName: participant?.childName ?? undefined,
            eventId: null,
          },
        });
      }

      if (photoIds.length > 0) {
        await tx.cartItem.deleteMany({ where: { photoId: { in: photoIds } } });
        await tx.orderItem.deleteMany({
          where: {
            photoId: { in: photoIds },
            order: { status: "CANCELLED" },
          },
        });
        await tx.photo.deleteMany({ where: { id: { in: photoIds } } });
      }

      await tx.individualShootingRequest.delete({ where: { id: req.id } });

      if (participantId) {
        await tx.participant.delete({ where: { id: participantId } });
      }

      if (galleryEventId) {
        const remainingParticipants = await tx.participant.count({
          where: { eventId: galleryEventId },
        });
        if (remainingParticipants === 0) {
          await tx.shootingEvent.delete({ where: { id: galleryEventId } });
        }
      }
    });

    revalidateAppointmentPaths(req.id, galleryEventId);

    const orderHint =
      orderNumbers.length > 0
        ? ` ${orderNumbers.length} Bestellung(en) unter „Bestellungen“ als Galerie-Daten gelöscht markiert.`
        : "";

    return {
      success: true,
      message: `Archivierter Termin gelöscht.${orderHint}`,
      orderNumbers,
    };
  } catch {
    return { error: "Löschen fehlgeschlagen." };
  }
}

async function loadArchivedDeleteContext(requestId: string): Promise<{
  req?: {
    id: string;
    status: string;
  };
  participant?: {
    id: string;
    parentName: string;
    childName: string;
    eventId: string;
  } | null;
  galleryEventId: string | null;
  photos: Array<{
    id: string;
    filename: string;
    storageKey: string;
    previewKey: string | null;
    orderItems: Array<{
      id: string;
      order: { id: string; status: string; orderNumber: string };
    }>;
  }>;
  orderIds: string[];
  orderNumbers: string[];
  error?: string;
}> {
  const req = await prisma.individualShootingRequest.findUnique({
    where: { id: requestId },
    include: {
      participant: {
        include: {
          photos: {
            include: {
              orderItems: {
                include: {
                  order: { select: { id: true, status: true, orderNumber: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!req) return { error: "Terminanfrage nicht gefunden.", galleryEventId: null, photos: [], orderIds: [], orderNumbers: [] };
  if (req.status !== "ARCHIVED") {
    return {
      error: "Nur archivierte Einträge können endgültig gelöscht werden.",
      galleryEventId: null,
      photos: [],
      orderIds: [],
      orderNumbers: [],
    };
  }

  const participant = req.participant;
  const galleryEventId = participant?.eventId ?? null;
  const photos = participant?.photos ?? [];
  const orderIds = new Set<string>();
  const orderNumbers = new Set<string>();

  for (const photo of photos) {
    for (const item of photo.orderItems) {
      if (item.order.status === "CANCELLED") continue;
      orderIds.add(item.order.id);
      orderNumbers.add(item.order.orderNumber);
    }
  }

  if (galleryEventId) {
    const eventOrders = await prisma.order.findMany({
      where: {
        eventId: galleryEventId,
        status: { not: "CANCELLED" },
      },
      select: { id: true, orderNumber: true },
    });
    for (const order of eventOrders) {
      orderIds.add(order.id);
      orderNumbers.add(order.orderNumber);
    }
  }

  return {
    req,
    participant,
    galleryEventId,
    photos,
    orderIds: [...orderIds],
    orderNumbers: [...orderNumbers],
  };
}

export async function rescheduleIndividualShootingAppointment(input: {
  requestId: string;
  confirmedDate: string;
  confirmedTime?: string;
  confirmedLocation: string;
  notifyMessage?: string;
}) {
  try {
    await requireStaff();

    const parsed = rescheduleSchema.safeParse(input);
    if (!parsed.success) {
      return { error: "Bitte Datum und Ort ausfüllen." };
    }

    const req = await prisma.individualShootingRequest.findUnique({
      where: { id: parsed.data.requestId },
      include: {
        voucher: { include: { product: true } },
        participant: { include: { _count: { select: { photos: true } } } },
      },
    });

    if (!req) return { error: "Terminanfrage nicht gefunden." };
    if (!req.confirmedDate) {
      return { error: "Termin wurde noch nicht bestätigt – bitte zuerst planen." };
    }
    if ((req.participant?._count.photos ?? 0) > 0) {
      return {
        error: "Shooting hat Galerie-Fotos – Termin kann nicht verschoben werden.",
      };
    }

    const date = new Date(`${parsed.data.confirmedDate}T12:00:00`);
    const confirmedTime = parsed.data.confirmedTime?.trim() || null;
    const confirmedLocation = parsed.data.confirmedLocation.trim();
    const previous = {
      date: req.confirmedDate,
      time: req.confirmedTime,
      location: req.confirmedLocation,
    };
    const next = { date, time: confirmedTime, location: confirmedLocation };

    if (!appointmentChanged(previous, next)) {
      return { error: "Keine Änderung am Termin – bitte Datum, Uhrzeit oder Ort anpassen." };
    }

    await prisma.individualShootingRequest.update({
      where: { id: req.id },
      data: {
        confirmedDate: date,
        confirmedTime,
        confirmedLocation,
        status: "CONFIRMED",
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://aquafotos.com";
    const productTitle =
      req.voucher?.product.title ??
      shootingTypeLabels[req.shootingType] ??
      "Individuelles Shooting";

    const delivery = await sendVoucherAppointmentChangedEmail({
      to: req.email,
      parentName: req.parentName,
      childName: req.childName,
      productTitle,
      shootingTypeLabel: shootingTypeLabels[req.shootingType],
      previousDate: formatAppointmentDate(previous.date),
      previousTime: previous.time ?? undefined,
      previousLocation: previous.location ?? "—",
      confirmedDate: formatAppointmentDate(date),
      confirmedDateIso: parsed.data.confirmedDate,
      confirmedTime: confirmedTime ?? undefined,
      confirmedLocation,
      notifyMessage: parsed.data.notifyMessage?.trim() || undefined,
      contactLink: `${appUrl}/kontakt`,
      purchaseNumber: req.voucher?.purchaseNumber ?? "",
      voucherCode: req.voucher?.code,
    });

    revalidateAppointmentPaths(req.id, req.eventId);

    if (!delivery.configured) {
      return {
        success: true,
        emailConfigured: false,
        message:
          "Termin gespeichert, aber E-Mail-Versand ist nicht konfiguriert (RESEND_API_KEY fehlt).",
      };
    }

    if (!delivery.sent) {
      return {
        error: delivery.error ?? "Termin gespeichert, aber Benachrichtigung konnte nicht gesendet werden.",
      };
    }

    return {
      success: true,
      emailSent: true,
      emailConfigured: true,
      message: `Termin geändert – Benachrichtigung an ${req.email} gesendet.`,
    };
  } catch {
    return { error: "Terminänderung fehlgeschlagen." };
  }
}

export async function getDefaultNewEventForRequest(requestId: string) {
  await requireStaff();

  const req = await prisma.individualShootingRequest.findUnique({
    where: { id: requestId },
    include: { voucher: { include: { product: true } } },
  });
  if (!req) return null;

  return defaultNewEventFromRequest({
    shootingType: req.shootingType,
    productTitle: req.voucher?.product.title ?? null,
    parentName: req.parentName,
  });
}
