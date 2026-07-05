"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { calculatePhotoTotal, formatEuro } from "@/lib/pricing";
import { sendOrderConfirmation } from "@/lib/email";
import { emailStatusQueryParam } from "@/lib/email-delivery";
import { cartSessionId, setGalleryAccessCookie } from "@/lib/gallery-session";
import { orderIncludesReorderPhotos } from "@/lib/order-reorder";
import { createAndStoreOrderInvoice } from "@/lib/order-invoice";
import { getActivePricing, getCart } from "@/lib/shop-queries";
import { isVoucherGalleryParticipant } from "@/lib/voucher-gallery";
import { markParticipantsOrdered } from "@/lib/actions/participant-workflow";
import {
  finalizeOrderItemsFromPhotoStatus,
  notifyOrderReadyIfComplete,
} from "@/lib/order-checkout";

async function getOrCreateCart(sessionId: string) {
  let cart = await prisma.cart.findFirst({ where: { sessionId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { sessionId } });
  }
  return cart;
}

export async function toggleCartPhoto(
  photoId: string,
  accessCode: string,
): Promise<{ error?: string; success?: boolean; inCart?: boolean; cartCount?: number }> {
  try {
    const sessionId = cartSessionId(accessCode);
    await setGalleryAccessCookie(accessCode);

    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
      include: { participant: { include: { galleryAccess: true } } },
    });

    if (!photo?.participant?.galleryAccess) {
      return { error: "Foto nicht gefunden." };
    }

    if (photo.participant.galleryAccess.accessCode !== sessionId) {
      return { error: "Dieses Foto gehört nicht zu Ihrer Galerie." };
    }

    const cart = await getOrCreateCart(sessionId);
    const existing = await prisma.cartItem.findUnique({
      where: { cartId_photoId: { cartId: cart.id, photoId } },
    });

    if (existing) {
      await prisma.cartItem.delete({ where: { id: existing.id } });
    } else {
      await prisma.cartItem.create({ data: { cartId: cart.id, photoId } });
    }

    const count = await prisma.cartItem.count({ where: { cartId: cart.id } });
    revalidatePath(`/galerie/${sessionId}`);
    revalidatePath("/warenkorb");

    return { success: true, inCart: !existing, cartCount: count };
  } catch {
    return { error: "Warenkorb konnte nicht aktualisiert werden." };
  }
}

export async function togglePhotoFavorite(
  photoId: string,
  participantId: string,
): Promise<{ error?: string; success?: boolean; isFavorite?: boolean }> {
  try {
    const photo = await prisma.photo.findFirst({
      where: { id: photoId, participantId },
    });

    if (!photo) return { error: "Foto nicht gefunden." };

    const existing = await prisma.photoFavorite.findUnique({
      where: { photoId_participantId: { photoId, participantId } },
    });

    if (existing) {
      await prisma.photoFavorite.delete({ where: { id: existing.id } });
    } else {
      await prisma.photoFavorite.create({ data: { photoId, participantId } });
    }

    const access = await prisma.galleryAccess.findUnique({ where: { participantId } });
    if (access) revalidatePath(`/galerie/${access.accessCode}`);

    return { success: true, isFavorite: !existing };
  } catch {
    return { error: "Favorit konnte nicht gespeichert werden." };
  }
}

export async function removeFromCart(
  photoId: string,
  accessCode: string,
): Promise<{ success?: boolean; error?: string }> {
  try {
    const sessionId = cartSessionId(accessCode);
    const cart = await prisma.cart.findFirst({ where: { sessionId } });
    if (!cart) return { success: true };

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, photoId },
    });

    revalidatePath(`/galerie/${sessionId}`);
    revalidatePath("/warenkorb");
    return { success: true };
  } catch {
    return { error: "Entfernen fehlgeschlagen." };
  }
}

export async function createCheckoutSession(params: {
  accessCode: string;
  email: string;
  bindingConfirmed: boolean;
}): Promise<{ error?: string; url?: string | null }> {
  try {
    if (!params.bindingConfirmed) {
      return { error: "Bitte bestätigen Sie die verbindliche Bestellung." };
    }

    const sessionId = cartSessionId(params.accessCode);
    const cart = await getCart(sessionId);
    if (!cart || cart.items.length === 0) {
      return { error: "Warenkorb ist leer." };
    }

    const pricing = await getActivePricing();
    const count = cart.items.length;
    const eventId = cart.items[0]?.photo?.eventId;
    const photoIds = cart.items.map((item) => item.photoId);
    const isReorder = await orderIncludesReorderPhotos(photoIds);
    const participantId = cart.items[0]?.photo?.participantId;
    const voucherIncluded =
      !!participantId &&
      !isReorder &&
      (await isVoucherGalleryParticipant(participantId));
    const totalCents = voucherIncluded ? 0 : calculatePhotoTotal(count, pricing);
    const orderNumber = `AF-${Date.now().toString(36).toUpperCase()}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerEmail: params.email,
        status: voucherIncluded ? "PAID" : "PENDING_PAYMENT",
        subtotalCents: totalCents,
        totalCents,
        paidAt: voucherIncluded ? new Date() : undefined,
        bindingConfirmed: true,
        isReorder,
        eventId,
        items: {
          create: cart.items.map((item, index) => ({
            photoId: item.photoId,
            priceCents: voucherIncluded
              ? 0
              : index === 0
                ? pricing.firstImagePrice
                : index === 1
                  ? pricing.secondImagePrice
                  : pricing.additionalPrice,
            position: index + 1,
          })),
        },
      },
      include: {
        items: { orderBy: { position: "asc" } },
      },
    });

    const invoice = await createAndStoreOrderInvoice(order.id);
    if (!invoice) {
      return { error: "Rechnung konnte nicht erstellt werden." };
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const orderStatusLink = `${appUrl}/bestellung/${encodeURIComponent(orderNumber)}?code=${encodeURIComponent(params.accessCode)}`;

    const delivery = await sendOrderConfirmation({
      to: params.email,
      orderNumber,
      total: formatEuro(totalCents),
      orderStatusLink,
      items: order.items.map((item) => ({
        label: `Foto ${item.position}`,
        price: formatEuro(item.priceCents),
      })),
      invoicePdf: invoice.pdfBytes,
      voucherIncluded,
    });

    if (voucherIncluded && participantId) {
      await markParticipantsOrdered([participantId]);
    }

    const { allReady } = await finalizeOrderItemsFromPhotoStatus(order.id);
    if (allReady) {
      await notifyOrderReadyIfComplete(order.id);
    }

    revalidatePath(`/bestellung/${orderNumber}`);
    revalidatePath(`/galerie/${sessionId}`);

    const mailStatus = emailStatusQueryParam(delivery);

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    revalidatePath("/warenkorb");

    return {
      url: allReady
        ? `/bestellung/${encodeURIComponent(orderNumber)}?code=${encodeURIComponent(params.accessCode)}`
        : `/bestellung/erfolg?order=${encodeURIComponent(orderNumber)}&mail=${mailStatus}&code=${encodeURIComponent(params.accessCode)}`,
    };
  } catch (error) {
    console.error("[createCheckoutSession]", error);
    return { error: "Bestellung konnte nicht erstellt werden." };
  }
}
