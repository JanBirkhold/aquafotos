"use server";

import { setGalleryAccessCookie } from "@/lib/gallery-session";
import { validateGalleryCredentials } from "@/lib/gallery-access";
import { markParticipantGalleryViewed } from "@/lib/actions/participant-workflow";

export type GalleryAccessResult = {
  error?: string;
  success?: boolean;
  accessCode?: string;
};

export async function openGalleryAccess(
  email: string,
  accessCode: string,
): Promise<GalleryAccessResult> {
  const access = await validateGalleryCredentials(email, accessCode);
  if (!access) {
    return { error: "Zugangscode oder E-Mail stimmen nicht überein." };
  }

  await setGalleryAccessCookie(access.accessCode);
  await markParticipantGalleryViewed(access.participantId);
  return { success: true, accessCode: access.accessCode };
}
