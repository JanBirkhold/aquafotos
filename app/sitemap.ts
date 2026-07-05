import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/unterwasser",
    "/kita",
    "/baby",
    "/familie",
    "/aktionen",
    "/shootings",
    "/info",
    "/bilder-bestellen",
    "/partner",
    "/kontakt",
    "/galerie",
    "/ueber-uns",
    "/impressum",
    "/datenschutz",
  ];

  return routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/shootings" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route.startsWith("/shoot") ? 0.95 : 0.8,
  }));
}
