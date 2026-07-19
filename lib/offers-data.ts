export type Offer = {
  id: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  priceHint: string;
  cta: { label: string; href: string };
};

export const offers: Offer[] = [
  {
    id: "unterwasser-shooting",
    title: "Unterwasser-Shooting",
    description:
      "Individuelle Unterwasserportraits für Familien aus Barntrup, Detmold, Lage und Bad Salzuflen – entspannt und emotional.",
    image: "/images/gallery/unterwasser-01.webp",
    imageAlt: "Unterwasser-Shooting bei AquaFotos – Barntrup, Detmold & Bad Salzuflen",
    priceHint: "Ab Anfrage – individuelles Angebot",
    cta: { label: "Termin finden", href: "/shootings" },
  },
  {
    id: "familien-kinder",
    title: "Familien & Kinder",
    description:
      "Liebevoll inszenierte Shootings für Kinder und Familien in Lippe / OWL – spielerisch, sicher und mit viel Geduld.",
    image: "/images/gallery/kinder-01.webp",
    imageAlt: "Familien- und Kinderfotografie AquaFotos Detmold, Lage & OWL",
    priceHint: "Pakete auf Anfrage",
    cta: { label: "Anfragen", href: "/kontakt" },
  },
  {
    id: "veranstaltungen-weihnachtsminis",
    title: "Veranstaltungen / WeihnachtsMinis",
    description:
      "Events und WeihnachtsMinis in Barntrup und Umgebung – ideal für Familien aus Detmold, Lage und Bad Salzuflen.",
    image: "/images/gallery/weihnachtsminis-01.webp",
    imageAlt: "WeihnachtsMinis und Events – AquaFotos Barntrup & Lippe",
    priceHint: "Eventpreise & WeihnachtsMinis – Details auf Anfrage",
    cta: { label: "Info & Termine", href: "/info" },
  },
];
