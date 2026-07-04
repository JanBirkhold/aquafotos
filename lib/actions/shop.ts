"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { calculatePhotoTotal, formatEuro } from "@/lib/pricing";
import { sendOrderConfirmation } from "@/lib/email";
import { cartSessionId, setGalleryAccessCookie } from "@/lib/gallery-session";
import { markParticipantsOrdered } from "@/lib/actions/participant-workflow";
import { orderIncludesReorderPhotos } from "@/lib/order-reorder";
import { getActivePricing, getCart } from "@/lib/shop-queries";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

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
}): Promise<{ error?: string; url?: string | null; demo?: boolean }> {
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
    const totalCents = calculatePhotoTotal(count, pricing);
    const orderNumber = `AF-${Date.now().toString(36).toUpperCase()}`;
    const eventId = cart.items[0]?.photo?.eventId;
    const photoIds = cart.items.map((item) => item.photoId);
    const isReorder = await orderIncludesReorderPhotos(photoIds);

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerEmail: params.email,
        status: "PENDING_PAYMENT",
        subtotalCents: totalCents,
        totalCents,
        bindingConfirmed: true,
        isReorder,
        eventId,
        items: {
          create: cart.items.map((item, index) => ({
            photoId: item.photoId,
            priceCents:
              index === 0
                ? pricing.firstImagePrice
                : index === 1
                  ? pricing.secondImagePrice
                  : pricing.additionalPrice,
            position: index + 1,
          })),
        },
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    if (stripe) {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: params.email,
        line_items: cart.items.map((item, index) => ({
          price_data: {
            currency: "eur",
            product_data: {
              name: `AquaFotos Bild ${index + 1}`,
            },
            unit_amount:
              index === 0
                ? pricing.firstImagePrice
                : index === 1
                  ? pricing.secondImagePrice
                  : pricing.additionalPrice,
          },
          quantity: 1,
        })),
        success_url: `${appUrl}/bestellung/erfolg?order=${orderNumber}`,
        cancel_url: `${appUrl}/warenkorb`,
        metadata: { orderId: order.id },
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { stripeSessionId: session.id },
      });

      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      await markParticipantsOrdered(
        cart.items.map((i) => i.photo.participantId).filter((id): id is string => !!id),
      );
      revalidatePath("/warenkorb");

      return { url: session.url };
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { status: "PAID", paidAt: new Date() },
    });

    await sendOrderConfirmation({
      to: params.email,
      orderNumber,
      total: formatEuro(totalCents),
      orderStatusLink: `${appUrl}/bestellung/${encodeURIComponent(orderNumber)}?code=${encodeURIComponent(params.accessCode)}`,
    });

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    await markParticipantsOrdered(
      cart.items.map((i) => i.photo.participantId).filter((id): id is string => !!id),
    );
    revalidatePath("/warenkorb");

    return {
      url: `/bestellung/erfolg?order=${orderNumber}`,
      demo: true,
    };
  } catch {
    return { error: "Bestellung konnte nicht erstellt werden." };
  }
}
