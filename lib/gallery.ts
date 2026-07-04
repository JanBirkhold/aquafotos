import type { PhotoProcessingStatus } from "@prisma/client";

/** Status, ab dem Kunden Fotos in ihrer Galerie sehen dürfen */
export const galleryVisibleStatuses: PhotoProcessingStatus[] = [
  "PRESELECTED",
  "APPROVED",
  "READY",
];

export function getPhotoDisplayUrl(photo: {
  previewKey: string | null;
  storageKey: string;
}): string {
  return photo.previewKey ?? photo.storageKey;
}

export type GalleryPhoto = {
  id: string;
  src: string;
  filename: string;
};
