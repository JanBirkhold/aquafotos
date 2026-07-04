import { prisma } from "@/lib/prisma";
import { cartSessionId } from "@/lib/gallery-session";

export async function validateGalleryCredentials(email: string, accessCode: string) {
  const code = cartSessionId(accessCode);
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !code) return null;

  const access = await prisma.galleryAccess.findUnique({
    where: { accessCode: code },
    include: { participant: true },
  });

  if (!access || access.participant.email.toLowerCase() !== normalizedEmail) {
    return null;
  }

  return access;
}

export function emailsMatch(sessionEmail: string, participantEmail: string): boolean {
  return sessionEmail.trim().toLowerCase() === participantEmail.trim().toLowerCase();
}
