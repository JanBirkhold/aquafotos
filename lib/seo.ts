import type { Metadata } from "next";
import { siteConfig } from "./site-config";

const defaultTitle = "AquaFotos Barntrup | Unterwasserfotos & Fotoshootings";
const defaultDescription =
  "Professionelle Unterwasserfotografie in Barntrup: emotionale Shootings für Kinder, Familien und Events. Jetzt Termin bei AquaFotos anfragen.";

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
    images: [
      {
        url: "/images/hero-bg.webp",
        width: 3840,
        height: 2560,
        alt: "Professionelle Unterwasserfotografie bei AquaFotos Barntrup",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/images/hero-bg.webp"],
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
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: `${siteConfig.url}${path}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}${path}`,
    },
    twitter: {
      title,
      description,
    },
  };
}
