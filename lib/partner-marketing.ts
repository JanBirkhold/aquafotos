export type PartnerType = "SWIMMING_POOL" | "KITA" | "MIDWIFE" | "FAMILY_CENTER" | "OTHER";

export const partnerHero = {
  headline: "Partner werden",
  subline:
    "Mehrwert für Familien in Barntrup, Detmold, Lage, Bad Salzuflen und ganz Lippe / OWL – ohne Verwaltungsaufwand für Ihr Team. Wir planen Termine, fotografieren vor Ort und kümmern uns um Galerie und Bildbestellung.",
  ctaPrimary: "Unverbindlich anfragen",
  ctaSecondary: "So funktioniert’s",
};

export const partnerPillars = [
  {
    id: "termin",
    title: "Termin & Aushang",
    description:
      "Gemeinsam legen wir Datum und Rahmen fest. Sie erhalten Text und QR-Code für Aushänge – Familien scannen und melden sich direkt bei uns.",
  },
  {
    id: "anmeldung",
    title: "Anmeldung bei uns",
    description:
      "WhatsApp, Telefon oder E-Mail – wir nehmen Anmeldungen entgegen und halten die Teilnehmerliste. Kein Excel und keine Wartelisten-Software für Sie.",
  },
  {
    id: "shooting",
    title: "Shooting vor Ort",
    description:
      "Wir kommen mit Kamera und Ablaufplan. Sie stellen Raum bzw. Becken – der Rest läuft über AquaFotos.",
  },
  {
    id: "galerie",
    title: "Galerie & Bestellung",
    description:
      "Nach dem Shooting erhalten Familien ihren Galerie-Zugang per E-Mail, wählen Bilder und zahlen per Überweisung. Verkauf und Support übernehmen wir.",
  },
] as const;

export const partnerSteps = [
  {
    step: 1,
    title: "Kennenlernen",
    description:
      "Kurzes Gespräch zu Zielgruppe, Termin und Ort – unverbindlich per Mail oder Telefon.",
  },
  {
    step: 2,
    title: "Termin & QR-Material",
    description:
      "Wir fixieren den Termin und liefern Aushang-Text plus QR-Code (Link zu Termin/Kontakt). Sie hängen aus – fertig.",
  },
  {
    step: 3,
    title: "Familien melden sich an",
    description:
      "Anmeldung läuft bei uns: WhatsApp, Telefon oder E-Mail. Sie müssen keine Listen führen und nichts verkaufen.",
  },
  {
    step: 4,
    title: "Shooting & Nachbereitung",
    description:
      "Wir fotografieren, richten die Galerie ein und wickeln Bestellungen ab. Sie bieten Premium-Mehrwert ohne Extra-Personal.",
  },
] as const;

export const partnerBenefits = {
  forYou: [
    "Kein Personalaufwand für Anmeldung oder Fotoverkauf",
    "Professionelles Angebot ohne eigene Fotografen-Suche",
    "Zufriedene Familien = positives Image für Ihre Einrichtung",
    "Flexible Formate: Unterwasser, Kita, Baby, Familie",
    "Sichtbarkeit als Partner auf aquafotos.com – Region Lippe / OWL",
  ],
  weHandle: [
    "Terminplanung und Kommunikation mit den Familien",
    "QR-Code & Aushang-Text für Ihre Räume",
    "Anmeldung per WhatsApp, Telefon und E-Mail",
    "Shooting vor Ort inkl. Ablauf am Becken/Raum",
    "Galerie-Zugang, Bildbestellung und Support für Kunden",
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
    hook: "Ein Erlebnis für Familien aus Detmold, Lage und Bad Salzuflen – ohne Extra-Personal am Beckenrand.",
    benefits: [
      "Emotionale Unterwasserbilder als Alleinstellungsmerkmal",
      "Keine Verkaufsstände oder Kassenabwicklung für Fotos",
      "Feste Event-Termine statt dauernder Fotografen-Präsenz",
    ],
  },
  {
    type: "KITA",
    title: "Kitas & Kindergärten",
    hook: "Moderne Kita-Fotografie in Lippe / OWL – ohne Mappenverkauf und ohne Chaos am Elternabend.",
    benefits: [
      "Eltern bestellen selbst – kein Druck auf Erzieher:innen",
      "Klare Anmeldung und Galerie-Zugang über uns",
      "Einheitlicher Look, professionelle Bearbeitung",
    ],
  },
  {
    type: "MIDWIFE",
    title: "Hebammen & Praxen",
    hook: "Emotionale Begleitung von Schwangerschaft bis Baby – mit passendem Fotoangebot vor Ort.",
    benefits: [
      "Gutscheine & Shootings als Zusatzservice",
      "Vertrauensvolle Ansprache Ihrer Klientinnen",
      "Kein eigener Verkaufsprozess nötig",
    ],
  },
  {
    type: "FAMILY_CENTER",
    title: "Familienzentren",
    hook: "Premium-Fotografie als Kooperationsangebot in Barntrup, Detmold und Umgebung.",
    benefits: [
      "Attraktives Programm für Familien im Quartier",
      "Gemeinsame Sichtbarkeit auf aquafotos.com/partner",
      "Minimaler Abstimmungsaufwand für Ihr Team",
    ],
  },
];

/** Kurzfassung für die Startseite */
export const partnerHomeTeaser = {
  eyebrow: "Für Einrichtungen in Lippe / OWL",
  headline: "Partner werden",
  text: "Schwimmbad, Kita oder Familienzentrum in Barntrup, Detmold, Lage oder Bad Salzuflen? Wir bringen Unterwasser- und Familienfotografie zu Ihnen – mit QR-Aushang, Anmeldung bei uns und kompletter Nachbereitung.",
  points: [
    "QR-Code zum Aushängen → Anmeldung bei AquaFotos",
    "Shooting vor Ort – Sie stellen nur den Raum",
    "Galerie & Bildbestellung komplett über uns",
  ],
} as const;
