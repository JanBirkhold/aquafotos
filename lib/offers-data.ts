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
      "Individuelle Unterwasserportraits in entspannter Atmosphäre – perfekt für besondere Erinnerungen und einzigartige Bildmomente unter Wasser.",
    image: "/images/gallery/unterwasser-01.webp",
    imageAlt: "Unterwasser-Shooting bei AquaFotos Barntrup",
    priceHint: "Ab Anfrage – individuelles Angebot",
    cta: { label: "Termin buchen", href: "/#termin" },
  },
  {
    id: "familien-kinder",
    title: "Familien & Kinder",
    description:
      "Liebevoll inszenierte Shootings für Kinder und Familien. Spielerisch, sicher und mit viel Geduld – für natürliche Unterwasserbilder voller Emotion.",
    image: "/images/gallery/kinder-01.webp",
    imageAlt: "Familien- und Kinder-Unterwasserfotografie AquaFotos",
    priceHint: "Pakete auf Anfrage",
    cta: { label: "Anfragen", href: "/#termin" },
  },
  {
    id: "veranstaltungen-weihnachtsminis",
    title: "Veranstaltungen / WeihnachtsMinis",
    description:
      "Fotoshootings für Events, Schulen und festliche WeihnachtsMinis in Barntrup. Bilder online bestellbar – ideal für Gruppen und besondere Anlässe.",
    image: "/images/gallery/weihnachtsminis-01.webp",
    imageAlt: "Veranstaltungen und WeihnachtsMinis – AquaFotos Barntrup",
    priceHint: "Eventpreise & WeihnachtsMinis – Details auf Anfrage",
    cta: { label: "Info & Termine", href: "/info#aktionen" },
  },
];
