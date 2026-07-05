"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { canAdvanceStatus, normalizeParticipantStatus } from "@/lib/participant-workflow";
import type { ParticipantStatus } from "@prisma/client";

export async function advanceParticipantStatus(
  participantId: string,
  targetStatus: ParticipantStatus,
  timestamps?: {
    confirmedAt?: Date;
    galleryViewedAt?: Date;
    orderedAt?: Date;
    confirmationSentAt?: Date;
  },
) {
  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
  });
  if (!participant) return;

  if (!canAdvanceStatus(participant.status, targetStatus)) return;

  await prisma.participant.update({
    where: { id: participantId },
    data: {
      status: targetStatus,
      confirmedAt: timestamps?.confirmedAt ?? undefined,
      galleryViewedAt: timestamps?.galleryViewedAt ?? undefined,
      orderedAt: timestamps?.orderedAt ?? undefined,
      confirmationSentAt: timestamps?.confirmationSentAt ?? undefined,
    },
  });

  revalidatePath(`/admin/shootings/${participant.eventId}`);
}

export async function markParticipantGalleryViewed(participantId: string) {
  const now = new Date();
  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
    include: {
      galleryAccess: true,
      individualShootingReq: { select: { id: true, voucherId: true, eventId: true } },
      _count: { select: { photos: true } },
    },
  });
  if (!participant) return;

  if (participant.galleryAccess) {
    await prisma.galleryAccess.update({
      where: { id: participant.galleryAccess.id },
      data: {
        lastAccessAt: now,
        accessCount: { increment: 1 },
        emailVerified: true,
        verifiedAt: participant.galleryAccess.verifiedAt ?? now,
      },
    });
  }

  const isVoucherEinzel =
    participant.individualShootingReq?.voucherId != null &&
    participant.individualShootingReq.eventId == null;

  if (isVoucherEinzel && participant._count.photos === 0) {
    revalidatePath(`/admin/shootings/${participant.eventId}`);
    if (participant.individualShootingReq?.id) {
      revalidatePath(`/admin/shootings/einzel/${participant.individualShootingReq.id}`);
    }
    return;
  }

  if (normalizeParticipantStatus(participant.status) === "ORDERED") return;

  await prisma.participant.update({
    where: { id: participantId },
    data: {
      status: "GALLERY_VIEWED",
      galleryViewedAt: now,
      confirmedAt: participant.confirmedAt ?? now,
    },
  });

  revalidatePath(`/admin/shootings/${participant.eventId}`);
  if (participant.individualShootingReq?.id) {
    revalidatePath(`/admin/shootings/einzel/${participant.individualShootingReq.id}`);
  }
}

export async function markParticipantsOrdered(participantIds: string[]) {
  const now = new Date();
  const unique = [...new Set(participantIds)];

  for (const participantId of unique) {
    await advanceParticipantStatus(participantId, "ORDERED", { orderedAt: now });
  }
}

export async function markParticipantConfirmed(participantId: string) {
  await advanceParticipantStatus(participantId, "CONFIRMED", {
    confirmedAt: new Date(),
  });
}
