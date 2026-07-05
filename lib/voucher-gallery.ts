import { galleryVisibleStatuses } from "@/lib/gallery";
import { buildBilderBestellenUrl } from "@/lib/gallery-access-url";
import { prisma } from "@/lib/prisma";
import type { PhotoProcessingStatus } from "@prisma/client";

export type VoucherGalleryAccess = {
  accessCode: string;
  galleryUrl: string;
  bilderBestellenUrl: string;
  photoCount: number;
  galleryReady: boolean;
};

type GalleryParticipantInput = {
  galleryAccess: { accessCode: string } | null;
  photos: { processingStatus: PhotoProcessingStatus }[];
} | null | undefined;

export function mapVoucherGalleryAccess(
  participant: GalleryParticipantInput,
  options?: { email?: string },
): VoucherGalleryAccess | null {
  if (!participant?.galleryAccess) return null;

  const accessCode = participant.galleryAccess.accessCode;
  const photoCount = participant.photos.filter((photo) =>
    galleryVisibleStatuses.includes(photo.processingStatus),
  ).length;
  const email = options?.email;

  return {
    accessCode,
    galleryUrl: `/galerie/${encodeURIComponent(accessCode)}`,
    bilderBestellenUrl: buildBilderBestellenUrl(accessCode, { email }),
    photoCount,
    galleryReady: photoCount > 0,
  };
}

export async function isVoucherGalleryParticipant(participantId: string): Promise<boolean> {
  try {
    const req = await prisma.individualShootingRequest.findFirst({
      where: { participantId, voucherId: { not: null } },
      select: { id: true },
    });
    return !!req;
  } catch {
    return false;
  }
}

export async function isVoucherGalleryAccessCode(accessCode: string): Promise<boolean> {
  try {
    const access = await prisma.galleryAccess.findUnique({
      where: { accessCode: accessCode.toUpperCase() },
      select: { participantId: true },
    });
    if (!access) return false;
    return isVoucherGalleryParticipant(access.participantId);
  } catch {
    return false;
  }
}
