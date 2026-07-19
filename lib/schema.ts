import { siteConfig } from "./site-config";
import { galleryItems } from "./gallery-data";
import { teamMembers } from "./team-data";

const areaCities = siteConfig.geo.cities;

export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/images/aquafotos_logo.svg`,
    description: `Professionelle Unterwasserfotografie in ${siteConfig.geo.area} für Kinder, Familien und besondere Anlässe.`,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: siteConfig.phone,
      contactType: "customer service",
      areaServed: "DE",
      availableLanguage: "German",
    },
    sameAs: [...siteConfig.geo.sameAs],
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
      ...areaCities.map((name) => ({ "@type": "City" as const, name })),
      { "@type": "AdministrativeArea", name: "Kreis Lippe" },
      { "@type": "AdministrativeArea", name: "Ostwestfalen-Lippe" },
    ],
    description: `Unterwasserfotografie und Fotoshootings in Barntrup, Detmold, Lage und Bad Salzuflen – emotionale Bilder für Kinder, Familien, Veranstaltungen und WeihnachtsMinis in Lippe / OWL.`,
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
      "Fotografie Barntrup",
      "Fotografie Detmold",
      "Fotografie Bad Salzuflen",
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: siteConfig.address.city,
      addressRegion: siteConfig.address.region,
      addressCountry: siteConfig.address.country,
    },
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

export function getImageGallerySchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: "AquaFotos Galerie – Unterwasserfotografie Barntrup & Lippe",
    description:
      "Ausgewählte Unterwasserbilder von AquaFotos aus Barntrup, Detmold, Lage und Bad Salzuflen: Kinder, Familien, Events und WeihnachtsMinis.",
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
    getPersonSchema(),
    ...getTeamSchemas(),
    getBreadcrumbSchema([{ name: "Start", url: siteConfig.url }]),
  ];
}
