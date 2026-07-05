"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { emailFeedbackFromDelivery } from "@/lib/email-delivery";
import { sendParticipantConfirmationEmail } from "@/lib/participant-email";
import { isCoupleShooting } from "@/lib/registration-fields";
import { buildAccessCode, buildQrPayload, generateQrDataUrl } from "@/lib/qr-utils";
import { ShootingType } from "@prisma/client";

const registerSchema = z.object({
  eventId: z.string(),
  slotId: z.string().optional(),
  parentName: z.string().min(2),
  childName: z.string().min(1),
  childAge: z.coerce.number().optional(),
  email: z.string().email(),
  phone: z.string().min(6),
  gdprConsent: z.literal(true),
});

export type RegisterFormState = {
  error?: string;
  success?: boolean;
  accessCode?: string;
  emailSent?: boolean;
  emailNotice?: string;
} | null;

export async function registerForEvent(
  _prev: RegisterFormState,
  formData: FormData,
): Promise<RegisterFormState> {
  try {
    const rawSlotId = formData.get("slotId");
    const parsed = registerSchema.safeParse({
      eventId: formData.get("eventId"),
      slotId: rawSlotId && String(rawSlotId) !== "" ? rawSlotId : undefined,
      parentName: formData.get("parentName"),
      childName: formData.get("childName"),
      childAge: formData.get("childAge") || undefined,
      email: formData.get("email"),
      phone: formData.get("phone"),
      gdprConsent: formData.get("gdprConsent") === "on",
    });

    if (!parsed.success) {
      return { error: "Bitte füllen Sie alle Pflichtfelder aus." };
    }

    const event = await prisma.shootingEvent.findUnique({
      where: { id: parsed.data.eventId },
      include: { _count: { select: { participants: true } } },
    });

    if (!event || event.status !== "PUBLISHED") {
      return { error: "Dieses Shooting ist nicht verfügbar." };
    }

    if (event._count.participants >= event.maxParticipants) {
      return { error: "Dieser Termin ist ausgebucht. Bitte Warteliste nutzen." };
    }

    if (parsed.data.slotId) {
      const slot = await prisma.eventSlot.findUnique({
        where: { id: parsed.data.slotId },
        include: { _count: { select: { participants: true } } },
      });

      if (!slot || slot.eventId !== event.id) {
        return { error: "Ungültiger Termin-Slot." };
      }

      if (slot._count.participants >= slot.maxParticipants) {
        return { error: "Dieser Slot ist ausgebucht." };
      }
    }

    const participantNumber =
      (await prisma.participant.count({ where: { eventId: event.id } })) + 1;

    const accessCode = buildAccessCode(event.id, participantNumber);
    const qrCodeValue = buildQrPayload(accessCode);
    const now = new Date();

    await prisma.participant.create({
      data: {
        eventId: event.id,
        slotId: parsed.data.slotId,
        participantNumber,
        parentName: parsed.data.parentName,
        childName: parsed.data.childName,
        childAge: isCoupleShooting(event.category) ? undefined : parsed.data.childAge,
        email: parsed.data.email,
        phone: parsed.data.phone,
        gdprConsent: true,
        gdprConsentAt: now,
        status: "CONFIRMED",
        registrationSource: "WEBSITE",
        confirmedAt: now,
        qrCode: {
          create: {
            code: qrCodeValue,
            qrDataUrl: await generateQrDataUrl(qrCodeValue),
          },
        },
        galleryAccess: {
          create: { accessCode },
        },
      },
    });

    if (event._count.participants + 1 >= event.maxParticipants) {
      await prisma.shootingEvent.update({
        where: { id: event.id },
        data: { status: "FULL" },
      });
    }

    const created = await prisma.participant.findFirst({
      where: { eventId: event.id, participantNumber },
      select: { id: true },
    });

    let emailSent = false;
    let emailNotice: string | undefined;

    if (created) {
      const emailResult = await sendParticipantConfirmationEmail(created.id);
      if (emailResult.delivery) {
        const feedback = emailFeedbackFromDelivery(emailResult.delivery, { saved: true });
        emailSent = feedback.emailSent;
        emailNotice = feedback.emailNotice;
      }
    }

    revalidatePath("/shootings");
    revalidatePath(`/shootings/${event.id}`);

    return { success: true, accessCode, emailSent, emailNotice };
  } catch (error) {
    console.error("[registerForEvent]", error);
    return {
      error:
        "Anmeldung konnte nicht gespeichert werden. Ist die Datenbank erreichbar?",
    };
  }
}

const waitlistSchema = z.object({
  eventId: z.string(),
  parentName: z.string().min(2),
  childName: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
});

export type WaitlistFormState = { error?: string; success?: boolean } | null;

export async function joinWaitlist(
  _prev: WaitlistFormState,
  formData: FormData,
): Promise<WaitlistFormState> {
  try {
    const parsed = waitlistSchema.safeParse({
      eventId: formData.get("eventId"),
      parentName: formData.get("parentName"),
      childName: formData.get("childName") || undefined,
      email: formData.get("email"),
      phone: formData.get("phone") || undefined,
    });

    if (!parsed.success) {
      return { error: "Ungültige Eingaben." };
    }

    const event = await prisma.shootingEvent.findUnique({
      where: { id: parsed.data.eventId },
      select: { allowWaitlist: true },
    });

    if (!event?.allowWaitlist) {
      return { error: "Für dieses Shooting ist keine Warteliste verfügbar." };
    }

    await prisma.waitlistEntry.create({ data: parsed.data });
    revalidatePath(`/shootings/${parsed.data.eventId}`);

    return { success: true };
  } catch (error) {
    console.error("[joinWaitlist]", error);
    return { error: "Warteliste konnte nicht gespeichert werden." };
  }
}

const notifySchema = z.object({
  email: z.string().email(),
  shootingType: z.nativeEnum(ShootingType, {
    message: "Bitte Shooting-Art wählen.",
  }),
  location: z.string().optional(),
});

export async function subscribeToShootingNotifications(formData: FormData) {
  try {
    const parsed = notifySchema.safeParse({
      email: formData.get("email"),
      shootingType: formData.get("shootingType"),
      location: formData.get("location") || undefined,
    });

    if (!parsed.success) {
      return { error: "Bitte gültige E-Mail und Shooting-Art angeben." };
    }

    await prisma.shootingNotification.create({
      data: {
        email: parsed.data.email,
        shootingType: parsed.data.shootingType as ShootingType,
        location: parsed.data.location,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("[subscribeToShootingNotifications]", error);
    return { error: "Anmeldung konnte nicht gespeichert werden." };
  }
}

const individualSchema = z.object({
  parentName: z.string().min(2),
  childName: z.string().optional(),
  email: z.string().email(),
  phone: z.string().min(6),
  shootingType: z.nativeEnum(ShootingType, {
    message: "Bitte Shooting-Art wählen.",
  }),
  preferredDate: z.string().optional(),
  message: z.string().optional(),
});

export async function requestIndividualShooting(formData: FormData) {
  try {
    const parsed = individualSchema.safeParse({
      parentName: formData.get("parentName"),
      childName: formData.get("childName") || undefined,
      email: formData.get("email"),
      phone: formData.get("phone"),
      shootingType: formData.get("shootingType"),
      preferredDate: formData.get("preferredDate") || undefined,
      message: formData.get("message") || undefined,
    });

    if (!parsed.success) {
      return { error: "Bitte alle Pflichtfelder ausfüllen." };
    }

    await prisma.individualShootingRequest.create({
      data: {
        ...parsed.data,
        shootingType: parsed.data.shootingType as ShootingType,
        preferredDate: parsed.data.preferredDate
          ? new Date(parsed.data.preferredDate)
          : undefined,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("[requestIndividualShooting]", error);
    return { error: "Anfrage konnte nicht gespeichert werden." };
  }
}
