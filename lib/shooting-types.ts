export type ShootingCategory =
  | "UNDERWATER"
  | "KITA"
  | "BABY"
  | "FAMILY"
  | "COUPLE"
  | "SEASONAL"
  | "OTHER";

export type ShootingType =
  | "UNDERWATER_BABY"
  | "UNDERWATER_TODDLER"
  | "UNDERWATER_CHILD"
  | "UNDERWATER_FAMILY"
  | "UNDERWATER_SIBLINGS"
  | "KITA_HOLIDAY"
  | "KITA_SIBLINGS"
  | "KITA_GROUP"
  | "KITA_PORTRAIT"
  | "BABY_BELLY"
  | "BABY_NEWBORN"
  | "BABY_MILESTONE"
  | "BABY_6_MONTHS"
  | "BABY_1_YEAR"
  | "FAMILY_OUTDOOR"
  | "FAMILY_PARK"
  | "FAMILY_FOREST"
  | "FAMILY_EVENING"
  | "COUPLE"
  | "CHRISTMAS_MINIS"
  | "MOTHERS_DAY"
  | "FATHERS_DAY"
  | "SCHOOL_ENROLLMENT"
  | "EASTER"
  | "OTHER";

export const shootingTypeLabels: Record<ShootingType, string> = {
  UNDERWATER_BABY: "Unterwasser Babyschwimmen",
  UNDERWATER_TODDLER: "Unterwasser Kleinkinder",
  UNDERWATER_CHILD: "Unterwasser Kinder",
  UNDERWATER_FAMILY: "Unterwasser Familie",
  UNDERWATER_SIBLINGS: "Unterwasser Geschwister",
  KITA_HOLIDAY: "Kita Ferienaktion",
  KITA_SIBLINGS: "Kita Geschwistershooting",
  KITA_GROUP: "Kita Gruppenfoto",
  KITA_PORTRAIT: "Kita Einzelportrait",
  BABY_BELLY: "Babybauch",
  BABY_NEWBORN: "Newborn",
  BABY_MILESTONE: "Meilensteinshooting",
  BABY_6_MONTHS: "6 Monate Shooting",
  BABY_1_YEAR: "1 Jahr Shooting",
  FAMILY_OUTDOOR: "Familie Outdoor",
  FAMILY_PARK: "Familie Park",
  FAMILY_FOREST: "Familie Wald",
  FAMILY_EVENING: "Familie Abendshooting",
  COUPLE: "Paarshooting",
  CHRISTMAS_MINIS: "WeihnachtsMinis",
  MOTHERS_DAY: "Muttertags Special",
  FATHERS_DAY: "Vatertags Special",
  SCHOOL_ENROLLMENT: "Einschulung",
  EASTER: "Oster Special",
  OTHER: "Individuelles Shooting",
};

export const shootingCategoryLabels: Record<ShootingCategory, string> = {
  UNDERWATER: "Unterwasser",
  KITA: "Kita",
  BABY: "Baby",
  FAMILY: "Familie",
  COUPLE: "Paar",
  SEASONAL: "Aktionen",
  OTHER: "Sonstiges",
};

export const categoryShootingTypes: Record<ShootingCategory, ShootingType[]> = {
  UNDERWATER: [
    "UNDERWATER_BABY",
    "UNDERWATER_TODDLER",
    "UNDERWATER_CHILD",
    "UNDERWATER_FAMILY",
    "UNDERWATER_SIBLINGS",
  ],
  KITA: ["KITA_HOLIDAY", "KITA_SIBLINGS", "KITA_GROUP", "KITA_PORTRAIT"],
  BABY: [
    "BABY_BELLY",
    "BABY_NEWBORN",
    "BABY_MILESTONE",
    "BABY_6_MONTHS",
    "BABY_1_YEAR",
  ],
  FAMILY: [
    "FAMILY_OUTDOOR",
    "FAMILY_PARK",
    "FAMILY_FOREST",
    "FAMILY_EVENING",
  ],
  COUPLE: ["COUPLE"],
  SEASONAL: [
    "CHRISTMAS_MINIS",
    "MOTHERS_DAY",
    "FATHERS_DAY",
    "SCHOOL_ENROLLMENT",
    "EASTER",
  ],
  OTHER: ["OTHER"],
};

export function getCategoryForShootingType(type: ShootingType): ShootingCategory {
  for (const [category, types] of Object.entries(categoryShootingTypes) as [
    ShootingCategory,
    ShootingType[],
  ][]) {
    if (types.includes(type)) return category;
  }
  return "OTHER";
}

export type ServicePage = {
  slug: string;
  title: string;
  headline: string;
  subline: string;
  category: ShootingCategory;
  audience: string;
  message: string;
  problems: string[];
  image: string;
  imageAlt: string;
};

export const servicePages: ServicePage[] = [
  {
    slug: "unterwasser",
    title: "Unterwasserfotografie",
    headline: "Magische Momente unter Wasser",
    subline:
      "Emotionale Unterwasserbilder für Babys, Kinder und Familien aus Barntrup, Detmold, Lage und Bad Salzuflen – Termine in Lippe / OWL.",
    category: "UNDERWATER",
    audience: "Eltern mit Babys & Kindern · Lippe / OWL",
    message: "Die schönsten Erinnerungen entstehen nur einmal.",
    problems: [
      "Keine schönen Fotos unter Wasser",
      "Keine Zeit für aufwendige Shootings",
      "Keine Erfahrung mit Unterwasserfotografie",
    ],
    image: "/images/hero/unterwasser.webp",
    imageAlt: "Unterwasserfoto Kind – AquaFotos Barntrup, Detmold & Bad Salzuflen",
  },
  {
    slug: "kita",
    title: "Kita-Fotografie",
    headline: "Moderne Kita-Fotografie ohne Mappenchaos",
    subline:
      "Ferienaktionen, Gruppenfotos und Portraits für Kitas in Detmold, Lage, Barntrup und Bad Salzuflen.",
    category: "KITA",
    audience: "Kitas & Eltern · Kreis Lippe",
    message: "Moderne Kita-Fotografie ohne Mappenverkauf.",
    problems: [
      "Fotografenchaos und unübersichtliche Bestellung",
      "Zu viel Organisation für Kita und Eltern",
      "Komplizierte Bestellprozesse für Eltern",
    ],
    image: "/images/hero/kinder.webp",
    imageAlt: "Kita-Fotografie – AquaFotos Detmold, Lage & OWL",
  },
  {
    slug: "baby",
    title: "Babyfotografie",
    headline: "Die ersten Momente für immer festhalten",
    subline:
      "Babybauch, Newborn und Meilensteine – liebevoll inszeniert für Familien aus Barntrup, Detmold und Umgebung.",
    category: "BABY",
    audience: "Eltern mit Babys · Lippe",
    message: "Die schönsten Erinnerungen entstehen nur einmal.",
    problems: [
      "Handyfotos halten diese besonderen Momente oft nicht fest",
      "Die ersten Monate sind schneller vorbei, als man denkt",
      "Schwer zu sagen, welche Bilder man später wirklich behalten will",
    ],
    image: "/images/hero/baby.webp",
    imageAlt: "Babyfotografie – AquaFotos Barntrup & Detmold",
  },
  {
    slug: "familie",
    title: "Familienfotografie",
    headline: "Echte Emotionen im Freien",
    subline:
      "Outdoor-, Park- und Waldshootings – natürliche Familienportraits in Detmold, Lage, Bad Salzuflen und ganz Lippe / OWL.",
    category: "FAMILY",
    audience: "Familien · Ostwestfalen",
    message: "Erinnerungen, die bleiben.",
    problems: [
      "Gestellte Fotos statt echter Momente",
      "Schwierige Terminplanung mit Kindern",
      "Kein Fotograf, der Geduld mitbringt",
    ],
    image: "/images/hero/familie.webp",
    imageAlt: "Familienfotografie Outdoor – AquaFotos Lippe / OWL",
  },
  {
    slug: "aktionen",
    title: "Saisonale Aktionen",
    headline: "Besondere Anlässe, besondere Bilder",
    subline:
      "WeihnachtsMinis und saisonale Specials in Barntrup und Umgebung – ideal für Familien aus Detmold, Lage und Bad Salzuflen.",
    category: "SEASONAL",
    audience: "Familien · Lippe / OWL",
    message: "Limitierte Termine – jetzt Platz sichern.",
    problems: [
      "Beliebte Termine schnell ausgebucht",
      "Keine rechtzeitige Erinnerung",
      "Schwer passende Angebote zu finden",
    ],
    image: "/images/hero/weihnachtsminis.webp",
    imageAlt: "WeihnachtsMinis – AquaFotos Barntrup & Lippe",
  },
];

export const partnerTypes = [
  {
    type: "SWIMMING_POOL" as const,
    title: "Schwimmbäder",
    message: "Mehrwert für Ihre Teilnehmer ohne Aufwand.",
    problem: "Zusatzangebote fehlen",
  },
  {
    type: "KITA" as const,
    title: "Kitas",
    message: "Moderne Kita-Fotografie ohne Mappenverkauf.",
    problem: "Fotografenchaos & Mappenverkauf",
  },
  {
    type: "MIDWIFE" as const,
    title: "Hebammen",
    message: "Emotionale Begleitung von der Schwangerschaft bis zum Baby.",
    problem: "Kein digitales Fotokonzept",
  },
  {
    type: "FAMILY_CENTER" as const,
    title: "Familienzentren",
    message: "Premium-Fotografie als Zusatzangebot für Familien.",
    problem: "Fehlende Kooperationspartner",
  },
];

export function getServiceBySlug(slug: string): ServicePage | undefined {
  return servicePages.find((s) => s.slug === slug);
}
