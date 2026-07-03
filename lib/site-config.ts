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
  geo: {
    area: "Barntrup, Lippe, Ostwestfalen-Lippe (OWL)",
    keywords: [
      "Unterwasserfotografie Barntrup",
      "Unterwasser Fotoshooting",
      "Unterwasserfotos Kinder",
      "Unterwasser Fotos Familie",
      "Fotograf Barntrup",
      "Fotostudio Lippe",
      "AquaFotos",
      "WeihnachtsMinis Barntrup",
      "professionelle Unterwasserbilder",
      "Fotoshooting OWL",
    ],
  },
  nav: [
    { label: "Start", href: "/" },
    { label: "Galerie", href: "/galerie" },
    { label: "Angebote", href: "/angebote" },
    { label: "Veranstaltungen", href: "/veranstaltungen" },
    { label: "Rezensionen", href: "/#rezensionen" },
    { label: "Warenkorb", href: "/warenkorb" },
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
