import { revalidatePath } from "next/cache";
import { sendNewEventNotification } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { shootingTypeLabels } from "@/lib/shooting-types";
import type { ShootingEvent } from "@prisma/client";

export async function notifyShootingEventSubscribers(
  event: Pick<ShootingEvent, "id" | "title" | "shootingType" | "location">,
  overrides?: { subject?: string; bodyHtml?: string },
): Promise<number> {
  const subscribers = await prisma.shootingNotification.findMany({
    where: {
      active: true,
      shootingType: event.shootingType,
      OR: [{ location: null }, { location: event.location }],
    },
  });

  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://aquafotos.com"}/shootings/${event.id}`;

  for (const sub of subscribers) {
    await sendNewEventNotification({
      to: sub.email,
      shootingType: shootingTypeLabels[event.shootingType],
      location: event.location,
      eventTitle: event.title,
      url,
      overrides,
    });
  }

  return subscribers.length;
}

export async function finalizePublishedShootingEvent(
  event: Pick<ShootingEvent, "id" | "title" | "shootingType" | "location">,
): Promise<number> {
  const notified = await notifyShootingEventSubscribers(event);
  revalidatePath("/shootings");
  revalidatePath("/admin/shootings");
  return notified;
}

export async function publishShootingEventRecord(
  eventId: string,
  overrides?: { subject?: string; bodyHtml?: string },
): Promise<{ notified: number }> {
  const event = await prisma.shootingEvent.update({
    where: { id: eventId },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  });

  const notified = await notifyShootingEventSubscribers(event, overrides);

  revalidatePath("/admin");
  revalidatePath("/admin/shootings");
  revalidatePath("/shootings");

  return { notified };
}
