"use server";

import { revalidatePath } from "next/cache";
import { auth, isStaffRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  EMAIL_TEMPLATE_KEYS,
  getTemplateDefinition,
  renderEmailTemplate,
} from "@/lib/email-template-definitions";
import {
  getEmailTemplate,
  listEmailTemplates,
} from "@/lib/email-templates";
import { sendRawEmail } from "@/lib/email";
import { emailFeedbackFromDelivery } from "@/lib/email-delivery";

async function requireStaff() {
  const session = await auth();
  if (!session?.user || !isStaffRole(session.user.role)) {
    throw new Error("Unauthorized");
  }
}

export async function getEmailTemplatesForAdmin() {
  await requireStaff();
  return listEmailTemplates();
}

export async function updateEmailTemplate(data: {
  key: string;
  subject: string;
  bodyHtml: string;
}) {
  await requireStaff();

  if (!data.subject.trim() || !data.bodyHtml.trim()) {
    return { error: "Betreff und Text dürfen nicht leer sein." };
  }

  await getEmailTemplate(data.key);
  await prisma.emailTemplate.update({
    where: { key: data.key },
    data: {
      subject: data.subject.trim(),
      bodyHtml: data.bodyHtml.trim(),
    },
  });

  revalidatePath("/admin/benachrichtigungen");
  return { success: true };
}

export async function resetEmailTemplate(key: string) {
  await requireStaff();
  const def = getTemplateDefinition(key);
  if (!def) return { error: "Vorlage nicht gefunden." };

  await getEmailTemplate(key);
  const updated = await prisma.emailTemplate.update({
    where: { key },
    data: {
      subject: def.subject,
      bodyHtml: def.bodyHtml,
    },
  });

  revalidatePath("/admin/benachrichtigungen");
  return { success: true, template: updated };
}

export async function previewNotificationEmail(
  key: string,
  variables: Record<string, string>,
  draft?: { subject?: string; bodyHtml?: string },
) {
  await requireStaff();
  const template = await getEmailTemplate(key);
  const def = getTemplateDefinition(key);

  return {
    subject: renderEmailTemplate(draft?.subject ?? template.subject, variables),
    bodyHtml: renderEmailTemplate(draft?.bodyHtml ?? template.bodyHtml, variables),
    rawSubject: draft?.subject ?? template.subject,
    rawBodyHtml: draft?.bodyHtml ?? template.bodyHtml,
    label: template.label,
    placeholders: def?.placeholders ?? [],
  };
}

export async function getShootingReminderVariables(
  eventId: string,
  notes?: string,
  sampleParentName = "Max Mustermann",
) {
  await requireStaff();
  const event = await prisma.shootingEvent.findUniqueOrThrow({
    where: { id: eventId },
  });
  const dateStr = event.date.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const { buildNotesBlock, buildTimeLine } = await import("@/lib/email-templates");
  return {
    parentName: sampleParentName,
    eventTitle: event.title,
    date: dateStr,
    timeLine: buildTimeLine(event.startTime ?? undefined),
    location: event.location,
    notesBlock: buildNotesBlock(notes),
  };
}

export async function getEventCancelledVariables(
  eventId: string,
  reason?: string,
  sampleParentName = "Max Mustermann",
) {
  await requireStaff();
  const event = await prisma.shootingEvent.findUniqueOrThrow({
    where: { id: eventId },
  });
  const dateStr = event.date.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const { buildReasonBlock } = await import("@/lib/email-templates");
  return {
    parentName: sampleParentName,
    eventTitle: event.title,
    date: dateStr,
    reasonBlock: buildReasonBlock(reason),
  };
}

export async function getNewEventVariables(eventId: string) {
  await requireStaff();
  const event = await prisma.shootingEvent.findUniqueOrThrow({
    where: { id: eventId },
  });
  const { shootingTypeLabels } = await import("@/lib/shooting-types");
  const { buildLocationLine } = await import("@/lib/email-templates");
  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://aquafotos.com"}/shootings/${event.id}`;
  return {
    shootingType: shootingTypeLabels[event.shootingType],
    locationLine: buildLocationLine(event.location),
    eventTitle: event.title,
    eventUrl: url,
  };
}

export async function getParticipantConfirmationVariables(participantId: string) {
  await requireStaff();
  const participant = await prisma.participant.findUniqueOrThrow({
    where: { id: participantId },
    include: { event: true, galleryAccess: true, qrCode: true },
  });
  const { isCoupleShooting } = await import("@/lib/registration-fields");
  const {
    buildAccessCodeBlock,
    buildQrCodeBlock,
    buildTimeLine,
  } = await import("@/lib/email-templates");

  const accessCode = participant.galleryAccess?.accessCode;
  const galleryUrl = accessCode
    ? `${process.env.NEXT_PUBLIC_APP_URL ?? "https://aquafotos.com"}/bilder-bestellen?code=${encodeURIComponent(accessCode)}`
    : undefined;
  const dateStr = participant.event.date.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const coupleMode = isCoupleShooting(participant.event.category);

  return {
    templateKey:
      participant.registrationSource === "MANUAL"
        ? EMAIL_TEMPLATE_KEYS.REGISTRATION_INVITE
        : EMAIL_TEMPLATE_KEYS.REGISTRATION,
    variables: {
      parentName: participant.parentName,
      childName: participant.childName,
      eventTitle: participant.event.title,
      date: dateStr,
      timeLine: buildTimeLine(participant.event.startTime ?? undefined),
      location: participant.event.location,
      accessCodeBlock: buildAccessCodeBlock(accessCode, galleryUrl),
      qrCodeBlock:
        participant.registrationSource === "MANUAL"
          ? buildQrCodeBlock(
              participant.qrCode?.qrDataUrl,
              participant.participantNumber,
            )
          : "",
      greeting: coupleMode
        ? "Wir freuen uns auf euch!"
        : `Wir freuen uns auf ${participant.childName}!`,
    },
    recipientLabel: `${participant.childName} (${participant.email})`,
  };
}

export async function sendPreviewTestEmail(params: {
  to: string;
  subject: string;
  html: string;
}) {
  await requireStaff();
  if (!params.to.includes("@")) return { error: "Ungültige E-Mail." };
  const delivery = await sendRawEmail(params);
  const feedback = emailFeedbackFromDelivery(delivery);
  if (feedback.error) return { error: feedback.error };
  return {
    success: true,
    emailSent: feedback.emailSent,
    emailNotice: feedback.emailNotice,
  };
}
