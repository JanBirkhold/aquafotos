export const EMAIL_TEMPLATE_KEYS = {
  REGISTRATION: "registration",
  REGISTRATION_INVITE: "registration_invite",
  SHOOTING_REMINDER: "shooting_reminder",
  EVENT_CANCELLED: "event_cancelled",
  PHOTOS_READY: "photos_ready",
  NEW_EVENT: "new_event",
  ORDER_CONFIRMATION: "order_confirmation",
  ORDER_READY: "order_ready",
  VOUCHER_PURCHASE: "voucher_purchase",
  VOUCHER_ORDER_PENDING: "voucher_order_pending",
  VOUCHER_APPOINTMENT_CONFIRMED: "voucher_appointment_confirmed",
  VOUCHER_APPOINTMENT_CHANGED: "voucher_appointment_changed",
  VOUCHER_APPOINTMENT_CANCELLED: "voucher_appointment_cancelled",
} as const;

export type EmailTemplateKey =
  (typeof EMAIL_TEMPLATE_KEYS)[keyof typeof EMAIL_TEMPLATE_KEYS];

export type EmailTemplateDefinition = {
  key: EmailTemplateKey;
  label: string;
  description: string;
  subject: string;
  bodyHtml: string;
  placeholders: string[];
};

export const EMAIL_TEMPLATE_DEFINITIONS: EmailTemplateDefinition[] = [
  {
    key: EMAIL_TEMPLATE_KEYS.REGISTRATION,
    label: "Anmeldungsbestätigung (Website)",
    description: "Wird nach Online-Anmeldung automatisch versendet.",
    subject: "Vielen Dank für Ihre Anmeldung – AquaFotos",
    placeholders: [
      "parentName",
      "childName",
      "eventTitle",
      "date",
      "timeLine",
      "location",
      "accessCodeBlock",
      "greeting",
    ],
    bodyHtml: `<p>Hallo {{parentName}},</p>
<p>vielen Dank für Ihre Anmeldung zum Shooting <strong>{{eventTitle}}</strong>.</p>
<p><strong>Datum:</strong> {{date}}{{timeLine}}<br>
<strong>Ort:</strong> {{location}}</p>
{{accessCodeBlock}}
<p>{{greeting}}</p>
<p>Ihr AquaFotos Team</p>`,
  },
  {
    key: EMAIL_TEMPLATE_KEYS.REGISTRATION_INVITE,
    label: "Einladung (manuell eingetragen)",
    description: "Wird versendet, wenn Admin einen Teilnehmer manuell anlegt.",
    subject: "Einladung: {{eventTitle}} – AquaFotos",
    placeholders: [
      "parentName",
      "childName",
      "eventTitle",
      "date",
      "timeLine",
      "location",
      "accessCodeBlock",
      "qrCodeBlock",
      "greeting",
    ],
    bodyHtml: `<p>Hallo {{parentName}},</p>
<p>Sie wurden zum Shooting <strong>{{eventTitle}}</strong> eingetragen.</p>
<p><strong>Datum:</strong> {{date}}{{timeLine}}<br>
<strong>Ort:</strong> {{location}}</p>
{{accessCodeBlock}}
{{qrCodeBlock}}
<p>{{greeting}}</p>
<p>Ihr AquaFotos Team</p>`,
  },
  {
    key: EMAIL_TEMPLATE_KEYS.SHOOTING_REMINDER,
    label: "Shooting-Erinnerung",
    description: "Manuell an alle Teilnehmer eines Shootings.",
    subject: "Erinnerung: Ihr AquaFotos Shooting steht bevor",
    placeholders: [
      "parentName",
      "eventTitle",
      "date",
      "timeLine",
      "location",
      "notesBlock",
    ],
    bodyHtml: `<p>Hallo {{parentName}},</p>
<p>bald ist es soweit – Ihr Shooting <strong>{{eventTitle}}</strong>.</p>
<p><strong>Datum:</strong> {{date}}{{timeLine}}<br>
<strong>Ort:</strong> {{location}}</p>
{{notesBlock}}
<p>Bis bald!<br>Ihr AquaFotos Team</p>`,
  },
  {
    key: EMAIL_TEMPLATE_KEYS.EVENT_CANCELLED,
    label: "Shooting-Absage",
    description: "Wird an alle Teilnehmer bei Absage gesendet.",
    subject: "Shooting abgesagt – AquaFotos",
    placeholders: ["parentName", "eventTitle", "date", "reasonBlock"],
    bodyHtml: `<p>Hallo {{parentName}},</p>
<p>leider müssen wir das Shooting <strong>{{eventTitle}}</strong> am {{date}} absagen.</p>
{{reasonBlock}}
<p>Wir melden uns bei Ihnen, sobald ein Ersatztermin verfügbar ist.</p>
<p>Ihr AquaFotos Team</p>`,
  },
  {
    key: EMAIL_TEMPLATE_KEYS.PHOTOS_READY,
    label: "Galerie bereit",
    description: "Teilnehmer können ihre Bilder ansehen und bestellen.",
    subject: "Ihre Bilder stehen bereit – AquaFotos",
    placeholders: ["parentName", "galleryLinkBlock", "galleryAccessGuideBlock"],
    bodyHtml: `<p>Hallo {{parentName}},</p>
<p>Ihre Bilder stehen bereit! Sie können sie jetzt in Ihrer Galerie ansehen und bestellen.</p>
{{galleryLinkBlock}}
{{galleryAccessGuideBlock}}
<p>Ihr AquaFotos Team</p>`,
  },
  {
    key: EMAIL_TEMPLATE_KEYS.NEW_EVENT,
    label: "Neuer Termin (Abonnenten)",
    description: "Beim Veröffentlichen eines Shootings an Interessenten.",
    subject: "Neuer Shooting-Termin bei AquaFotos",
    placeholders: ["shootingType", "locationLine", "eventTitle", "eventUrl"],
    bodyHtml: `<p>Gute Nachrichten!</p>
<p>Es gibt einen neuen Termin für <strong>{{shootingType}}</strong>{{locationLine}}.</p>
<p><strong>{{eventTitle}}</strong></p>
<p><a href="{{eventUrl}}">Jetzt Termin ansehen und anmelden</a></p>
<p>Ihr AquaFotos Team</p>`,
  },
  {
    key: EMAIL_TEMPLATE_KEYS.ORDER_CONFIRMATION,
    label: "Bestellbestätigung",
    description: "Nach Bestellung – Rechnung im Anhang, Überweisung ausstehend.",
    subject: "Bestellung {{orderNumber}} – Rechnung & Überweisung",
    placeholders: [
      "orderNumber",
      "total",
      "orderFlowBlock",
      "orderItemsBlock",
      "bankTransferBlock",
      "orderStatusLink",
    ],
    bodyHtml: `<p>Vielen Dank für Ihre Bestellung!</p>
<p><strong>Bestellnummer:</strong> {{orderNumber}}<br>
<strong>Gesamtbetrag:</strong> {{total}}</p>
{{orderItemsBlock}}
{{bankTransferBlock}}
<p>Die Rechnung finden Sie im <strong>Anhang dieser E-Mail</strong> (PDF).</p>
{{orderFlowBlock}}
<p>Sobald Ihre Überweisung bei uns eingegangen ist, beginnen wir mit der Bearbeitung Ihrer Bilder.</p>
<p><a href="{{orderStatusLink}}">Bestellstatus online ansehen</a></p>
<p>Ihr AquaFotos Team</p>`,
  },
  {
    key: EMAIL_TEMPLATE_KEYS.ORDER_READY,
    label: "Bestellung fertig (Download)",
    description: "Manuell aus dem Admin, wenn alle Bilder bearbeitet sind.",
    subject: "Ihre Bilder sind fertig – Bestellung {{orderNumber}}",
    placeholders: [
      "parentName",
      "orderNumber",
      "downloadBlock",
      "orderStatusLink",
      "orderFlowBlock",
    ],
    bodyHtml: `<p>Hallo {{parentName}},</p>
<p>gute Nachrichten – Ihre bestellten Bilder sind fertig bearbeitet!</p>
<p><strong>Bestellnummer:</strong> {{orderNumber}}</p>
{{orderFlowBlock}}
{{downloadBlock}}
<p><a href="{{orderStatusLink}}">Bestellstatus online ansehen</a></p>
<p>Ihr AquaFotos Team</p>`,
  },
  {
    key: EMAIL_TEMPLATE_KEYS.VOUCHER_PURCHASE,
    label: "Gutschein-Kauf",
    description: "Nach erfolgreichem Gutscheinkauf mit Code und QR.",
    subject: "Ihr AquaFotos Gutschein – {{purchaseNumber}}",
    placeholders: [
      "buyerName",
      "purchaseNumber",
      "total",
      "voucherListBlock",
      "redeemGuideBlock",
    ],
    bodyHtml: `<p>Hallo {{buyerName}},</p>
<p>vielen Dank für Ihren Gutscheinkauf!</p>
<p><strong>Kaufnummer:</strong> {{purchaseNumber}}<br>
<strong>Gesamtbetrag:</strong> {{total}}</p>
{{voucherListBlock}}
{{redeemGuideBlock}}
<p>Ihr AquaFotos Team</p>`,
  },
  {
    key: EMAIL_TEMPLATE_KEYS.VOUCHER_ORDER_PENDING,
    label: "Gutschein-Bestellung (Überweisung ausstehend)",
    description: "Nach Bestellung – Zahlungsdaten, noch ohne Code/QR.",
    subject: "Gutschein-Bestellung {{purchaseNumber}} – Überweisung ausstehend",
    placeholders: [
      "buyerName",
      "purchaseNumber",
      "total",
      "bankTransferBlock",
      "orderItemsBlock",
    ],
    bodyHtml: `<p>Hallo {{buyerName}},</p>
<p>vielen Dank für Ihre Gutschein-Bestellung!</p>
<p><strong>Kaufnummer:</strong> {{purchaseNumber}}<br>
<strong>Gesamtbetrag:</strong> {{total}}</p>
{{orderItemsBlock}}
{{bankTransferBlock}}
<p>Die Rechnung finden Sie im <strong>Anhang dieser E-Mail</strong> (PDF).</p>
<p>Sobald Ihre Überweisung bei uns eingegangen ist, senden wir Ihnen die Gutschein-Codes und QR-Codes per E-Mail.</p>
<p>Ihr AquaFotos Team</p>`,
  },
  {
    key: EMAIL_TEMPLATE_KEYS.VOUCHER_APPOINTMENT_CONFIRMED,
    label: "Gutschein-Termin bestätigt",
    description:
      "Nach Admin-Bestätigung einer Gutschein-Terminanfrage an den Einlöser.",
    subject: "Ihr Shooting-Termin ist bestätigt – AquaFotos",
    placeholders: [
      "parentName",
      "productTitle",
      "shootingTypeLabel",
      "confirmedDate",
      "timeLine",
      "location",
      "childLine",
      "phoneDisplay",
      "contactLink",
      "voucherStatusLink",
    ],
    bodyHtml: `<p>Hallo {{parentName}},</p>
<p>Ihr Termin für das Gutschein-Shooting <strong>{{productTitle}}</strong> ist bestätigt!</p>
<p><strong>Art:</strong> {{shootingTypeLabel}}<br>
<strong>Datum:</strong> {{confirmedDate}}{{timeLine}}<br>
<strong>Ort:</strong> {{location}}</p>
<p>Wir freuen uns auf {{childLine}}!</p>
<p>Bei Fragen erreichen Sie uns unter {{phoneDisplay}} oder über <a href="{{contactLink}}">Kontakt</a>.</p>
<p>Ihr AquaFotos Team</p>`,
  },
  {
    key: EMAIL_TEMPLATE_KEYS.VOUCHER_APPOINTMENT_CHANGED,
    label: "Gutschein-Termin geändert",
    description: "Benachrichtigung bei Terminverschiebung nach bestätigtem Gutschein-Shooting.",
    subject: "Ihr Shooting-Termin wurde geändert – AquaFotos",
    placeholders: [
      "parentName",
      "productTitle",
      "shootingTypeLabel",
      "previousDate",
      "previousTimeLine",
      "previousLocation",
      "confirmedDate",
      "timeLine",
      "location",
      "noteBlock",
      "childLine",
      "phoneDisplay",
      "contactLink",
      "voucherStatusLink",
    ],
    bodyHtml: `<p>Hallo {{parentName}},</p>
<p>Ihr Termin für das Gutschein-Shooting <strong>{{productTitle}}</strong> wurde geändert.</p>
<p><strong>Bisheriger Termin:</strong><br>
{{previousDate}}{{previousTimeLine}}<br>
{{previousLocation}}</p>
<p><strong>Neuer Termin:</strong><br>
<strong>Art:</strong> {{shootingTypeLabel}}<br>
<strong>Datum:</strong> {{confirmedDate}}{{timeLine}}<br>
<strong>Ort:</strong> {{location}}</p>
{{noteBlock}}
<p>Wir freuen uns auf {{childLine}}!</p>
<p>Bei Fragen erreichen Sie uns unter {{phoneDisplay}} oder über <a href="{{contactLink}}">Kontakt</a>.</p>
<p>Ihr AquaFotos Team</p>`,
  },
  {
    key: EMAIL_TEMPLATE_KEYS.VOUCHER_APPOINTMENT_CANCELLED,
    label: "Gutschein-Termin abgesagt",
    description: "Benachrichtigung wenn ein bestätigter Shooting-Termin abgesagt wurde.",
    subject: "Ihr Shooting-Termin wurde abgesagt – AquaFotos",
    placeholders: [
      "parentName",
      "productTitle",
      "shootingTypeLabel",
      "previousDate",
      "previousTimeLine",
      "previousLocation",
      "reasonBlock",
      "childLine",
      "phoneDisplay",
      "contactLink",
      "voucherStatusLink",
    ],
    bodyHtml: `<p>Hallo {{parentName}},</p>
<p>leider müssen wir Ihren Termin für das Shooting <strong>{{productTitle}}</strong> absagen.</p>
<p><strong>Abgesagter Termin:</strong><br>
{{previousDate}}{{previousTimeLine}}<br>
{{previousLocation}}</p>
{{reasonBlock}}
<p>Bitte melden Sie sich bei uns – wir finden gemeinsam einen neuen Termin.</p>
<p>Bei Fragen erreichen Sie uns unter {{phoneDisplay}} oder über <a href="{{contactLink}}">Kontakt</a>.</p>
<p>Ihr AquaFotos Team</p>`,
  },
];

export function getTemplateDefinition(key: string): EmailTemplateDefinition | undefined {
  return EMAIL_TEMPLATE_DEFINITIONS.find((t) => t.key === key);
}

export function renderEmailTemplate(
  template: string,
  variables: Record<string, string>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, name: string) => variables[name] ?? "");
}
