import type { Metadata } from "next";
import { siteConfig } from "./site-config";

const defaultTitle = "AquaFotos Barntrup | Unterwasserfotos Detmold, Lage & Bad Salzuflen";
const defaultDescription =
  "Professionelle Unterwasserfotografie in Barntrup, Detmold, Lage und Bad Salzuflen: emotionale Shootings für Kinder, Familien und Events in Lippe / OWL. Jetzt Termin anfragen.";

const defaultOgImage = {
  url: "/images/hero-bg.webp",
  width: 3840,
  height: 2560,
  alt: "Unterwasserfotografie AquaFotos – Barntrup, Detmold, Lage, Bad Salzuflen",
};

export const baseMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: defaultTitle,
    template: `%s | ${siteConfig.name}`,
  },
  description: defaultDescription,
  keywords: [...siteConfig.geo.keywords],
  authors: [{ name: siteConfig.photographer.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: defaultTitle,
    description: defaultDescription,
    images: [defaultOgImage],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: [defaultOgImage.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export function createPageMetadata({
  title,
  description,
  path,
  noIndex = false,
  image = defaultOgImage.url,
}: {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  image?: string;
}): Metadata {
  const url = `${siteConfig.url}${path}`;
  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      images: [{ url: image, alt: title }],
    },
    twitter: {
      title,
      description,
      images: [image],
    },
    ...(noIndex
      ? {
          robots: {
            index: false,
            follow: false,
            googleBot: { index: false, follow: false },
          },
        }
      : {}),
  };
}
