import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { GalleryPhotoGrid } from "@/components/gallery/gallery-photo-grid";
import { GalleryOrderStatusBar } from "@/components/gallery/gallery-order-status-bar";
import { verifyGalleryAccess } from "@/lib/gallery-queries";
import { getActivePricing, getGalleryShopState } from "@/lib/shop-queries";
import { auth } from "@/lib/auth";
import { emailsMatch } from "@/lib/gallery-access";
import { getPhotoDisplayUrl } from "@/lib/gallery";
import { cartSessionId } from "@/lib/gallery-session";
import { formatEuro, calculatePhotoTotal } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import {
  getOrdersForGalleryAccess,
  serializeCustomerOrder,
  serializeOrderItem,
} from "@/lib/order-queries";
import { getPreviouslyOrderedPhotoIds } from "@/lib/order-reorder";
import { createPageMetadata } from "@/lib/seo";
import type { OrderItemStatus } from "@prisma/client";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return createPageMetadata({
    title: "Ihre Galerie – AquaFotos",
    description: "Persönliche Bildergalerie – Vorschaubilder mit Wasserzeichen.",
    path: `/galerie/${(await params).code}`,
  });
}

export default async function CustomerGalleryPage({ params }: Props) {
  const { code } = await params;
  const normalizedCode = cartSessionId(code);
  const access = await verifyGalleryAccess(normalizedCode);

  if (!access) notFound();

  const session = await auth();
  if (
    !session?.user?.email ||
    !emailsMatch(session.user.email, access.participant.email)
  ) {
    redirect(`/bilder-bestellen?code=${encodeURIComponent(normalizedCode)}`);
  }

  const photos = access.participant.photos;
  const shop = await getGalleryShopState(normalizedCode, access.participant.id);
  const pricing = await getActivePricing();
  const priceExample = calculatePhotoTotal(3, pricing);

  const galleryPhotos = photos.map((photo) => ({
    id: photo.id,
    src: getPhotoDisplayUrl(photo),
    filename: photo.filename,
  }));

  const orders = await getOrdersForGalleryAccess(normalizedCode);
  const orderViews = orders.map(serializeCustomerOrder);
  const previouslyOrderedPhotoIds = await getPreviouslyOrderedPhotoIds(
    access.participant.id,
  );

  const orderItemsByPhotoId: Record<
    string,
    {
      status: OrderItemStatus;
      downloadUrl: string | null;
      hasFinalFile?: boolean;
      isPreviouslyOrdered: boolean;
    }
  > = {};

  for (const order of orders) {
    for (const item of order.items) {
      if (orderItemsByPhotoId[item.photoId]) continue;
      const serialized = serializeOrderItem(item);
      orderItemsByPhotoId[item.photoId] = {
        status: serialized.status,
        downloadUrl: serialized.downloadUrl,
        hasFinalFile: serialized.hasFinalFile,
        isPreviouslyOrdered: previouslyOrderedPhotoIds.has(item.photoId),
      };
    }
  }

  for (const photoId of previouslyOrderedPhotoIds) {
    if (!orderItemsByPhotoId[photoId]) {
      orderItemsByPhotoId[photoId] = {
        status: "READY",
        downloadUrl: null,
        isPreviouslyOrdered: true,
      };
    }
  }

  const hasPreviouslyOrderedPhotos = previouslyOrderedPhotoIds.size > 0;

  return (
    <div className="section-padding pt-28">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-aqua-900">
              Galerie: {access.participant.childName}
            </h1>
            <p className="mt-2 text-slate-600">
              {access.participant.event.title} · Code{" "}
              <span className="font-mono">{access.accessCode}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/warenkorb">
                <ShoppingCart className="h-4 w-4" aria-hidden />
                Warenkorb
                {shop.cartIds.length > 0 ? ` (${shop.cartIds.length})` : ""}
              </Link>
            </Button>
          </div>
        </div>

        <GalleryOrderStatusBar orders={orderViews} accessCode={access.accessCode} />

        {hasPreviouslyOrderedPhotos && (
          <p className="mt-4 rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-sm text-amber-950">
            <span className="font-medium">Schon bestellt?</span> Bereits gekaufte Bilder sind in
            der Galerie leicht ausgegraut. Für Familie, Freunde oder zusätzliche Formate können
            Sie jederzeit per{" "}
            <span className="font-medium">„Nachbestellen“</span> weitere Kopien erwerben – wir
            bearbeiten jede Nachbestellung gerne erneut für Sie.
          </p>
        )}

        <p className="mt-4 rounded-2xl border border-aqua-100 bg-aqua-50/50 p-4 text-sm text-slate-600">
          Vorschaubilder haben Wasserzeichen und geringe Auflösung. Nach dem Kauf erhalten Sie
          hochauflösende Dateien ohne Wasserzeichen. 3 Bilder = {formatEuro(priceExample)}.
          Wählen Sie Bilder aus und bestellen Sie über den Warenkorb.
        </p>

        {photos.length === 0 ? (
          <p className="mt-12 text-center text-slate-500">
            Ihre Bilder werden gerade bearbeitet. Sie erhalten eine E-Mail, sobald die Galerie
            bereit ist.
          </p>
        ) : (
          <GalleryPhotoGrid
            accessCode={access.accessCode}
            participantId={access.participant.id}
            photos={galleryPhotos}
            initialCartIds={shop.cartIds}
            initialFavoriteIds={shop.favoriteIds}
            orderItemsByPhotoId={orderItemsByPhotoId}
          />
        )}
      </div>
    </div>
  );
}
