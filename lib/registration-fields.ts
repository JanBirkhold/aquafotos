import type { ShootingCategory } from "@prisma/client";

export type RegistrationFieldConfig = {
  parentLabel: string;
  childLabel: string;
  showChildAge: boolean;
  childAgeLabel: string;
  waitlistChildPlaceholder: string;
};

const defaults: RegistrationFieldConfig = {
  parentLabel: "Name Elternteil *",
  childLabel: "Name Kind *",
  showChildAge: true,
  childAgeLabel: "Alter Kind",
  waitlistChildPlaceholder: "Name Kind",
};

const byCategory: Partial<Record<ShootingCategory, Partial<RegistrationFieldConfig>>> = {
  COUPLE: {
    parentLabel: "Name Partner/in 1 *",
    childLabel: "Name Partner/in 2 *",
    showChildAge: false,
    waitlistChildPlaceholder: "Name Partner/in 2",
  },
  FAMILY: {
    parentLabel: "Name Ansprechpartner *",
    childLabel: "Familienname *",
    childAgeLabel: "Alter jüngstes Kind (optional)",
    waitlistChildPlaceholder: "Familienname",
  },
};

export function getRegistrationFields(category: ShootingCategory): RegistrationFieldConfig {
  return { ...defaults, ...byCategory[category] };
}

export function isCoupleShooting(category: ShootingCategory): boolean {
  return category === "COUPLE";
}
