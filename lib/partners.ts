import type { PartnerType } from "@prisma/client";

export const partnerTypeLabels: Record<PartnerType, string> = {
  SWIMMING_POOL: "Schwimmbad",
  KITA: "Kita",
  MIDWIFE: "Hebamme",
  FAMILY_CENTER: "Familienzentrum",
};

export const partnerLogoRequirements = {
  title: "Logo-Anforderungen für die Website",
  items: [
    "Format: PNG (transparent) oder SVG – kein JPG mit weißem Hintergrund",
    "Mindestgröße: 400 × 200 px (Querformat) oder 240 × 240 px (Quadrat)",
    "Empfohlen: 800 × 400 px für Retina-Displays",
    "Seitenverhältnis: 2:1 bis 3:1 (Quer) oder 1:1 (Quadrat)",
    "Max. Dateigröße: 500 KB",
    "Kein Text im Logo kleiner als 12 px bei 400 px Breite",
  ],
  acceptedTypes: ["image/png", "image/svg+xml", "image/webp"],
  maxBytes: 500 * 1024,
  minWidth: 200,
  minHeight: 120,
} as const;

export type PartnerPublic = {
  id: string;
  name: string;
  type: PartnerType;
  description: string | null;
  logoUrl: string | null;
  city: string | null;
  websiteUrl: string | null;
};
