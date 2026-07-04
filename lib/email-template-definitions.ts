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
    description: "Direkt nach erfolgreicher Bestellung im Shop.",
    subject: "Bestellbestätigung {{orderNumber}} – AquaFotos",
    placeholders: ["orderNumber", "total", "orderFlowBlock"],
    bodyHtml: `<p>Vielen Dank für Ihre Bestellung!</p>
<p><strong>Bestellnummer:</strong> {{orderNumber}}<br>
<strong>Gesamtbetrag:</strong> {{total}}</p>
{{orderFlowBlock}}
<p>Wir beginnen mit der Bearbeitung Ihrer Bilder.</p>
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
