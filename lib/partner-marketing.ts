import type { PartnerType } from "@prisma/client";

export const partnerHero = {
  headline: "Partner werden",
  subline:
    "Mehrwert für Ihre Teilnehmer – ohne Aufwand für Sie. Wir übernehmen Anmeldung, Galerie, Shop und Abwicklung.",
  ctaPrimary: "Termin anfragen",
  ctaSecondary: "So funktioniert's",
};

export const partnerPillars = [
  {
    id: "anmeldung",
    title: "Anmeldung",
    description:
      "Online-Anmeldung mit QR-Codes, Wartelisten und Bestätigungs-Mails – ohne Excel-Listen oder Telefon-Pingpong.",
  },
  {
    id: "galerie",
    title: "Galerie",
    description:
      "Persönliche Galerie pro Teilnehmer mit Wasserzeichen-Vorschau, Favoriten und sicherem Zugang per Code.",
  },
  {
    id: "shop",
    title: "Shop",
    description:
      "Transparenter Bildershop mit Staffelpreisen – Familien wählen selbst, Sie müssen nicht verkaufen.",
  },
  {
    id: "abwicklung",
    title: "Abwicklung",
    description:
      "Bestellstatus, Bearbeitung, Download und Benachrichtigungen – komplett durch uns, DSGVO-konform.",
  },
] as const;

export const partnerSteps = [
  {
    step: 1,
    title: "Kurzes Kennenlernen",
    description: "Wir besprechen Zielgruppe, Termin und Rahmen – 15 Minuten reichen oft.",
  },
  {
    step: 2,
    title: "Wir organisieren",
    description: "Shooting-Planung, Kommunikation an Ihre Teilnehmer und technische Einrichtung.",
  },
  {
    step: 3,
    title: "Teilnehmer melden sich an",
    description: "Digitale Anmeldung mit QR-Code – ohne Aufwand in Ihrer Verwaltung.",
  },
  {
    step: 4,
    title: "Fertig – Sie lehnen sich zurück",
    description: "Galerie, Verkauf und Auslieferung laufen bei uns. Sie bieten Premium-Mehrwert.",
  },
] as const;

export const partnerBenefits = {
  forYou: [
    "Kein Personalaufwand für Anmeldung oder Fotoverkauf",
    "Professionelles Angebot ohne eigene Fotografen-Suche",
    "Zufriedene Familien = positives Image für Ihre Einrichtung",
    "Flexible Formate: Unterwasser, Kita, Baby, Familie",
    "Auf Wunsch mit Ihrem Logo auf der Partner-Seite",
  ],
  weHandle: [
    "Terminplanung & Kapazitätsmanagement",
    "Teilnehmer-Anmeldung inkl. E-Mail-Bestätigung",
    "QR-Codes & Galerie-Zugang",
    "Warenkorb, Preise & Bestellabwicklung",
    "Bildbearbeitung, Download & Support für Kunden",
  ],
} as const;

export type PartnerSegment = {
  type: PartnerType;
  title: string;
  hook: string;
  benefits: string[];
};

export const partnerSegments: PartnerSegment[] = [
  {
    type: "SWIMMING_POOL",
    title: "Schwimmbäder & Thermen",
    hook: "Ein Erlebnis, das Besucher bindet – ohne Extra-Personal am Beckenrand.",
    benefits: [
      "Emotionale Unterwasserbilder als Alleinstellungsmerkmal",
      "Komplette Abwicklung ohne Kassen- oder Verkaufsstand",
      "Termin-Shootings statt dauernder Fotografen-Präsenz",
    ],
  },
  {
    type: "KITA",
    title: "Kitas & Kindergärten",
    hook: "Moderne Kita-Fotografie ohne Mappenverkauf und ohne Chaos am Elternabend.",
    benefits: [
      "Eltern bestellen digital – kein Druck auf Erzieher:innen",
      "DSGVO-konforme Galerie mit Einzelzugang",
      "Einheitlicher Look, professionelle Bearbeitung",
    ],
  },
  {
    type: "MIDWIFE",
    title: "Hebammen & Praxen",
    hook: "Emotionale Begleitung von Schwangerschaft bis Baby – mit passendem Fotoangebot.",
    benefits: [
      "Gutscheine & Shootings als Zusatzservice",
      "Vertrauensvolle Ansprache Ihrer Klientinnen",
      "Kein eigener Shop nötig",
    ],
  },
  {
    type: "FAMILY_CENTER",
    title: "Familienzentren",
    hook: "Premium-Fotografie als Kooperationsangebot – wir liefern die Infrastruktur.",
    benefits: [
      "Attraktives Programm für Familien im Quartier",
      "Gemeinsame Sichtbarkeit auf aquafotos.com/partner",
      "Minimaler Abstimmungsaufwand für Ihr Team",
    ],
  },
];
