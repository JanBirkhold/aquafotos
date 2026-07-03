import { siteConfig } from "./site-config";
import { galleryItems } from "./gallery-data";
import { teamMembers } from "./team-data";

export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/images/aquafotos_logo.svg`,
    description:
      "Professionelle Unterwasserfotografie in Barntrup und Umgebung Lippe / OWL für Kinder, Familien und besondere Anlässe.",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: siteConfig.phone,
      contactType: "customer service",
      areaServed: "DE",
      availableLanguage: "German",
    },
    sameAs: [],
  };
}

export function getLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteConfig.url}/#localbusiness`,
    name: siteConfig.name,
    image: `${siteConfig.url}/images/hero-bg.webp`,
    url: siteConfig.url,
    telephone: siteConfig.phone,
    priceRange: "€€",
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.street,
      addressLocality: siteConfig.address.city,
      postalCode: siteConfig.address.postalCode,
      addressRegion: siteConfig.address.region,
      addressCountry: siteConfig.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 51.989,
      longitude: 9.116,
    },
    areaServed: [
      { "@type": "City", name: "Barntrup" },
      { "@type": "AdministrativeArea", name: "Kreis Lippe" },
      { "@type": "AdministrativeArea", name: "Ostwestfalen-Lippe" },
    ],
    description:
      "Unterwasserfotografie und Fotoshootings in Barntrup – emotionale Bilder für Kinder, Familien, Veranstaltungen und WeihnachtsMinis.",
    parentOrganization: { "@id": `${siteConfig.url}/#organization` },
  };
}

export function getPersonSchema() {
  const annika = teamMembers.find((m) => m.id === "annika");

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${siteConfig.url}/#photographer`,
    name: siteConfig.photographer.name,
    jobTitle: siteConfig.photographer.role,
    image: annika ? `${siteConfig.url}${annika.image}` : undefined,
    worksFor: { "@id": `${siteConfig.url}/#organization` },
    knowsAbout: [
      "Unterwasserfotografie",
      "Kinderfotografie",
      "Familienfotografie",
      "Eventfotografie",
    ],
  };
}

export function getTeamSchemas() {
  return teamMembers.map((member) => ({
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${siteConfig.url}/#${member.id}`,
    name: member.name,
    jobTitle: member.role,
    image: `${siteConfig.url}${member.image}`,
    worksFor: { "@id": `${siteConfig.url}/#organization` },
    url: `${siteConfig.url}/ueber-uns`,
  }));
}

export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function getFaqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Wo findet die Unterwasserfotografie bei AquaFotos statt?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "AquaFotos bietet professionelle Unterwasserfotografie in Barntrup und der Region Lippe / Ostwestfalen-Lippe (OWL) an.",
        },
      },
      {
        "@type": "Question",
        name: "Erhalte ich hochauflösende Bilder ohne Wasserzeichen?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ja. Vorschaubilder haben eine geringe Auflösung und ein Wasserzeichen. Nach dem Kauf erhalten Sie hochauflösende Bilddateien ohne Wasserzeichen.",
        },
      },
      {
        "@type": "Question",
        name: "Wie schnell erhalte ich meine Bilder bei Echtzeit-Überweisung?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Bei Echtzeit-Überweisung werden Bilder in der Regel innerhalb weniger Minuten zugesendet – auch an Sonn- und Feiertagen.",
        },
      },
      {
        "@type": "Question",
        name: "Für wen eignen sich Unterwasser-Fotoshootings?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Unsere Shootings eignen sich für Kinder, Familien, Veranstaltungen und besondere Anlässe wie WeihnachtsMinis – liebevoll inszeniert und professionell bearbeitet.",
        },
      },
    ],
  };
}

export function getImageGallerySchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: "AquaFotos Galerie – Unterwasserfotografie Barntrup",
    description:
      "Ausgewählte Unterwasserbilder von AquaFotos: Kinder, Familien, Events und WeihnachtsMinis.",
    image: galleryItems.slice(0, 8).map((item) => ({
      "@type": "ImageObject",
      contentUrl: `${siteConfig.url}${item.src}`,
      name: item.alt,
      description: item.alt,
      caption: item.alt,
    })),
  };
}

export function getHomepageSchemas() {
  return [
    getOrganizationSchema(),
    getLocalBusinessSchema(),
    ...getTeamSchemas(),
    getBreadcrumbSchema([{ name: "Start", url: siteConfig.url }]),
    getFaqSchema(),
    getImageGallerySchema(),
  ];
}
