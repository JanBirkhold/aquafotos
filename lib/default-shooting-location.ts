import { siteConfig } from "@/lib/site-config";

export function getDefaultShootingLocation(): string {
  const { street, postalCode, city } = siteConfig.address;
  return `${street}, ${postalCode} ${city}`;
}
