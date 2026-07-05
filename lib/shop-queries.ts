import { prisma } from "@/lib/prisma";
import {
  calculatePhotoTotal,
  DEFAULT_PRICING,
  getPricingBreakdown,
} from "@/lib/pricing";
import { getPhotoDisplayUrl } from "@/lib/gallery";
import { cartSessionId, getGalleryAccessCookie } from "@/lib/gallery-session";
import { orderIncludesReorderPhotos } from "@/lib/order-reorder";
import { isVoucherGalleryAccessCode } from "@/lib/voucher-gallery";

export async function getActivePricing() {
  try {
    const config = await prisma.pricingConfig.findFirst({
      where: { active: true },
      orderBy: { updatedAt: "desc" },
    });
    return config ?? DEFAULT_PRICING;
  } catch {
    return DEFAULT_PRICING;
  }
}

export async function getGalleryShopState(accessCode: string, participantId: string) {
  const sessionId = cartSessionId(accessCode);

  try {
    const [cart, favorites] = await Promise.all([
      prisma.cart.findFirst({
        where: { sessionId },
        include: { items: { select: { photoId: true } } },
      }),
      prisma.photoFavorite.findMany({
        where: { participantId },
        select: { photoId: true },
      }),
    ]);

    return {
      cartIds: cart?.items.map((i) => i.photoId) ?? [],
      favoriteIds: favorites.map((f) => f.photoId),
    };
  } catch {
    return { cartIds: [], favoriteIds: [] };
  }
}

export async function getCart(sessionId: string) {
  try {
    return await prisma.cart.findFirst({
      where: { sessionId },
      include: {
        items: {
          include: { photo: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  } catch {
    return null;
  }
}

export async function getCartSummary(accessCode?: string | null) {
  const code = accessCode ?? (await getGalleryAccessCookie());
  if (!code) return null;

  const sessionId = cartSessionId(code);
  const pricing = await getActivePricing();
  const cart = await getCart(sessionId);
  const photoIds = cart?.items.map((item) => item.photoId) ?? [];
  const hasReorderItems = photoIds.length > 0 ? await orderIncludesReorderPhotos(photoIds) : false;
  const isVoucherIncluded =
    !hasReorderItems && (await isVoucherGalleryAccessCode(sessionId));

  if (!cart) {
    return {
      accessCode: sessionId,
      items: [],
      totalCents: 0,
      count: 0,
      breakdown: [],
      pricing,
      hasReorderItems: false,
      isVoucherIncluded,
    };
  }

  const count = cart.items.length;

  return {
    accessCode: sessionId,
    items: cart.items.map((item) => ({
      id: item.id,
      photoId: item.photoId,
      filename: item.photo.filename,
      src: getPhotoDisplayUrl(item.photo),
    })),
    count,
    totalCents: isVoucherIncluded ? 0 : calculatePhotoTotal(count, pricing),
    breakdown: isVoucherIncluded
      ? [{ label: "Im Gutschein enthalten", cents: 0 }]
      : getPricingBreakdown(count, pricing),
    pricing,
    hasReorderItems,
    isVoucherIncluded,
  };
}
