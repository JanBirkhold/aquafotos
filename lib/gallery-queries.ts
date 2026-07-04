import { prisma } from "@/lib/prisma";
import { galleryVisibleStatuses } from "@/lib/gallery";

export async function verifyGalleryAccess(accessCode: string) {
  try {
    const access = await prisma.galleryAccess.findUnique({
      where: { accessCode: accessCode.toUpperCase() },
      include: {
        participant: {
          include: {
            event: true,
            photos: {
              where: { processingStatus: { in: galleryVisibleStatuses } },
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
    });

    if (!access) return null;
    return access;
  } catch {
    return null;
  }
}
