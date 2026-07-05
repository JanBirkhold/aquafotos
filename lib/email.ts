import { Resend } from "resend";
import type { EmailDeliveryResult } from "@/lib/email-delivery";
import { EMAIL_TEMPLATE_KEYS } from "@/lib/email-template-definitions";
import {
  buildAccessCodeBlock,
  buildGalleryAccessGuideBlock,
  buildGalleryLinkBlock,
  buildLocationLine,
  buildNotesBlock,
  buildOrderDownloadBlock,
  buildOrderFlowBlock,
  buildOrderItemsBlock,
  buildQrCodeBlock,
  buildReasonBlock,
  buildTimeLine,
  buildVoucherListBlock,
  buildVoucherOrderItemsBlock,
  buildVoucherRedeemGuideBlock,
  buildBankTransferBlock,
  renderStoredEmail,
} from "@/lib/email-templates";
import { invoiceFilename } from "@/lib/invoice-filename";
import { buildCalendarAttachment } from "@/lib/calendar-export";
import {
  buildVoucherStatusOverviewEmailBlock,
  getVoucherSuccessUrl,
} from "@/lib/voucher-links";
import { getBankTransferDetails } from "@/lib/voucher-payment";
import { siteConfig } from "@/lib/site-config";

const CALENDAR_ATTACHMENT_NOTE =
  '<p style="font-size:0.9em;color:#64748b">Im Anhang finden Sie eine Kalenderdatei (.ics), die Sie in Google Kalender, Outlook oder Apple Kalender importieren können.</p>';

function buildVoucherAppointmentCalendarAttachment(params: {
  productTitle: string;
  voucherCode?: string;
  confirmedDateIso: string;
  confirmedTime?: string | null;
  confirmedLocation: string;
  parentName?: string;
}) {
  return buildCalendarAttachment({
    title: `${siteConfig.name} – ${params.productTitle}`,
    description: params.voucherCode
      ? `Gutschein ${params.voucherCode}${params.parentName ? ` · ${params.parentName}` : ""} · ${siteConfig.phoneDisplay}`
      : `${siteConfig.name} Shooting · ${siteConfig.phoneDisplay}`,
    date: params.confirmedDateIso,
    time: params.confirmedTime,
    location: params.confirmedLocation,
    uid: params.voucherCode
      ? `aquafotos-voucher-${params.voucherCode}@${siteConfig.emailDomain}`
      : undefined,
  });
}

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.EMAIL_FROM ?? "AquaFotos <noreply@aquafotos.com>";

export async function sendRawEmail(params: {
  to: string;
  subject: string;
  html: string;
  attachments?: { filename: string; content: Uint8Array | Buffer }[];
}): Promise<EmailDeliveryResult> {
  if (!resend) {
    console.info("[email stub]", params.subject, "→", params.to);
    if (params.attachments?.length) {
      console.info("[email stub attachment]", params.attachments.map((a) => a.filename).join(", "));
    }
    return { sent: false, configured: false };
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: params.subject,
      html: params.html,
      attachments: params.attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: Buffer.from(attachment.content).toString("base64"),
      })),
    });

    if (error) {
      console.error("[email failed]", error);
      return { sent: false, configured: true, error: error.message };
    }

    return { sent: true, configured: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    console.error("[email failed]", error);
    return { sent: false, configured: true, error: message };
  }
}

export async function sendTemplatedEmail(params: {
  to: string;
  templateKey: string;
  variables: Record<string, string>;
  overrides?: { subject?: string; bodyHtml?: string };
  attachments?: { filename: string; content: Uint8Array | Buffer }[];
}) {
  const { subject, html } = await renderStoredEmail(
    params.templateKey,
    params.variables,
    params.overrides,
  );
  return sendRawEmail({
    to: params.to,
    subject,
    html,
    attachments: params.attachments,
  });
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
  items: { label: string; price: string }[];
  invoicePdf: Uint8Array;
  voucherIncluded?: boolean;
  overrides?: { subject?: string; bodyHtml?: string };
}) {
  const bank = getBankTransferDetails();

  const bankTransferBlock = params.voucherIncluded
    ? `<p style="margin:0;padding:16px;background:#ecfdf5;border-radius:8px;color:#065f46;">
        Ihre Bildauswahl ist im Gutschein enthalten – es ist keine weitere Zahlung nötig.
        Wir beginnen mit der Bearbeitung Ihrer Fotos.
      </p>`
    : buildBankTransferBlock({
        accountHolder: bank.accountHolder,
        bankName: bank.bankName,
        iban: bank.iban,
        bic: bank.bic,
        amount: params.total,
        reference: params.orderNumber,
      });

  return sendTemplatedEmail({
    to: params.to,
    templateKey: EMAIL_TEMPLATE_KEYS.ORDER_CONFIRMATION,
    variables: {
      orderNumber: params.orderNumber,
      total: params.total,
      orderFlowBlock: buildOrderFlowBlock(),
      orderStatusLink: params.orderStatusLink ?? "",
      orderItemsBlock: buildOrderItemsBlock(params.items),
      bankTransferBlock,
    },
    overrides: params.overrides,
    attachments: [
      {
        filename: invoiceFilename(params.orderNumber),
        content: params.invoicePdf,
      },
    ],
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

export async function sendVoucherPurchaseEmail(params: {
  to: string;
  buyerName: string;
  purchaseNumber: string;
  total: string;
  vouchers: {
    code: string;
    title: string;
    preferredDate: string;
    qrDataUrl: string | null;
    redeemUrl: string;
  }[];
  overrides?: { subject?: string; bodyHtml?: string };
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://aquafotos.com";
  return sendTemplatedEmail({
    to: params.to,
    templateKey: EMAIL_TEMPLATE_KEYS.VOUCHER_PURCHASE,
    variables: {
      buyerName: params.buyerName,
      purchaseNumber: params.purchaseNumber,
      total: params.total,
      voucherListBlock: buildVoucherListBlock(params.vouchers),
      redeemGuideBlock: buildVoucherRedeemGuideBlock(`${appUrl}/gutschein/einloesen`),
    },
    overrides: params.overrides,
  });
}

export async function sendVoucherOrderPendingEmail(params: {
  to: string;
  buyerName: string;
  purchaseNumber: string;
  total: string;
  items: { title: string; price: string; preferredDate?: string }[];
  invoicePdf?: Uint8Array;
}) {
  const bank = getBankTransferDetails();
  return sendTemplatedEmail({
    to: params.to,
    templateKey: EMAIL_TEMPLATE_KEYS.VOUCHER_ORDER_PENDING,
    variables: {
      buyerName: params.buyerName,
      purchaseNumber: params.purchaseNumber,
      total: params.total,
      bankTransferBlock: buildBankTransferBlock({
        accountHolder: bank.accountHolder,
        bankName: bank.bankName,
        iban: bank.iban,
        bic: bank.bic,
        amount: params.total,
        reference: params.purchaseNumber,
      }),
      orderItemsBlock: buildVoucherOrderItemsBlock(params.items),
    },
    attachments: params.invoicePdf
      ? [
          {
            filename: invoiceFilename(params.purchaseNumber),
            content: params.invoicePdf,
          },
        ]
      : undefined,
  });
}

export async function sendVoucherAppointmentConfirmedEmail(params: {
  to: string;
  parentName: string;
  childName: string | null;
  productTitle: string;
  shootingTypeLabel: string;
  confirmedDate: string;
  confirmedDateIso: string;
  confirmedTime?: string;
  confirmedLocation: string;
  contactLink: string;
  purchaseNumber: string;
  voucherCode?: string;
  overrides?: { subject?: string; bodyHtml?: string };
}) {
  const voucherStatusLink = getVoucherSuccessUrl(params.purchaseNumber);
  const { subject, html } = await renderStoredEmail(
    EMAIL_TEMPLATE_KEYS.VOUCHER_APPOINTMENT_CONFIRMED,
    {
      parentName: params.parentName,
      productTitle: params.productTitle,
      shootingTypeLabel: params.shootingTypeLabel,
      confirmedDate: params.confirmedDate,
      timeLine: buildTimeLine(params.confirmedTime),
      location: params.confirmedLocation,
      childLine: params.childName?.trim() ? params.childName.trim() : "Sie",
      phoneDisplay: siteConfig.phoneDisplay,
      contactLink: params.contactLink,
      voucherStatusLink,
    },
    params.overrides,
  );

  const calendar = buildVoucherAppointmentCalendarAttachment({
    productTitle: params.productTitle,
    voucherCode: params.voucherCode,
    confirmedDateIso: params.confirmedDateIso,
    confirmedTime: params.confirmedTime,
    confirmedLocation: params.confirmedLocation,
    parentName: params.parentName,
  });

  return sendRawEmail({
    to: params.to,
    subject,
    html: `${html}${buildVoucherStatusOverviewEmailBlock(params.purchaseNumber)}${CALENDAR_ATTACHMENT_NOTE}`,
    attachments: [calendar],
  });
}

export async function sendVoucherAppointmentChangedEmail(params: {
  to: string;
  parentName: string;
  childName: string | null;
  productTitle: string;
  shootingTypeLabel: string;
  previousDate: string;
  previousTime?: string;
  previousLocation: string;
  confirmedDate: string;
  confirmedDateIso: string;
  confirmedTime?: string;
  confirmedLocation: string;
  notifyMessage?: string;
  contactLink: string;
  purchaseNumber: string;
  voucherCode?: string;
  overrides?: { subject?: string; bodyHtml?: string };
}) {
  const voucherStatusLink = getVoucherSuccessUrl(params.purchaseNumber);
  const { subject, html } = await renderStoredEmail(
    EMAIL_TEMPLATE_KEYS.VOUCHER_APPOINTMENT_CHANGED,
    {
      parentName: params.parentName,
      productTitle: params.productTitle,
      shootingTypeLabel: params.shootingTypeLabel,
      previousDate: params.previousDate,
      previousTimeLine: buildTimeLine(params.previousTime),
      previousLocation: params.previousLocation,
      confirmedDate: params.confirmedDate,
      timeLine: buildTimeLine(params.confirmedTime),
      location: params.confirmedLocation,
      noteBlock: buildNotesBlock(params.notifyMessage),
      childLine: params.childName?.trim() ? params.childName.trim() : "Sie",
      phoneDisplay: siteConfig.phoneDisplay,
      contactLink: params.contactLink,
      voucherStatusLink,
    },
    params.overrides,
  );

  const calendar = buildVoucherAppointmentCalendarAttachment({
    productTitle: params.productTitle,
    voucherCode: params.voucherCode,
    confirmedDateIso: params.confirmedDateIso,
    confirmedTime: params.confirmedTime,
    confirmedLocation: params.confirmedLocation,
    parentName: params.parentName,
  });

  return sendRawEmail({
    to: params.to,
    subject,
    html: `${html}${buildVoucherStatusOverviewEmailBlock(params.purchaseNumber)}${CALENDAR_ATTACHMENT_NOTE}`,
    attachments: [calendar],
  });
}

export async function sendVoucherAppointmentCancelledEmail(params: {
  to: string;
  parentName: string;
  childName: string | null;
  productTitle: string;
  shootingTypeLabel: string;
  previousDate: string;
  previousTime?: string;
  previousLocation: string;
  reason?: string;
  contactLink: string;
  purchaseNumber: string;
  voucherCode?: string;
  overrides?: { subject?: string; bodyHtml?: string };
}) {
  const voucherStatusLink = getVoucherSuccessUrl(params.purchaseNumber);
  const { subject, html } = await renderStoredEmail(
    EMAIL_TEMPLATE_KEYS.VOUCHER_APPOINTMENT_CANCELLED,
    {
      parentName: params.parentName,
      productTitle: params.productTitle,
      shootingTypeLabel: params.shootingTypeLabel,
      previousDate: params.previousDate,
      previousTimeLine: buildTimeLine(params.previousTime),
      previousLocation: params.previousLocation,
      reasonBlock: buildNotesBlock(params.reason),
      childLine: params.childName?.trim() ? params.childName.trim() : "Sie",
      phoneDisplay: siteConfig.phoneDisplay,
      contactLink: params.contactLink,
      voucherStatusLink,
    },
    params.overrides,
  );

  const statusBlock = params.purchaseNumber
    ? buildVoucherStatusOverviewEmailBlock(params.purchaseNumber)
    : "";

  return sendRawEmail({
    to: params.to,
    subject,
    html: `${html}${statusBlock}`,
  });
}

export async function sendVoucherInvoiceEmailMessage(params: {
  to: string;
  buyerName: string;
  purchaseNumber: string;
  total: string;
  invoicePdf: Uint8Array;
}) {
  return sendRawEmail({
    to: params.to,
    subject: `Ihre Rechnung – Gutschein ${params.purchaseNumber}`,
    html: `<p>Hallo ${params.buyerName},</p>
<p>anbei finden Sie Ihre Rechnung zur Gutschein-Bestellung <strong>${params.purchaseNumber}</strong>.</p>
<p><strong>Gesamtbetrag:</strong> ${params.total}</p>
<p>Bei Fragen erreichen Sie uns unter ${siteConfig.phoneDisplay}.</p>
<p>Ihr AquaFotos Team</p>`,
    attachments: [
      {
        filename: invoiceFilename(params.purchaseNumber),
        content: params.invoicePdf,
      },
    ],
  });
}

export async function sendOrderInvoiceEmailMessage(params: {
  to: string;
  parentName: string;
  orderNumber: string;
  total: string;
  invoicePdf: Uint8Array;
}) {
  return sendRawEmail({
    to: params.to,
    subject: `Ihre Rechnung – Bestellung ${params.orderNumber}`,
    html: `<p>Hallo ${params.parentName},</p>
<p>anbei finden Sie Ihre Rechnung zur Foto-Bestellung <strong>${params.orderNumber}</strong>.</p>
<p><strong>Gesamtbetrag:</strong> ${params.total}</p>
<p>Bei Fragen erreichen Sie uns unter ${siteConfig.phoneDisplay}.</p>
<p>Ihr AquaFotos Team</p>`,
    attachments: [
      {
        filename: invoiceFilename(params.orderNumber),
        content: params.invoicePdf,
      },
    ],
  });
}

export async function sendPartnerInquiryEmail(params: {
  company: string;
  location: string;
  email: string;
}) {
  const inbox = `${process.env.PARTNER_INQUIRY_EMAIL ?? "annika@aquafotos.com"}`;
  const subject = `Partner-Anfrage: ${params.company} (${params.location})`;
  const html = `<p><strong>Neue Partner-Anfrage</strong></p>
<p><strong>Unternehmen:</strong> ${params.company}<br>
<strong>Ort:</strong> ${params.location}<br>
<strong>E-Mail:</strong> <a href="mailto:${params.email}">${params.email}</a></p>
<p>Bitte innerhalb von 2 Werktagen antworten.</p>`;

  return sendRawEmail({ to: inbox, subject, html });
}
