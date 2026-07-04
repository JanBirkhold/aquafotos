import { prisma } from "@/lib/prisma";
import { sendRegistrationConfirmation } from "@/lib/email";
import { isCoupleShooting } from "@/lib/registration-fields";

function appBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://aquafotos.com";
}

export async function sendParticipantConfirmationEmail(
  participantId: string,
  overrides?: { subject?: string; bodyHtml?: string },
) {
  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
    include: {
      event: true,
      galleryAccess: true,
      qrCode: true,
    },
  });

  if (!participant) return { error: "Teilnehmer nicht gefunden." };

  const accessCode = participant.galleryAccess?.accessCode;
  const dateStr = participant.event.date.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  await sendRegistrationConfirmation({
    to: participant.email,
    parentName: participant.parentName,
    childName: participant.childName,
    eventTitle: participant.event.title,
    date: dateStr,
    time: participant.event.startTime ?? undefined,
    location: participant.event.location,
    coupleMode: isCoupleShooting(participant.event.category),
    accessCode,
    galleryUrl: accessCode
      ? `${appBaseUrl()}/bilder-bestellen?code=${encodeURIComponent(accessCode)}`
      : undefined,
    isInvitation: participant.registrationSource === "MANUAL",
    qrDataUrl: participant.qrCode?.qrDataUrl,
    participantNumber: participant.participantNumber,
    overrides,
  });

  await prisma.participant.update({
    where: { id: participantId },
    data: { confirmationSentAt: new Date() },
  });

  return { success: true };
}
