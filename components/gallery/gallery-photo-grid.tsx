"use client";

import { useCallback, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Download, Heart, Loader2, ShoppingCart, ZoomIn } from "lucide-react";
import { GalleryPhotoLightbox } from "@/components/gallery/gallery-photo-lightbox";
import { Button } from "@/components/ui/button";
import { toggleCartPhoto, togglePhotoFavorite } from "@/lib/actions/shop";
import { orderItemStatusLabels, orderItemStatusColors } from "@/lib/order-workflow";
import { cn } from "@/lib/utils";
import type { GalleryPhoto } from "@/lib/gallery";
import type { OrderItemStatus } from "@prisma/client";

export type { GalleryPhoto };

export type GalleryPhotoOrderItem = {
  status: OrderItemStatus;
  downloadUrl: string | null;
  hasFinalFile?: boolean;
  isPreviouslyOrdered?: boolean;
};

type Props = {
  accessCode: string;
  participantId: string;
  photos: GalleryPhoto[];
  initialCartIds: string[];
  initialFavoriteIds: string[];
  orderItemsByPhotoId?: Record<string, GalleryPhotoOrderItem>;
};

export function GalleryPhotoGrid({
  accessCode,
  participantId,
  photos,
  initialCartIds,
  initialFavoriteIds,
  orderItemsByPhotoId = {},
}: Props) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const [cartIds, setCartIds] = useState<string[]>(initialCartIds);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(initialFavoriteIds);

  const cartSet = useCallback(() => new Set(cartIds), [cartIds]);
  const favoriteSet = useCallback(() => new Set(favoriteIds), [favoriteIds]);

  function handleToggleCart(photoId: string) {
    setActionError(null);
    const previous = cartIds;
    const optimistic = previous.includes(photoId)
      ? previous.filter((id) => id !== photoId)
      : [...previous, photoId];
    setCartIds(optimistic);

    startTransition(async () => {
      const result = await toggleCartPhoto(photoId, accessCode);
      if (result.error) {
        setCartIds(previous);
        setActionError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleToggleFavorite(photoId: string) {
    setActionError(null);
    const previous = favoriteIds;
    const optimistic = previous.includes(photoId)
      ? previous.filter((id) => id !== photoId)
      : [...previous, photoId];
    setFavoriteIds(optimistic);

    startTransition(async () => {
      const result = await togglePhotoFavorite(photoId, participantId);
      if (result.error) {
        setFavoriteIds(previous);
        setActionError(result.error);
        return;
      }
      router.refresh();
    });
  }

  const cart = cartSet();
  const favorites = favoriteSet();

  return (
    <>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          {cartIds.length} Bild{cartIds.length !== 1 ? "er" : ""} ausgewählt
          {favoriteIds.length > 0 &&
            ` · ${favoriteIds.length} Favorit${favoriteIds.length !== 1 ? "en" : ""}`}
          {" · "}
          <span className="text-slate-500">Tippen zum Vergrößern</span>
        </p>
        <Button asChild size="sm" disabled={cartIds.length === 0}>
          <Link href="/warenkorb">
            <ShoppingCart className="h-4 w-4" aria-hidden />
            Zum Warenkorb ({cartIds.length})
          </Link>
        </Button>
      </div>

      {actionError && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {actionError}
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo, index) => {
          const inCart = cart.has(photo.id);
          const isFavorite = favorites.has(photo.id);
          const orderItem = orderItemsByPhotoId[photo.id];
          const isPreviouslyOrdered = orderItem?.isPreviouslyOrdered ?? false;
          const isDimmed = isPreviouslyOrdered && !inCart;

          return (
            <article
              key={photo.id}
              className={cn(
                "overflow-hidden rounded-2xl bg-aqua-950/5 ring-2 transition-shadow",
                inCart && isPreviouslyOrdered && "ring-amber-400 shadow-md",
                inCart && !isPreviouslyOrdered && "ring-aqua-500 shadow-md",
                !inCart && isDimmed && "ring-slate-200",
                !inCart && !isDimmed && "ring-transparent",
              )}
            >
              <button
                type="button"
                className={cn(
                  "group relative block aspect-[3/4] w-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-500 focus-visible:ring-offset-2",
                  isDimmed && "cursor-zoom-in",
                )}
                onClick={() => setActiveIndex(index)}
                aria-label={`${photo.filename} in Großansicht öffnen`}
              >
                <Image
                  src={photo.src}
                  alt={photo.filename}
                  fill
                  className={cn(
                    "object-cover transition-transform duration-300 group-hover:scale-[1.02]",
                    isDimmed && "scale-[1.02] grayscale-[35%] opacity-75",
                  )}
                  sizes="(max-width:768px) 50vw, 25vw"
                  unoptimized={photo.src.startsWith("/uploads/")}
                />
                {isDimmed && (
                  <span
                    className="pointer-events-none absolute inset-0 bg-slate-100/25"
                    aria-hidden
                  />
                )}
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-4xl font-bold text-white/20">
                  AquaFotos
                </span>
                <span className="absolute inset-0 flex items-center justify-center bg-aqua-950/0 transition-colors group-hover:bg-aqua-950/15">
                  <span className="rounded-full bg-white/90 p-2.5 text-aqua-700 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                    <ZoomIn className="h-5 w-5" aria-hidden />
                  </span>
                </span>
                {isFavorite && (
                  <span className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-red-500 shadow">
                    <Heart className="h-4 w-4 fill-current" aria-hidden />
                  </span>
                )}
                {orderItem && (
                  <span
                    className={cn(
                      "absolute left-2 top-2 max-w-[calc(100%-1rem)] truncate rounded-full px-2 py-1 text-[10px] font-medium shadow sm:text-xs",
                      orderItem.downloadUrl
                        ? "bg-green-600 text-white"
                        : isPreviouslyOrdered && !inCart
                          ? "bg-slate-700/85 text-white"
                          : orderItemStatusColors[orderItem.status],
                    )}
                  >
                    {orderItem.downloadUrl
                      ? "Download bereit"
                      : isPreviouslyOrdered && !inCart
                        ? "Bereits bestellt"
                        : inCart && isPreviouslyOrdered
                          ? "Nachbestellung"
                          : orderItemStatusLabels[orderItem.status]}
                  </span>
                )}
              </button>
              <div className="flex gap-2 p-3">
                {orderItem?.downloadUrl ? (
                  <Button asChild size="sm" className="flex-1">
                    <a
                      href={`${orderItem.downloadUrl}?code=${encodeURIComponent(accessCode)}`}
                      download={photo.filename}
                    >
                      <Download className="h-4 w-4" aria-hidden />
                      Download
                    </a>
                  </Button>
                ) : (
                  <>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className={cn("flex-1", isFavorite && "border-red-200 text-red-600")}
                  disabled={pending}
                  aria-pressed={isFavorite}
                  onClick={() => handleToggleFavorite(photo.id)}
                >
                  <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} aria-hidden />
                  <span className="sr-only">Favorit</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="flex-1"
                  variant={
                    inCart
                      ? isPreviouslyOrdered
                        ? "secondary"
                        : "secondary"
                      : isPreviouslyOrdered
                        ? "outline"
                        : "default"
                  }
                  disabled={pending}
                  aria-pressed={inCart}
                  onClick={() => handleToggleCart(photo.id)}
                >
                  {pending ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : inCart ? (
                    <>
                      <Check className="h-4 w-4" aria-hidden />
                      {isPreviouslyOrdered ? "Nachbestellung" : "Im Warenkorb"}
                    </>
                  ) : isPreviouslyOrdered ? (
                    "Nachbestellen"
                  ) : (
                    "Auswählen"
                  )}
                </Button>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <GalleryPhotoLightbox
        photos={photos}
        activeIndex={activeIndex}
        onClose={() => setActiveIndex(null)}
        onNavigate={setActiveIndex}
        cartIds={cart}
        favoriteIds={favorites}
        pending={pending}
        orderItemsByPhotoId={orderItemsByPhotoId}
        onToggleCart={handleToggleCart}
        onToggleFavorite={handleToggleFavorite}
      />
    </>
  );
}
