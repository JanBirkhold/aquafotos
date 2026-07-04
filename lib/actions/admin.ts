"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { auth, isStaffRole } from "@/lib/auth";
import {
  deletePhotoFile,
  normalizeAssignedPhotoFilename,
  photoFilesystemPath,
  renamePhotoFile,
  resolveUniqueFilename,
  sanitizePhotoFilename,
} from "@/lib/admin-photos";
import { prisma } from "@/lib/prisma";
import {
  sendEventCancelled,
  sendNewEventNotification,
  sendShootingReminder,
} from "@/lib/email";
import {
  buildAccessCode,
  buildPhotoFilename,
  buildQrPayload,
  formatParticipantCode,
  generateQrDataUrl,
  parseParticipantNumberFromFilename,
} from "@/lib/qr-utils";
import { sendParticipantConfirmationEmail } from "@/lib/participant-email";
import { markParticipantConfirmed } from "@/lib/actions/participant-workflow";
import { shootingTypeLabels } from "@/lib/shooting-types";
import type { EventStatus, ShootingCategory, ShootingType } from "@prisma/client";

async function requireStaff() {
  const session = await auth();
  if (!session?.user || !isStaffRole(session.user.role)) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function getDashboardStats() {
  await requireStaff();

  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [today, month, year, participants, openEvents, openReorders] = await Promise.all([
      prisma.order.aggregate({
        where: { paidAt: { gte: startOfDay }, status: { in: ["PAID", "PROCESSING", "READY", "DELIVERED"] } },
        _sum: { totalCents: true },
      }),
      prisma.order.aggregate({
        where: { paidAt: { gte: startOfMonth }, status: { in: ["PAID", "PROCESSING", "READY", "DELIVERED"] } },
        _sum: { totalCents: true },
      }),
      prisma.order.aggregate({
        where: { paidAt: { gte: startOfYear }, status: { in: ["PAID", "PROCESSING", "READY", "DELIVERED"] } },
        _sum: { totalCents: true },
      }),
      prisma.participant.count(),
      prisma.shootingEvent.count({
        where: { status: { in: ["PUBLISHED", "FULL"] }, date: { gte: now } },
      }),
      prisma.order.count({
        where: {
          isReorder: true,
          status: { in: ["PAID", "PROCESSING", "READY"] },
        },
      }),
    ]);

    return {
      revenueToday: today._sum.totalCents ?? 0,
      revenueMonth: month._sum.totalCents ?? 0,
      revenueYear: year._sum.totalCents ?? 0,
      totalParticipants: participants,
      openEvents,
      openReorders,
    };
  } catch {
    return {
      revenueToday: 0,
      revenueMonth: 0,
      revenueYear: 0,
      totalParticipants: 0,
      openEvents: 0,
      openReorders: 0,
    };
  }
}

export async function createEvent(data: {
  title: string;
  description?: string;
  category: ShootingCategory;
  shootingType: ShootingType;
  date: string;
  startTime?: string;
  endTime?: string;
  location: string;
  maxParticipants: number;
  slots?: { startTime: string; endTime?: string; maxParticipants: number }[];
}) {
  await requireStaff();

  const event = await prisma.shootingEvent.create({
    data: {
      title: data.title,
      description: data.description || null,
      category: data.category,
      shootingType: data.shootingType,
      date: new Date(data.date),
      startTime: data.startTime,
      endTime: data.endTime,
      location: data.location,
      maxParticipants: data.maxParticipants,
      status: "DRAFT",
      slots: data.slots?.length
        ? { create: data.slots }
        : undefined,
    },
  });

  revalidatePath("/admin");
  return event;
}

export async function publishEvent(
  eventId: string,
  overrides?: { subject?: string; bodyHtml?: string },
) {
  await requireStaff();

  const event = await prisma.shootingEvent.update({
    where: { id: eventId },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  });

  const subscribers = await prisma.shootingNotification.findMany({
    where: {
      active: true,
      shootingType: event.shootingType,
      OR: [{ location: null }, { location: event.location }],
    },
  });

  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://aquafotos.com"}/shootings/${event.id}`;

  for (const sub of subscribers) {
    await sendNewEventNotification({
      to: sub.email,
      shootingType: shootingTypeLabels[event.shootingType],
      location: event.location,
      eventTitle: event.title,
      url,
      overrides,
    });
  }

  revalidatePath("/admin");
  revalidatePath("/shootings");
  return { success: true, notified: subscribers.length };
}

export async function addParticipantManual(data: {
  eventId: string;
  parentName: string;
  childName: string;
  email: string;
  phone: string;
  slotId?: string;
}) {
  await requireStaff();

  const event = await prisma.shootingEvent.findUniqueOrThrow({
    where: { id: data.eventId },
    include: { _count: { select: { participants: true } } },
  });

  const participantNumber = event._count.participants + 1;
  const accessCode = buildAccessCode(event.id, participantNumber);
  const qrCodeValue = buildQrPayload(accessCode);

  const participant = await prisma.participant.create({
    data: {
      eventId: data.eventId,
      slotId: data.slotId,
      participantNumber,
      parentName: data.parentName,
      childName: data.childName,
      email: data.email,
      phone: data.phone,
      gdprConsent: true,
      gdprConsentAt: new Date(),
      status: "INVITED",
      registrationSource: "MANUAL",
      qrCode: {
        create: {
          code: qrCodeValue,
          qrDataUrl: await generateQrDataUrl(qrCodeValue),
        },
      },
      galleryAccess: { create: { accessCode } },
    },
  });

  await sendParticipantConfirmationEmail(participant.id);

  revalidatePath(`/admin/shootings/${data.eventId}`);
  return participant;
}

export async function resendParticipantConfirmation(
  participantId: string,
  eventId: string,
  overrides?: { subject?: string; bodyHtml?: string },
) {
  await requireStaff();
  const result = await sendParticipantConfirmationEmail(participantId, overrides);
  revalidatePath(`/admin/shootings/${eventId}`);
  return result;
}

export async function confirmParticipantManual(participantId: string, eventId: string) {
  await requireStaff();
  await markParticipantConfirmed(participantId);
  revalidatePath(`/admin/shootings/${eventId}`);
  return { success: true };
}

export async function assignPhotoByQr(photoId: string, qrCode: string) {
  await requireStaff();

  const qr = await prisma.participantQR.findUnique({
    where: { code: qrCode },
    include: { participant: true },
  });

  if (!qr) return { error: "QR-Code nicht gefunden." };

  await prisma.photo.update({
    where: { id: photoId },
    data: {
      participantId: qr.participantId,
      qrDetectedCode: qrCode,
      processingStatus: "PRESELECTED",
    },
  });

  return { success: true, participant: qr.participant };
}

export async function updatePricing(data: {
  firstImagePrice: number;
  secondImagePrice: number;
  additionalPrice: number;
}) {
  await requireStaff();

  await prisma.pricingConfig.updateMany({ data: { active: false } });

  await prisma.pricingConfig.create({
    data: {
      firstImagePrice: data.firstImagePrice,
      secondImagePrice: data.secondImagePrice,
      additionalPrice: data.additionalPrice,
      active: true,
    },
  });

  revalidatePath("/admin/preise");
  return { success: true };
}

export async function getEventStats(eventId: string) {
  await requireStaff();

  const [participants, orders, photos] = await Promise.all([
    prisma.participant.count({ where: { eventId } }),
    prisma.order.aggregate({
      where: { eventId, status: { not: "CANCELLED" } },
      _sum: { totalCents: true },
      _count: true,
    }),
    prisma.photo.groupBy({
      by: ["processingStatus"],
      where: { eventId },
      _count: true,
    }),
  ]);

  return { participants, orders, photos };
}

export async function updateOrderStatus(
  orderId: string,
  status: "PROCESSING" | "READY" | "DELIVERED",
) {
  await requireStaff();

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      deliveredAt: status === "DELIVERED" ? new Date() : undefined,
    },
  });

  revalidatePath("/admin/bestellungen");
  return { success: true };
}

export async function updateEvent(
  eventId: string,
  data: {
    title: string;
    description?: string;
    category: ShootingCategory;
    shootingType: ShootingType;
    date: string;
    startTime?: string;
    endTime?: string;
    location: string;
    locationDetail?: string;
    maxParticipants: number;
    allowWaitlist: boolean;
  },
) {
  await requireStaff();

  const event = await prisma.shootingEvent.update({
    where: { id: eventId },
    data: {
      title: data.title,
      description: data.description || null,
      category: data.category,
      shootingType: data.shootingType,
      date: new Date(data.date),
      startTime: data.startTime || null,
      endTime: data.endTime || null,
      location: data.location,
      locationDetail: data.locationDetail || null,
      maxParticipants: data.maxParticipants,
      allowWaitlist: data.allowWaitlist,
    },
  });

  revalidatePath("/admin/shootings");
  revalidatePath(`/admin/shootings/${eventId}`);
  revalidatePath("/shootings");
  return event;
}

export async function cancelEvent(
  eventId: string,
  reason?: string,
  overrides?: { subject?: string; bodyHtml?: string },
) {
  await requireStaff();

  const event = await prisma.shootingEvent.update({
    where: { id: eventId },
    data: { status: "CANCELLED" },
    include: { participants: true },
  });

  const dateStr = event.date.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  for (const p of event.participants) {
    await sendEventCancelled({
      to: p.email,
      parentName: p.parentName,
      eventTitle: event.title,
      date: dateStr,
      reason,
      overrides,
    });
  }

  revalidatePath("/admin/shootings");
  revalidatePath(`/admin/shootings/${eventId}`);
  revalidatePath("/shootings");
  return { success: true, sent: event.participants.length };
}

export async function notifyEventParticipants(
  eventId: string,
  options?: { notes?: string; subject?: string; bodyHtml?: string },
) {
  await requireStaff();

  const event = await prisma.shootingEvent.findUniqueOrThrow({
    where: { id: eventId },
    include: { participants: true },
  });

  const dateStr = event.date.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const overrides =
    options?.subject || options?.bodyHtml
      ? { subject: options.subject, bodyHtml: options.bodyHtml }
      : undefined;

  let sent = 0;
  for (const p of event.participants) {
    await sendShootingReminder({
      to: p.email,
      parentName: p.parentName,
      eventTitle: event.title,
      date: dateStr,
      time: event.startTime ?? undefined,
      location: event.location,
      notes: options?.notes,
      overrides,
    });
    sent++;
  }

  return { success: true, sent };
}

export async function ensureParticipantQrCodes(eventId: string) {
  await requireStaff();

  const participants = await prisma.participant.findMany({
    where: { eventId },
    include: { qrCode: true },
  });

  let fixed = 0;
  for (const p of participants) {
    const accessCode = buildAccessCode(eventId, p.participantNumber);
    const payload = buildQrPayload(accessCode);
    const qrDataUrl = await generateQrDataUrl(payload);

    if (p.qrCode) {
      if (!p.qrCode.qrDataUrl) {
        await prisma.participantQR.update({
          where: { id: p.qrCode.id },
          data: { qrDataUrl, code: payload },
        });
        fixed++;
      }
    } else {
      await prisma.participantQR.create({
        data: {
          participantId: p.id,
          code: payload,
          qrDataUrl,
        },
      });
      fixed++;
    }
  }

  revalidatePath(`/admin/shootings/${eventId}`);
  return { fixed };
}

type ParticipantPhotoTarget = {
  id: string;
  participantNumber: number;
  qrCode: string | null;
};

async function persistParticipantPhoto(
  eventId: string,
  participant: ParticipantPhotoTarget,
  file: File,
  sortOrder: number,
  preferredFilename?: string,
): Promise<string> {
  const uploadDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    "events",
    eventId,
    participant.id,
  );
  await mkdir(uploadDir, { recursive: true });

  const baseFilename =
    preferredFilename ??
    buildPhotoFilename(participant.participantNumber, file.name);
  const filename = await resolveUniqueFilename(uploadDir, baseFilename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  const storageKey = `/uploads/events/${eventId}/${participant.id}/${filename}`;
  await prisma.photo.create({
    data: {
      eventId,
      participantId: participant.id,
      filename,
      storageKey,
      previewKey: storageKey,
      qrDetectedCode: participant.qrCode,
      processingStatus: "READY",
      sortOrder,
    },
  });

  return filename;
}

export type BulkPhotoUploadResult = {
  success: true;
  uploaded: number;
  assigned: { participantNumber: number; childName: string; count: number }[];
  skipped: { filename: string; reason: string }[];
};

export async function bulkUploadEventPhotos(
  formData: FormData,
): Promise<BulkPhotoUploadResult | { error: string }> {
  await requireStaff();

  const eventId = formData.get("eventId") as string;
  if (!eventId) return { error: "Event fehlt." };

  const files = formData
    .getAll("photos")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return { error: "Keine Dateien ausgewählt." };

  const participants = await prisma.participant.findMany({
    where: { eventId },
    include: { qrCode: true },
  });

  if (participants.length === 0) {
    return { error: "Keine Teilnehmer im Shooting – zuerst Teilnehmer anlegen." };
  }

  const byNumber = new Map(participants.map((p) => [p.participantNumber, p]));
  const sortOrders = new Map<string, number>(
    await Promise.all(
      participants.map(async (p) => [
        p.id,
        await prisma.photo.count({ where: { participantId: p.id } }),
      ] as const),
    ),
  );

  const assignedCounts = new Map<number, number>();
  const skipped: BulkPhotoUploadResult["skipped"] = [];
  const affectedParticipantIds = new Set<string>();
  let uploaded = 0;

  for (const file of files) {
    const participantNumber = parseParticipantNumberFromFilename(file.name);
    if (participantNumber === null) {
      skipped.push({
        filename: file.name,
        reason: "Keine Teilnehmer-Nr. im Dateinamen (Format: 001_bild.jpg)",
      });
      continue;
    }

    const participant = byNumber.get(participantNumber);
    if (!participant) {
      skipped.push({
        filename: file.name,
        reason: `Teilnehmer #${formatParticipantCode(participantNumber)} ist nicht im Shooting`,
      });
      continue;
    }

    const preferredFilename = normalizeAssignedPhotoFilename(
      file.name,
      participantNumber,
    );
    if (!preferredFilename) {
      skipped.push({
        filename: file.name,
        reason: "Ungültiger Dateiname oder Bildformat",
      });
      continue;
    }

    try {
      const sortOrder = sortOrders.get(participant.id) ?? 0;
      await persistParticipantPhoto(
        eventId,
        {
          id: participant.id,
          participantNumber: participant.participantNumber,
          qrCode: participant.qrCode?.code ?? null,
        },
        file,
        sortOrder,
        preferredFilename,
      );
      sortOrders.set(participant.id, sortOrder + 1);
      assignedCounts.set(
        participantNumber,
        (assignedCounts.get(participantNumber) ?? 0) + 1,
      );
      affectedParticipantIds.add(participant.id);
      uploaded++;
    } catch {
      skipped.push({
        filename: file.name,
        reason: "Speichern fehlgeschlagen",
      });
    }
  }

  for (const participantId of affectedParticipantIds) {
    await revalidateParticipantGallery(participantId);
  }
  revalidatePath(`/admin/shootings/${eventId}`);

  return {
    success: true,
    uploaded,
    assigned: Array.from(assignedCounts.entries())
      .map(([participantNumber, count]) => ({
        participantNumber,
        childName: byNumber.get(participantNumber)!.childName,
        count,
      }))
      .sort((a, b) => a.participantNumber - b.participantNumber),
    skipped,
  };
}

export async function uploadParticipantPhotos(formData: FormData) {
  await requireStaff();

  const eventId = formData.get("eventId") as string;
  const participantId = formData.get("participantId") as string;
  if (!eventId || !participantId) {
    return { error: "Event oder Teilnehmer fehlt." };
  }

  const participant = await prisma.participant.findFirst({
    where: { id: participantId, eventId },
    include: { qrCode: true },
  });
  if (!participant) return { error: "Teilnehmer nicht gefunden." };

  const files = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return { error: "Keine Dateien ausgewählt." };

  let uploaded = 0;
  const existingCount = await prisma.photo.count({ where: { participantId } });

  for (const file of files) {
    await persistParticipantPhoto(
      eventId,
      {
        id: participant.id,
        participantNumber: participant.participantNumber,
        qrCode: participant.qrCode?.code ?? null,
      },
      file,
      existingCount + uploaded,
    );
    uploaded++;
  }

  await revalidateParticipantGallery(participant.id);
  revalidatePath(`/admin/shootings/${eventId}`);
  return { success: true, uploaded };
}

async function revalidateParticipantGallery(participantId: string) {
  const galleryAccess = await prisma.galleryAccess.findUnique({
    where: { participantId },
  });
  if (galleryAccess) {
    revalidatePath(`/galerie/${galleryAccess.accessCode}`);
  }
}

export async function deleteParticipantPhoto(photoId: string, eventId: string) {
  await requireStaff();

  const photo = await prisma.photo.findFirst({
    where: { id: photoId, eventId },
    include: {
      orderItems: { include: { order: { select: { status: true } } } },
    },
  });

  if (!photo) return { error: "Foto nicht gefunden." };

  const blocked = photo.orderItems.some(
    (item) => item.order.status !== "CANCELLED",
  );
  if (blocked) {
    return {
      error: "Foto ist in einer Bestellung enthalten und kann nicht gelöscht werden.",
    };
  }

  await deletePhotoFile(photo.storageKey);
  await prisma.photo.delete({ where: { id: photoId } });

  if (photo.participantId) {
    await revalidateParticipantGallery(photo.participantId);
  }
  revalidatePath(`/admin/shootings/${eventId}`);

  return { success: true };
}

export async function renameParticipantPhoto(params: {
  photoId: string;
  eventId: string;
  filename: string;
}) {
  await requireStaff();

  const sanitized = sanitizePhotoFilename(params.filename);
  if (!sanitized) {
    return { error: "Ungültiger Dateiname. Erlaubt: Buchstaben, Zahlen, _ - und Bild-Endung." };
  }

  const photo = await prisma.photo.findFirst({
    where: { id: params.photoId, eventId: params.eventId },
  });
  if (!photo?.participantId) return { error: "Foto nicht gefunden." };

  const duplicate = await prisma.photo.findFirst({
    where: {
      participantId: photo.participantId,
      filename: sanitized,
      id: { not: photo.id },
    },
  });
  if (duplicate) return { error: "Dateiname ist bei diesem Teilnehmer bereits vergeben." };

  const newStorageKey = `/uploads/events/${params.eventId}/${photo.participantId}/${sanitized}`;

  if (newStorageKey !== photo.storageKey) {
    try {
      await renamePhotoFile(photo.storageKey, newStorageKey);
    } catch {
      return { error: "Datei konnte nicht umbenannt werden." };
    }
  }

  await prisma.photo.update({
    where: { id: photo.id },
    data: {
      filename: sanitized,
      storageKey: newStorageKey,
      previewKey: newStorageKey,
    },
  });

  await revalidateParticipantGallery(photo.participantId);
  revalidatePath(`/admin/shootings/${params.eventId}`);

  return { success: true, filename: sanitized };
}

export async function replaceParticipantPhoto(formData: FormData) {
  await requireStaff();

  const photoId = formData.get("photoId") as string;
  const eventId = formData.get("eventId") as string;
  const file = formData.get("photo");

  if (!photoId || !eventId || !(file instanceof File) || file.size === 0) {
    return { error: "Foto oder Datei fehlt." };
  }

  const photo = await prisma.photo.findFirst({
    where: { id: photoId, eventId },
    include: { participant: true },
  });
  if (!photo?.participantId) return { error: "Foto nicht gefunden." };

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  if (!["jpg", "jpeg", "png", "webp", "gif", "heic"].includes(ext)) {
    return { error: "Nur Bilddateien sind erlaubt." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(photoFilesystemPath(photo.storageKey), buffer);

  await prisma.photo.update({
    where: { id: photo.id },
    data: {
      processingStatus: "READY",
      updatedAt: new Date(),
    },
  });

  await revalidateParticipantGallery(photo.participantId);
  revalidatePath(`/admin/shootings/${eventId}`);

  return { success: true };
}

export async function reorderParticipantPhotos(
  eventId: string,
  participantId: string,
  orderedPhotoIds: string[],
) {
  await requireStaff();

  const photos = await prisma.photo.findMany({
    where: { eventId, participantId },
    select: { id: true },
    orderBy: { sortOrder: "asc" },
  });

  const validIds = new Set(photos.map((p) => p.id));
  if (
    orderedPhotoIds.length !== photos.length ||
    !orderedPhotoIds.every((id) => validIds.has(id))
  ) {
    return { error: "Ungültige Reihenfolge." };
  }

  await prisma.$transaction(
    orderedPhotoIds.map((id, index) =>
      prisma.photo.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );

  await revalidateParticipantGallery(participantId);
  revalidatePath(`/admin/shootings/${eventId}`);

  return { success: true };
}

export async function updateEventStatus(eventId: string, status: EventStatus) {
  await requireStaff();

  await prisma.shootingEvent.update({
    where: { id: eventId },
    data: {
      status,
      publishedAt: status === "PUBLISHED" ? new Date() : undefined,
    },
  });

  revalidatePath("/admin/shootings");
  revalidatePath(`/admin/shootings/${eventId}`);
  revalidatePath("/shootings");
  return { success: true };
}
