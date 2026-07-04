import { Resend } from "resend";
import { EMAIL_TEMPLATE_KEYS } from "@/lib/email-template-definitions";
import {
  buildAccessCodeBlock,
  buildGalleryAccessGuideBlock,
  buildGalleryLinkBlock,
  buildLocationLine,
  buildNotesBlock,
  buildOrderDownloadBlock,
  buildOrderFlowBlock,
  buildQrCodeBlock,
  buildReasonBlock,
  buildTimeLine,
  renderStoredEmail,
} from "@/lib/email-templates";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.EMAIL_FROM ?? "AquaFotos <noreply@aquafotos.com>";

export async function sendRawEmail(params: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!resend) {
    console.info("[email stub]", params.subject, "→", params.to);
    return { ok: true };
  }

  await resend.emails.send({
    from: FROM,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });

  return { ok: true };
}

export async function sendTemplatedEmail(params: {
  to: string;
  templateKey: string;
  variables: Record<string, string>;
  overrides?: { subject?: string; bodyHtml?: string };
}) {
  const { subject, html } = await renderStoredEmail(
    params.templateKey,
    params.variables,
    params.overrides,
  );
  return sendRawEmail({ to: params.to, subject, html });
}

export async function sendRegistrationConfirmation(params: {
  to: string;
  parentName: string;
  childName: string;
  eventTitle: string;
  date: string;
  time?: string;
  location: string;
  coupleMode?: boolean;
  accessCode?: string;
  galleryUrl?: string;
  qrDataUrl?: string | null;
  participantNumber?: number;
  isInvitation?: boolean;
  overrides?: { subject?: string; bodyHtml?: string };
}) {
  const greeting = params.coupleMode
    ? "Wir freuen uns auf euch!"
    : `Wir freuen uns auf ${params.childName}!`;

  return sendTemplatedEmail({
    to: params.to,
    templateKey: params.isInvitation
      ? EMAIL_TEMPLATE_KEYS.REGISTRATION_INVITE
      : EMAIL_TEMPLATE_KEYS.REGISTRATION,
    variables: {
      parentName: params.parentName,
      childName: params.childName,
      eventTitle: params.eventTitle,
      date: params.date,
      timeLine: buildTimeLine(params.time),
      location: params.location,
      accessCodeBlock: buildAccessCodeBlock(params.accessCode, params.galleryUrl),
      qrCodeBlock: params.isInvitation
        ? buildQrCodeBlock(params.qrDataUrl, params.participantNumber)
        : "",
      greeting,
    },
    overrides: params.overrides,
  });
}

export async function sendShootingReminder(params: {
  to: string;
  parentName: string;
  eventTitle: string;
  date: string;
  time?: string;
  location: string;
  notes?: string;
  overrides?: { subject?: string; bodyHtml?: string };
}) {
  return sendTemplatedEmail({
    to: params.to,
    templateKey: EMAIL_TEMPLATE_KEYS.SHOOTING_REMINDER,
    variables: {
      parentName: params.parentName,
      eventTitle: params.eventTitle,
      date: params.date,
      timeLine: buildTimeLine(params.time),
      location: params.location,
      notesBlock: buildNotesBlock(params.notes),
    },
    overrides: params.overrides,
  });
}

export async function sendNewEventNotification(params: {
  to: string;
  shootingType: string;
  location: string;
  eventTitle: string;
  url: string;
  overrides?: { subject?: string; bodyHtml?: string };
}) {
  return sendTemplatedEmail({
    to: params.to,
    templateKey: EMAIL_TEMPLATE_KEYS.NEW_EVENT,
    variables: {
      shootingType: params.shootingType,
      locationLine: buildLocationLine(params.location),
      eventTitle: params.eventTitle,
      eventUrl: params.url,
    },
    overrides: params.overrides,
  });
}

export async function sendPhotosReady(params: {
  to: string;
  parentName: string;
  galleryUrl: string;
  overrides?: { subject?: string; bodyHtml?: string };
}) {
  return sendTemplatedEmail({
    to: params.to,
    templateKey: EMAIL_TEMPLATE_KEYS.PHOTOS_READY,
    variables: {
      parentName: params.parentName,
      galleryLinkBlock: buildGalleryLinkBlock(params.galleryUrl),
      galleryAccessGuideBlock: buildGalleryAccessGuideBlock(params.galleryUrl),
    },
    overrides: params.overrides,
  });
}

export async function sendEventCancelled(params: {
  to: string;
  parentName: string;
  eventTitle: string;
  date: string;
  reason?: string;
  overrides?: { subject?: string; bodyHtml?: string };
}) {
  return sendTemplatedEmail({
    to: params.to,
    templateKey: EMAIL_TEMPLATE_KEYS.EVENT_CANCELLED,
    variables: {
      parentName: params.parentName,
      eventTitle: params.eventTitle,
      date: params.date,
      reasonBlock: buildReasonBlock(params.reason),
    },
    overrides: params.overrides,
  });
}

export async function sendOrderConfirmation(params: {
  to: string;
  orderNumber: string;
  total: string;
  orderStatusLink?: string;
  overrides?: { subject?: string; bodyHtml?: string };
}) {
  return sendTemplatedEmail({
    to: params.to,
    templateKey: EMAIL_TEMPLATE_KEYS.ORDER_CONFIRMATION,
    variables: {
      orderNumber: params.orderNumber,
      total: params.total,
      orderFlowBlock: buildOrderFlowBlock(),
    },
    overrides: params.overrides,
  });
}

export async function sendOrderReadyEmail(params: {
  to: string;
  parentName: string;
  orderNumber: string;
  orderStatusLink: string;
  downloadItems: { filename: string; downloadUrl: string }[];
  overrides?: { subject?: string; bodyHtml?: string };
}) {
  return sendTemplatedEmail({
    to: params.to,
    templateKey: EMAIL_TEMPLATE_KEYS.ORDER_READY,
    variables: {
      parentName: params.parentName,
      orderNumber: params.orderNumber,
      orderFlowBlock: buildOrderFlowBlock(),
      downloadBlock: buildOrderDownloadBlock(params.downloadItems),
      orderStatusLink: params.orderStatusLink,
    },
    overrides: params.overrides,
  });
}
