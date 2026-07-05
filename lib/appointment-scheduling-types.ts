import type { ShootingType } from "@prisma/client";

export type OpenAppointmentRequest = {
  id: string;
  parentName: string;
  childName: string | null;
  email: string;
  phone: string;
  shootingType: ShootingType;
  preferredDate: string | null;
  message: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  voucherId: string | null;
  voucherCode: string | null;
  purchaseNumber: string | null;
  productTitle: string | null;
  needsContact: boolean;
};

export type PlannedAppointmentRequest = OpenAppointmentRequest & {
  requestId: string;
  confirmedDate: string;
  confirmedTime: string | null;
  confirmedLocation: string | null;
  hasGalleryData: boolean;
};

export type ClosedAppointmentRequest = OpenAppointmentRequest & {
  requestId: string;
  confirmedDate: string | null;
  confirmedTime: string | null;
  confirmedLocation: string | null;
  closedAt: string;
};

/** @deprecated Use ClosedAppointmentRequest */
export type CancelledAppointmentRequest = ClosedAppointmentRequest;

export type TerminanfragenTab = "open" | "planned" | "cancelled" | "archived";
