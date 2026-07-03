import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/galerie",
    "/angebote",
    "/ueber-uns",
    "/veranstaltungen",
    "/warenkorb",
    "/login",
    "/impressum",
    "/datenschutz",
  ];

  return routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/galerie" || route === "/angebote" ? 0.9 : 0.7,
  }));
}
