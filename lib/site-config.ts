export const siteConfig = {
  name: "AquaFotos",
  url: "https://aquafotos.com",
  locale: "de-DE",
  phone: "+49 157 514 788 26",
  phoneDisplay: "0157 514 788 26",
  emailUser: "annika",
  emailDomain: "aquafotos.com",
  address: {
    street: "Mittelstr. 63",
    city: "Barntrup",
    postalCode: "32683",
    region: "Nordrhein-Westfalen",
    country: "DE",
  },
  owner: {
    name: "Kasimir Eckhardt",
    role: "Geschäftsführer",
  },
  photographer: {
    name: "Annika Eckhardt",
    role: "Fotografin",
  },
  tagline: "Erinnerungen, die bleiben.",
  subline:
    "Professionelle Unterwasser-, Kinder- und Familienfotografie in Ostwestfalen.",
  geo: {
    area: "Barntrup, Lippe, Ostwestfalen-Lippe (OWL)",
    keywords: [
      "Unterwasserfotografie Barntrup",
      "Kinderfotograf Lippe",
      "Kita Fotograf OWL",
      "Babyfotograf Barntrup",
      "Familienfotograf Lippe",
      "Unterwasser Fotoshooting",
      "AquaFotos",
      "WeihnachtsMinis Barntrup",
      "professionelle Unterwasserbilder",
      "Fotoshooting OWL",
    ],
  },
  shootingNav: [
    { label: "Unterwasser", href: "/unterwasser" },
    { label: "Kita", href: "/kita" },
    { label: "Baby", href: "/baby" },
    { label: "Familie", href: "/familie" },
    { label: "Aktionen", href: "/aktionen" },
  ],
  nav: [
    { label: "Start", href: "/" },
    { label: "Gutschein", href: "/gutschein" },
    { label: "Bilder bestellen", href: "/bilder-bestellen" },
    { label: "Partner", href: "/partner" },
    { label: "Kontakt", href: "/kontakt" },
  ],
} as const;

export type GalleryCategory =
  | "unterwasser"
  | "kinder"
  | "familien"
  | "events"
  | "weihnachtsminis";

export const galleryCategoryLabels: Record<GalleryCategory, string> = {
  unterwasser: "Unterwasser",
  kinder: "Kinder",
  familien: "Familien",
  events: "Events",
  weihnachtsminis: "WeihnachtsMinis",
};

export const heroSlides = [
  {
    src: "/images/hero/unterwasser.webp",
    alt: "Unterwasser Baby – AquaFotos",
    label: "Unterwasser",
  },
  {
    src: "/images/hero/kinder.webp",
    alt: "Kinderportrait – AquaFotos",
    label: "Kinder",
  },
  {
    src: "/images/hero/familie.webp",
    alt: "Familienbild – AquaFotos",
    label: "Familie",
  },
  {
    src: "/images/hero/weihnachtsminis.webp",
    alt: "WeihnachtsMini – AquaFotos",
    label: "WeihnachtsMinis",
  },
  {
    src: "/images/hero/paar.webp",
    alt: "Paarshooting – AquaFotos",
    label: "Paar",
  },
] as const;
