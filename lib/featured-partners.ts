export type PartnerPublic = {
  id: string;
  name: string;
  type: "SWIMMING_POOL" | "KITA" | "MIDWIFE" | "FAMILY_CENTER" | "OTHER";
  description: string | null;
  logoUrl: string | null;
  city: string | null;
  websiteUrl: string | null;
};

export const partnerTypeLabels: Record<PartnerPublic["type"], string> = {
  SWIMMING_POOL: "Schwimmbad",
  KITA: "Kita",
  MIDWIFE: "Hebamme",
  FAMILY_CENTER: "Familienzentrum",
  OTHER: "Partner",
};

/** Statische Partner-Logos für die Startseite – ohne Datenbank. */
export const featuredPartners: PartnerPublic[] = [
  {
    id: "vitasol",
    name: "VitaSol Bad Salzuflen",
    type: "SWIMMING_POOL",
    description: "AquaBaby & AquaBambini Termine",
    logoUrl: null,
    city: "Bad Salzuflen",
    websiteUrl: "https://www.vitasol.de",
  },
];
