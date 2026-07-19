export const siteConfig = {
  name: "AquaFotos",
  url: "https://aquafotos.com",
  locale: "de-DE",
  phone: "+49 176 34934106",
  phoneDisplay: "0176 34934106",
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
    "Professionelle Unterwasser-, Kinder- und Familienfotografie in Barntrup, Detmold, Lage, Bad Salzuflen und ganz Ostwestfalen.",
  geo: {
    area:
      "Barntrup, Detmold, Lage, Bad Salzuflen, Kreis Lippe, Ostwestfalen-Lippe (OWL)",
    cities: [
      "Barntrup",
      "Detmold",
      "Lage",
      "Bad Salzuflen",
      "Lemgo",
      "Horn-Bad Meinberg",
    ] as const,
    keywords: [
      "Unterwasserfotografie Barntrup",
      "Unterwasserfotos Detmold",
      "Kinderfotograf Detmold",
      "Familienfotograf Lage",
      "Unterwasser Shooting Bad Salzuflen",
      "Babyfotograf Lippe",
      "Kita Fotograf OWL",
      "Fotoshooting Detmold",
      "Fotoshooting Lage",
      "Fotoshooting Bad Salzuflen",
      "WeihnachtsMinis Barntrup",
      "AquaFotos",
      "Unterwasserfotografie Lippe",
      "Professionelle Unterwasserbilder OWL",
    ],
    /** Social / Profil-URLs für Schema sameAs – leer lassen, wenn noch keine Profile */
    sameAs: [] as string[],
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
    { label: "Info & FAQ", href: "/info" },
    { label: "Partner", href: "/partner" },
    { label: "Gutschein", href: "/gutschein" },
    { label: "Kontakt", href: "/kontakt" },
  ],
  /** Leer lassen, wenn kein Kleinunternehmer-Hinweis auf Rechnungen nötig ist. */
  invoiceSmallBusinessNotice:
    "Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.",
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
