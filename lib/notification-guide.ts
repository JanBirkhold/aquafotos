import { EMAIL_TEMPLATE_KEYS, type EmailTemplateKey } from "@/lib/email-template-definitions";

export type NotificationCategoryId = "termin" | "galerie" | "bestellung";

export type NotificationCategory = {
  id: NotificationCategoryId;
  label: string;
  description: string;
  templateKeys: EmailTemplateKey[];
};

export const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  {
    id: "termin",
    label: "Termin & Anmeldung",
    description: "Shooting-Anmeldung, Einladungen, Erinnerungen, Absagen, neue Termine",
    templateKeys: [
      EMAIL_TEMPLATE_KEYS.REGISTRATION,
      EMAIL_TEMPLATE_KEYS.REGISTRATION_INVITE,
      EMAIL_TEMPLATE_KEYS.SHOOTING_REMINDER,
      EMAIL_TEMPLATE_KEYS.EVENT_CANCELLED,
      EMAIL_TEMPLATE_KEYS.NEW_EVENT,
      EMAIL_TEMPLATE_KEYS.VOUCHER_APPOINTMENT_CONFIRMED,
      EMAIL_TEMPLATE_KEYS.VOUCHER_APPOINTMENT_CHANGED,
      EMAIL_TEMPLATE_KEYS.VOUCHER_APPOINTMENT_CANCELLED,
    ],
  },
  {
    id: "galerie",
    label: "Galerie & Zugang",
    description: "Zugangscode, E-Mail-Login, Galerie-Link, QR-Zuordnung",
    templateKeys: [
      EMAIL_TEMPLATE_KEYS.REGISTRATION,
      EMAIL_TEMPLATE_KEYS.REGISTRATION_INVITE,
      EMAIL_TEMPLATE_KEYS.PHOTOS_READY,
    ],
  },
  {
    id: "bestellung",
    label: "Shop & Bestellung",
    description: "Warenkorb, Checkout, Bestellbestätigung",
    templateKeys: [
      EMAIL_TEMPLATE_KEYS.PHOTOS_READY,
      EMAIL_TEMPLATE_KEYS.ORDER_CONFIRMATION,
      EMAIL_TEMPLATE_KEYS.ORDER_READY,
    ],
  },
];

export function getCategoryForTemplate(key: string): NotificationCategoryId {
  for (const cat of NOTIFICATION_CATEGORIES) {
    if (cat.templateKeys.includes(key as EmailTemplateKey)) {
      return cat.id;
    }
  }
  return "termin";
}

export function templatesByCategory(
  templates: { key: string; label: string }[],
): Map<NotificationCategoryId, { key: string; label: string }[]> {
  const map = new Map<NotificationCategoryId, { key: string; label: string }[]>();
  for (const cat of NOTIFICATION_CATEGORIES) {
    map.set(
      cat.id,
      templates.filter((t) => cat.templateKeys.includes(t.key as EmailTemplateKey)),
    );
  }
  return map;
}

export type FlowGuideLink = {
  href: string;
  label: string;
  external?: boolean;
};

export type FlowGuideSection = {
  id: NotificationCategoryId | "qr";
  title: string;
  summary: string;
  steps: string[];
  links: FlowGuideLink[];
  tips?: string[];
};

export const NOTIFICATION_FLOW_GUIDES: FlowGuideSection[] = [
  {
    id: "termin",
    title: "Termin-Flow",
    summary: "Vom veröffentlichten Shooting bis zur Absage – Teilnehmer-Status im Admin.",
    steps: [
      "Shooting anlegen unter Admin → Shootings → Neu",
      "Veröffentlichen → Abonnenten erhalten „Neuer Termin“",
      "Anmeldung Website oder manuell → Status „Eingeladen“ / „Akzeptiert“",
      "Erinnerung vor dem Termin manuell versenden",
      "Bei Absage: Status „Abgesagt“ + E-Mail an alle Teilnehmer",
    ],
    links: [
      { href: "/admin/shootings", label: "Shootings verwalten" },
      { href: "/admin/shootings/neu", label: "Neues Shooting" },
      { href: "/shootings", label: "Öffentliche Terminübersicht" },
    ],
  },
  {
    id: "galerie",
    title: "Galerie & Zugang",
    summary: "Familien melden sich mit E-Mail + persönlichem Zugangscode an – kein Passwort.",
    steps: [
      "Jeder Teilnehmer erhält einen Code (z. B. AF-XXXX-001) in der Anmelde-E-Mail",
      "Login unter „Bilder bestellen“: E-Mail + Code eingeben",
      "Nach Prüfung: persönliche Galerie mit Wasserzeichen-Vorschau",
      "Favoriten & Warenkorb → verbindliche Bestellung",
      "Platzhalter {{accessCodeBlock}} und {{galleryAccessGuideBlock}} in Mails nutzen",
    ],
    links: [
      { href: "/bilder-bestellen", label: "Galerie-Zugang (Kunden)" },
      { href: "/galerie", label: "Galerie-Info" },
      { href: "/login", label: "Login-Seite" },
    ],
    tips: [
      "Code muss exakt zur hinterlegten E-Mail passen.",
      "Link mit vorausgefülltem Code: /bilder-bestellen?code=AF-…",
    ],
  },
  {
    id: "bestellung",
    title: "Bestell-Flow",
    summary: "Auswahl in der Galerie bis zur Bestellbestätigung.",
    steps: [
      "Bilder in der Galerie auswählen → Warenkorb",
      "Staffelpreise laut Admin → Preise",
      "Checkout mit verbindlicher Bestätigung",
      "Bestellbestätigung per E-Mail → Status unter /bestellung/[Nr.]",
      "Admin: Bearbeitung → Sichtung → Benachrichtigung → Download",
    ],
    links: [
      { href: "/admin/bestellungen", label: "Bestellungen bearbeiten" },
      { href: "/warenkorb", label: "Warenkorb (Kunden)" },
      { href: "/admin/preise", label: "Preise konfigurieren" },
    ],
  },
  {
    id: "qr",
    title: "QR-Code",
    summary: "QR pro Teilnehmer für Check-in und Foto-Zuordnung beim Upload.",
    steps: [
      "QR wird bei Anmeldung automatisch erzeugt (Admin → QR-Codes reparieren)",
      "QR-PDF pro Teilnehmer oder Sammel-PDF aus Shooting-Detail",
      "Payload: AQUAFOTOS:{Zugangscode} – wird in Fotos gespeichert",
      "Bulk-Upload: Dateiname mit Präfix 001_, 002_ … → Auto-Zuordnung",
      "Platzhalter {{qrCodeBlock}} in Einladungs-Mails (optional)",
    ],
    links: [
      { href: "/admin/shootings", label: "Shootings → QR-PDF" },
    ],
    tips: [
      "QR-Bild in E-Mails funktioniert am zuverlässigsten als gehostete URL; Data-URL geht in manchen Clients.",
      "Am Shooting: QR ausdrucken oder digital vorzeigen.",
    ],
  },
];

export function guidesForTemplate(templateKey: string): FlowGuideSection[] {
  const category = getCategoryForTemplate(templateKey);
  const ids = new Set<FlowGuideSection["id"]>([category]);

  if (
    templateKey === EMAIL_TEMPLATE_KEYS.REGISTRATION ||
    templateKey === EMAIL_TEMPLATE_KEYS.REGISTRATION_INVITE
  ) {
    ids.add("galerie");
    ids.add("qr");
  }
  if (templateKey === EMAIL_TEMPLATE_KEYS.PHOTOS_READY) {
    ids.add("galerie");
    ids.add("bestellung");
  }

  return NOTIFICATION_FLOW_GUIDES.filter((g) => ids.has(g.id));
}
