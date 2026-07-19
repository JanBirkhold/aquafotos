import { siteConfig } from "@/lib/site-config";

export type FaqLinkKey =
  | "shootings"
  | "kontakt"
  | "gutschein"
  | "gutscheinEinloesen"
  | "bilderBestellen"
  | "info"
  | "phone";

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type HowToBlock = {
  id: string;
  title: string;
  paragraphs: string[];
  steps: { title: string; description: string }[];
};

/** @deprecated kept for redirects / old links */
export type ShootingInfoSlug =
  | "unterwasser"
  | "kita"
  | "baby"
  | "familie"
  | "aktionen";

export const FAQ_LINKS: Record<
  FaqLinkKey,
  { href: string; label: string; external?: boolean }
> = {
  shootings: { href: "/shootings", label: "Termine finden" },
  kontakt: { href: "/kontakt", label: "Kontakt" },
  gutschein: { href: "/gutschein", label: "Gutschein kaufen" },
  gutscheinEinloesen: { href: "/gutschein/einloesen", label: "Gutschein einlösen" },
  bilderBestellen: { href: "/bilder-bestellen", label: "so funktioniert’s" },
  info: { href: "/info", label: "Info & FAQ" },
  phone: {
    href: `tel:${siteConfig.phone.replace(/\s/g, "")}`,
    label: siteConfig.phoneDisplay,
    external: true,
  },
};

export const HOW_TO_BLOCK: HowToBlock = {
  id: "ablauf",
  title: "So läuft ein Unterwasser-Shooting ab",
  paragraphs: [
    "Bei unseren Unterwasser-Shootings finden sich zunächst alle Teilnehmer am Becken ein und werden durch unsere Fotografin begrüßt sowie über den genauen Ablauf informiert. Es besteht dabei die Möglichkeit, sein Baby oder Kleinkind allein tauchen zu lassen, gemeinsam mit ihm zu tauchen oder auch Geschwister oder Freunde gemeinsam tauchen zu lassen.",
    "Sollte Ihr Kind noch nicht an Wasser gewöhnt sein, gehen Sie bereits vor dem Termin mal mit Ihrem Kind schwimmen. Lassen Sie ihm Wasser mit einer kleinen Gießkanne über seine verschiedenen Körperteile laufen, während Sie es ihm erklären. Bei unserem Shooting soll sich Ihr Kind wohlfühlen und Spaß haben.",
    "Sollte Ihr Kind kein Wasser mögen, so zwingen Sie es nicht dazu! Unsere Fotografin wird es ablehnen, Ihr Kind zu fotografieren, wenn dieses zeigt, dass es nicht tauchen möchte.",
  ],
  steps: [
    {
      title: "Anmelden",
      description:
        "Per WhatsApp, telefonisch oder per Mail anmelden – Termine auch unter {shootings}.",
    },
    {
      title: "Am Becken treffen",
      description: "Begrüßung und kurze Einweisung durch unsere Fotografin.",
    },
    {
      title: "Shooting",
      description:
        "Jedes Kind wird individuell unter Wasser begleitet – allein, mit Eltern oder Geschwistern.",
    },
    {
      title: "Bilder auswählen",
      description:
        "Nach dem Shooting erhalten Sie Zugang zur Galerie und können Ihre Lieblingsbilder erwerben ({bilderBestellen}).",
    },
  ],
};

/** @deprecated use HOW_TO_BLOCK */
export const HOW_TO_BLOCKS: HowToBlock[] = [HOW_TO_BLOCK];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "anmeldung",
    question: "Wie melde ich mich für eine Veranstaltung an?",
    answer:
      "Per WhatsApp-Nachricht, telefonisch oder per Mail an annika@aquafotos.com. Termine finden Sie auch unter {shootings}. Um teilzunehmen, melden Sie sich bitte vorher an.",
  },
  {
    id: "ohne-anmeldung",
    question: "Kann ich ohne Voranmeldung kommen?",
    answer:
      "Falls Sie ohne Voranmeldung kommen und die Höchstteilnehmeranzahl bereits erreicht ist, können Sie leider nicht teilnehmen. Bitte melden Sie sich vorher an.",
  },
  {
    id: "absage",
    question: "Was gilt bei Absage wegen geringer Teilnehmerzahl?",
    answer:
      "Wir behalten uns vor, Veranstaltungen aufgrund einer zu geringen Teilnehmerzahl jederzeit abzusagen. In dem Fall werden alle bereits eingeschriebenen Teilnehmer informiert.",
  },
  {
    id: "kein-termin",
    question: "Kein passender Termin dabei?",
    answer:
      "Schreiben Sie uns gern eine kurze Mail oder WhatsApp-Nachricht. Bei ausreichendem Interesse kümmern wir uns zeitnah um eine entsprechende Veranstaltung. {kontakt}",
  },
  {
    id: "vorbereitung",
    question: "Wie bereite ich mein Kind aufs Unterwasser-Shooting vor?",
    answer:
      "Vor dem Termin schwimmen gehen und Wasser spielerisch mit einer Gießkanne erkunden – ruhig erklärt, ohne Druck. Spaß und Wohlbefinden stehen im Vordergrund.",
  },
  {
    id: "kein-wasser",
    question: "Was, wenn mein Kind kein Wasser mag?",
    answer:
      "Bitte nicht zum Tauchen zwingen. Unsere Fotografin fotografiert nur, wenn sich Ihr Kind wohlfühlt und mitmachen möchte.",
  },
  {
    id: "kosten-teilnahme",
    question: "Was kostet die Teilnahme?",
    answer:
      "Die Teilnahme ist grundsätzlich kostenfrei – abgesehen vom Eintritt, den das jeweilige Schwimmbad erhebt. Bilder erwerben Sie optional danach.",
  },
  {
    id: "bildpreise",
    question: "Was kosten die Fotos?",
    answer:
      "Hochwertig aufbereitete JPG-Dateien inkl. Nutzungsrechten für private Zwecke. Das erste Werk kostet 35 €, das zweite 25 € und jedes weitere 15 €. Zahlung per Vorkasse (Überweisung).",
  },
  {
    id: "zahlung-lieferung",
    question: "Wann erhalte ich meine Bilder nach der Zahlung?",
    answer:
      "Bilder aus Bestellungen, die per Echtzeit-Überweisung bezahlt werden, werden in der Regel innerhalb weniger Minuten zugesendet – auch an Sonn- und Feiertagen. Bei Verzögerungen: {phone}.",
  },
  {
    id: "gutschein",
    question: "Wie funktioniert ein Gutschein?",
    answer:
      "Unter {gutschein} können Sie per E-Mail oder Telefon einen Betrag anfragen. Nach Überweisung erhalten Sie den Gutscheincode per E-Mail und können ihn bei der nächsten Bildbestellung einlösen.",
  },
  {
    id: "vorschaubilder",
    question: "Warum sehe ich Wasserzeichen auf den Bildern?",
    answer:
      "Vorschaubilder sind klein und mit Wasserzeichen. Nach dem Kauf erhalten Sie hochauflösende Dateien ohne Wasserzeichen.",
  },
];

export function getFaqForCategory(): FaqItem[] {
  return FAQ_ITEMS;
}

export function getFaqGroups(): { slug: string; label: string; items: FaqItem[] }[] {
  return [{ slug: "allgemein", label: "Häufige Fragen", items: FAQ_ITEMS }];
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

export function infoHrefForCategory(_category?: string): string {
  void _category;
  return "/info";
}
