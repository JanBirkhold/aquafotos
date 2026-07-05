import { siteConfig } from "@/lib/site-config";

export type ShootingInfoSlug =
  | "unterwasser"
  | "kita"
  | "baby"
  | "familie"
  | "aktionen";

export type FaqLinkKey =
  | "shootings"
  | "kontakt"
  | "gutschein"
  | "gutscheinEinloesen"
  | "bilderBestellen"
  | "unterwasser"
  | "kita"
  | "baby"
  | "familie"
  | "aktionen"
  | "info"
  | "phone";

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  categories: ShootingInfoSlug[] | "all";
};

export type HowToBlock = {
  slug: ShootingInfoSlug;
  title: string;
  serviceHref: string;
  shootingFilter: string;
  paragraphs: string[];
  steps: { title: string; description: string }[];
  aside?: {
    title: string;
    text: string;
    ctaHref: string;
    ctaLabel: string;
  };
};

export const SHOOTING_INFO_CATEGORIES: {
  slug: ShootingInfoSlug;
  label: string;
  serviceHref: string;
}[] = [
  { slug: "unterwasser", label: "Unterwasser", serviceHref: "/unterwasser" },
  { slug: "kita", label: "Kita", serviceHref: "/kita" },
  { slug: "baby", label: "Baby", serviceHref: "/baby" },
  { slug: "familie", label: "Familie", serviceHref: "/familie" },
  { slug: "aktionen", label: "Aktionen", serviceHref: "/aktionen" },
];

export const FAQ_LINKS: Record<
  FaqLinkKey,
  { href: string; label: string; external?: boolean }
> = {
  shootings: { href: "/shootings", label: "Termine finden" },
  kontakt: { href: "/kontakt", label: "Kontakt" },
  gutschein: { href: "/gutschein", label: "Gutschein kaufen" },
  gutscheinEinloesen: { href: "/gutschein/einloesen", label: "Gutschein einlösen" },
  bilderBestellen: { href: "/bilder-bestellen", label: "Bilder bestellen" },
  unterwasser: { href: "/unterwasser", label: "Unterwasserfotografie" },
  kita: { href: "/kita", label: "Kita-Fotografie" },
  baby: { href: "/baby", label: "Babyfotografie" },
  familie: { href: "/familie", label: "Familienfotografie" },
  aktionen: { href: "/aktionen", label: "Saisonale Aktionen" },
  info: { href: "/info", label: "Info & FAQ" },
  phone: {
    href: `tel:${siteConfig.phone.replace(/\s/g, "")}`,
    label: siteConfig.phoneDisplay,
    external: true,
  },
};

export const HOW_TO_BLOCKS: HowToBlock[] = [
  {
    slug: "unterwasser",
    title: "So läuft ein Unterwasser-Shooting ab",
    serviceHref: "/unterwasser",
    shootingFilter: "unterwasser",
    paragraphs: [
      "Bei unseren Unterwasser-Shootings treffen sich zunächst alle Teilnehmer am Becken. Unsere Fotografin begrüßt Sie und erklärt den genauen Ablauf. Ihr Baby oder Kleinkind kann allein tauchen, gemeinsam mit Ihnen oder mit Geschwistern und Freunden – Sie entscheiden, was sich richtig anfühlt.",
      "Ist Ihr Kind noch nicht an Wasser gewöhnt, helfen kleine Schritte vor dem Termin: gemeinsam schwimmen gehen, Wasser mit einer Gießkanne spielerisch an verschiedene Körperteile – ruhig erklärt, ohne Druck.",
      "Mag Ihr Kind kein Wasser, zwingen Sie es bitte nicht zum Tauchen. Unsere Fotografin fotografiert nur, wenn sich das Kind wohlfühlt und mitmachen möchte.",
    ],
    steps: [
      { title: "Online anmelden", description: "Termin und Uhrzeit unter {shootings} wählen." },
      { title: "Am Becken treffen", description: "Begrüßung und kurze Einweisung durch unsere Fotografin." },
      { title: "Einzelbegleitung", description: "Jedes Kind wird individuell unter Wasser begleitet und fotografiert." },
      { title: "Galerie & Bestellung", description: "Bilder in Ihrer Galerie ansehen und optional über {bilderBestellen} erwerben." },
    ],
    aside: {
      title: "AquaBaby im VitaSol",
      text: "Unsere AquaBaby- & AquaBambini-Termine finden u. a. im VitaSol Bad Salzuflen statt – Anmeldung online.",
      ctaHref: "/shootings?kategorie=unterwasser",
      ctaLabel: "Unterwasser-Termine",
    },
  },
  {
    slug: "kita",
    title: "So läuft ein Kita-Shooting ab",
    serviceHref: "/kita",
    shootingFilter: "kita",
    paragraphs: [
      "Wir arbeiten direkt mit Ihrer Kita oder Einrichtung zusammen. Der Termin wird abgestimmt, Eltern erhalten alle Infos zur Online-Anmeldung und später den Zugang zur persönlichen Galerie.",
      "Ferienaktionen, Gruppenfotos, Geschwistershootings und Einzelportraits – alles DSGVO-konform und ohne klassischen Mappenverkauf. Eltern bestellen bequem online in der Galerie.",
    ],
    steps: [
      { title: "Termin in der Kita", description: "Ihre Einrichtung koordiniert den Shooting-Tag mit uns." },
      { title: "Eltern-Anmeldung", description: "Online unter {shootings} anmelden – mit Zugangscode für die Galerie." },
      { title: "Shooting vor Ort", description: "Gruppen- und Einzelaufnahmen in der Kita oder auf dem Gelände." },
      { title: "Online bestellen", description: "Bilder in der Galerie auswählen und über {bilderBestellen} erwerben." },
    ],
    aside: {
      title: "Für Kitas & Träger",
      text: "Interesse an moderner Kita-Fotografie ohne Mappenchaos? Kooperationen über unsere Partner-Seite.",
      ctaHref: "/partner",
      ctaLabel: "Partner werden",
    },
  },
  {
    slug: "baby",
    title: "So läuft ein Baby-Shooting ab",
    serviceHref: "/baby",
    shootingFilter: "baby",
    paragraphs: [
      "Babybauch, Newborn, Meilensteine, 6 Monate oder 1 Jahr – je nach Angebot im Studio oder an einem passenden Ort. Wir nehmen uns Zeit, Pausen sind selbstverständlich.",
      "Buchen Sie Ihren Wunschtermin online. Nach dem Shooting erhalten Sie Zugang zur Galerie und können Ihre Lieblingsbilder optional erwerben.",
    ],
    steps: [
      { title: "Termin buchen", description: "Verfügbare Baby-Termine unter {shootings} einsehen und anmelden." },
      { title: "Vorbereitung", description: "Bequeme Kleidung, ggf. Lieblingsdecke oder Outfit – wir beraten gern vorab." },
      { title: "Shooting in Ruhe", description: "Liebevolle Begleitung ohne Zeitdruck – auch für müde Babys." },
      { title: "Galerie & Auswahl", description: "Bilder online ansehen und über {bilderBestellen} bestellen." },
    ],
  },
  {
    slug: "familie",
    title: "So läuft ein Familien-Shooting ab",
    serviceHref: "/familie",
    shootingFilter: "familie",
    paragraphs: [
      "Outdoor an schönen Locations in Lippe und OWL – Park, Wald oder Abendlicht. Wir fotografieren echte Momente statt steifer Posen.",
      "Kleidung in abgestimmten, harmonischen Farben wirkt auf Gruppenfotos besonders schön. Bei unsicherm Wetter stimmen wir Alternativen rechtzeitig ab.",
    ],
    steps: [
      { title: "Termin wählen", description: "Familien-Shootings unter {shootings} buchen oder individuell über {kontakt} anfragen." },
      { title: "Location & Outfit", description: "Treffpunkt und Kleidungstipps erhalten Sie mit der Anmeldebestätigung." },
      { title: "Shooting outdoor", description: "Natürliche Interaktion – wir führen entspannt durch das Shooting." },
      { title: "Bilder online", description: "Galerie-Zugang per E-Mail, Bestellung über {bilderBestellen}." },
    ],
  },
  {
    slug: "aktionen",
    title: "So laufen saisonale Aktionen ab",
    serviceHref: "/aktionen",
    shootingFilter: "aktionen",
    paragraphs: [
      "WeihnachtsMinis, Muttertag, Vatertag, Einschulung oder Oster Specials – limitierte Termine mit festem Ablauf. Beliebte Slots sind schnell vergeben, Warteliste inklusive.",
      "Anmeldung ausschließlich online. Nach dem Shooting bestellen Sie wie gewohnt in Ihrer Galerie – oder verschenken Sie ein Shooting als {gutschein}.",
    ],
    steps: [
      { title: "Früh anmelden", description: "Aktions-Termine unter {shootings} – Restplätze live einsehbar." },
      { title: "Warteliste nutzen", description: "Bei ausgebuchten Terminen auf Warteliste setzen lassen." },
      { title: "Aktion erleben", description: "Thematisches Shooting an festgelegtem Ort und zur gebuchten Uhrzeit." },
      { title: "Erinnerungen sichern", description: "Lieblingsbilder in der Galerie auswählen und bestellen." },
    ],
    aside: {
      title: "Gutschein statt Termin?",
      text: "Verschenken Sie ein Shooting flexibel mit Wunschtermin – ideal wenn der Wunschtermin ausgebucht ist.",
      ctaHref: "/gutschein",
      ctaLabel: "Gutschein erwerben",
    },
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "anmeldung-allgemein",
    categories: "all",
    question: "Wie melde ich mich für ein Shooting an?",
    answer:
      "Feste Termine buchen Sie online unter {shootings} – mit Uhrzeitwahl, Restplätzen und Warteliste. Für individuelle Wünsche nutzen Sie {kontakt}. Bei Rückfragen: {phone}.",
  },
  {
    id: "ablauf-unterwasser",
    categories: ["unterwasser"],
    question: "Wie läuft ein Unterwasser-Shooting ab?",
    answer:
      "Alle Teilnehmer treffen sich am Becken. Unsere Fotografin begrüßt Sie, erklärt den Ablauf und begleitet jedes Kind einzeln. Alleine, mit Eltern oder Geschwistern – ganz nach Wohlbefinden. Details unter {info} → Unterwasser.",
  },
  {
    id: "vorbereitung-unterwasser",
    categories: ["unterwasser"],
    question: "Wie bereite ich mein Kind auf Unterwasser-Fotos vor?",
    answer:
      "Vor dem Termin schwimmen gehen, Wasser spielerisch mit einer Gießkanne erkunden – ruhig und ohne Druck. Mehr auf {unterwasser}.",
  },
  {
    id: "kein-zwang-unterwasser",
    categories: ["unterwasser"],
    question: "Was, wenn mein Kind kein Wasser mag?",
    answer:
      "Bitte nicht zum Tauchen zwingen. Unsere Fotografin fotografiert nur, wenn sich Ihr Kind wohlfühlt. Spaß geht vor.",
  },
  {
    id: "kita-datenschutz",
    categories: ["kita"],
    question: "Wie funktioniert die Kita-Fotografie bei AquaFotos?",
    answer:
      "Die Kita koordiniert den Termin. Eltern melden sich online an und erhalten Galerie-Zugang per E-Mail. Bestellung DSGVO-konform online – ohne Mappenverkauf. Mehr auf {kita}.",
  },
  {
    id: "kita-bestellung",
    categories: ["kita"],
    question: "Wie bestellen Eltern Kita-Fotos?",
    answer:
      "Über {bilderBestellen} mit Zugangscode und E-Mail aus der Anmeldebestätigung. Nur Ihre Familie sieht Ihre Bilder.",
  },
  {
    id: "baby-vorbereitung",
    categories: ["baby"],
    question: "Was soll ich zum Baby-Shooting mitbringen?",
    answer:
      "Bequeme Kleidung, ggf. Lieblingsdecke oder Outfit. Bei Newborn-Shootings beraten wir Sie gern vorab über {kontakt}. Termine unter {shootings}.",
  },
  {
    id: "baby-termin",
    categories: ["baby"],
    question: "Gibt es Baby-Termine online?",
    answer:
      "Ja – Babybauch, Newborn, Meilensteine und mehr finden Sie unter {shootings}. Alternativ individuelle Anfrage über {kontakt}.",
  },
  {
    id: "familie-outdoor",
    categories: ["familie"],
    question: "Wo finden Familien-Shootings statt?",
    answer:
      "Outdoor in Lippe / OWL – Park, Wald oder Abendshooting. Termine und Anmeldung unter {shootings}, Infos auf {familie}.",
  },
  {
    id: "familie-kleidung",
    categories: ["familie"],
    question: "Tipps für Familienfotos?",
    answer:
      "Harmonische, nicht zu bunte Kleidung wirkt auf Gruppenfotos am besten. Bei Regen stimmen wir Alternativen ab – schreiben Sie uns über {kontakt}.",
  },
  {
    id: "aktionen-anmeldung",
    categories: ["aktionen"],
    question: "Wie sichere ich mir einen Platz bei WeihnachtsMinis & Aktionen?",
    answer:
      "Früh online anmelden unter {shootings} – beliebte Slots sind schnell weg. Bei Ausgebucht: Warteliste. Übersicht auf {aktionen}.",
  },
  {
    id: "aktionen-gutschein",
    categories: ["aktionen"],
    question: "Kann ich eine Aktion verschenken?",
    answer:
      "Ja – mit einem {gutschein} wählen Beschenkte ihren Wunschtermin selbst. Ideal zu Weihnachten oder Geburtstagen.",
  },
  {
    id: "kosten-teilnahme",
    categories: "all",
    question: "Was kostet die Teilnahme?",
    answer:
      "Die Teilnahme an unseren Shootings ist grundsätzlich kostenfrei – abgesehen von ggf. Eintritt (Schwimmbad) oder vereinbarten Studio-Konditionen. Bilder erwerben Sie optional in der Galerie.",
  },
  {
    id: "bildpreise",
    categories: "all",
    question: "Was kosten die Fotos?",
    answer:
      "Hochauflösende JPG-Dateien inkl. privater Nutzungsrechte. Staffelpreise (1./2./weitere Bild) finden Sie auf dieser Seite unter Preise. Bestellung über {bilderBestellen}.",
  },
  {
    id: "zahlung-lieferung",
    categories: "all",
    question: "Wie bezahle ich und wann erhalte ich meine Bilder?",
    answer:
      "Bestellung online über Ihre Galerie. Bei Echtzeit-Überweisung stehen Dateien in der Regel innerhalb weniger Minuten bereit – auch an Feiertagen. Hilfe: {phone}.",
  },
  {
    id: "gutschein",
    categories: "all",
    question: "Kann ich ein Shooting verschenken?",
    answer:
      "Ja – {gutschein} mit Wunschtermin und Zahlung per Überweisung. Nach Freigabe erhalten Sie Code & QR per E-Mail. Beschenkte lösen unter {gutscheinEinloesen} ein – wir bestätigen dann den individuellen Termin persönlich.",
  },
  {
    id: "gutschein-einloesen",
    categories: "all",
    question: "Wie läuft die Gutschein-Einlösung ab?",
    answer:
      "Nach Zahlung und Freigabe: Code auf {gutscheinEinloesen} eingeben, Kontaktdaten hinterlegen und absenden. Das ist eine Terminanfrage – kein automatischer Platz bei {shootings}. AquaFotos meldet sich zur Terminbestätigung ({phone}). Nach dem Shooting: {bilderBestellen} wie gewohnt.",
  },
  {
    id: "gutschein-shooting-unterschied",
    categories: "all",
    question: "Muss ich nach Gutschein-Einlösung noch einen Termin unter Shootings buchen?",
    answer:
      "Nein. Die Einlösung ersetzt die Kontakt-Anmeldung für Ihr individuelles Shooting. Öffentliche Termine unter {shootings} sind separate Veranstaltungen – Gutschein-Inhaber werden von uns direkt zum passenden Termin eingeladen bzw. der Wunschtermin wird bestätigt.",
  },
  {
    id: "kein-termin",
    categories: "all",
    question: "Kein passender Termin dabei?",
    answer:
      "Schreiben Sie uns über {kontakt} – bei Interesse planen wir zeitnah einen Termin. Benachrichtigung zu neuen Shootings ebenfalls dort.",
  },
  {
    id: "ausgebucht-absage",
    categories: "all",
    question: "Was gilt bei voller Teilnehmerzahl oder Terminabsage?",
    answer:
      "Ohne Voranmeldung keine Teilnahme bei voller Kapazität – Warteliste unter {shootings}. Wir können Termine bei zu geringer Nachfrage absagen; Angemeldete werden informiert.",
  },
  {
    id: "vorschaubilder",
    categories: "all",
    question: "Warum sehe ich Wasserzeichen auf den Bildern?",
    answer:
      "Vorschaubilder sind klein und mit Wasserzeichen. Nach dem Kauf erhalten Sie hochauflösende Dateien ohne Wasserzeichen.",
  },
];

export function getFaqForCategory(slug: ShootingInfoSlug | "all"): FaqItem[] {
  if (slug === "all") return FAQ_ITEMS;
  return FAQ_ITEMS.filter(
    (item) => item.categories === "all" || item.categories.includes(slug),
  );
}

export function getFaqGroups(): { slug: ShootingInfoSlug | "allgemein"; label: string; items: FaqItem[] }[] {
  const general = FAQ_ITEMS.filter((item) => item.categories === "all");
  const groups = SHOOTING_INFO_CATEGORIES.map((cat) => ({
    slug: cat.slug,
    label: cat.label,
    items: FAQ_ITEMS.filter(
      (item) => item.categories !== "all" && item.categories.includes(cat.slug),
    ),
  })).filter((g) => g.items.length > 0);

  return [{ slug: "allgemein", label: "Allgemein", items: general }, ...groups];
}

const LINK_PATTERN = /\{(\w+)\}/g;

export function faqAnswerPlainText(answer: string): string {
  return answer.replace(LINK_PATTERN, (_, key: string) => {
    const link = FAQ_LINKS[key as FaqLinkKey];
    return link?.label ?? `{${key}}`;
  });
}

export function getFaqSchemaFromItems(items: FaqItem[] = FAQ_ITEMS) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faqAnswerPlainText(item.answer),
      },
    })),
  };
}

export function infoHrefForCategory(category: string): string {
  const map: Record<string, ShootingInfoSlug> = {
    UNDERWATER: "unterwasser",
    KITA: "kita",
    BABY: "baby",
    FAMILY: "familie",
    SEASONAL: "aktionen",
    COUPLE: "familie",
    OTHER: "unterwasser",
  };
  const slug = map[category];
  return slug ? `/info?kategorie=${slug}` : "/info";
}
