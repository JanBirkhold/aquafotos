"use client";

import { useCallback, useEffect } from "react";
import Image from "next/image";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { GalleryPhoto } from "@/lib/gallery";
import type { GalleryPhotoOrderItem } from "@/components/gallery/gallery-photo-grid";

type Props = {
  photos: GalleryPhoto[];
  activeIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
  cartIds: Set<string>;
  favoriteIds: Set<string>;
  pending: boolean;
  orderItemsByPhotoId?: Record<string, GalleryPhotoOrderItem>;
  onToggleCart: (photoId: string) => void;
  onToggleFavorite: (photoId: string) => void;
};

export function GalleryPhotoLightbox({
  photos,
  activeIndex,
  onClose,
  onNavigate,
  cartIds,
  favoriteIds,
  pending,
  orderItemsByPhotoId = {},
  onToggleCart,
  onToggleFavorite,
}: Props) {
  const photo = activeIndex !== null ? photos[activeIndex] : null;
  const hasPrev = activeIndex !== null && activeIndex > 0;
  const hasNext = activeIndex !== null && activeIndex < photos.length - 1;

  const goPrev = useCallback(() => {
    if (activeIndex !== null && hasPrev) onNavigate(activeIndex - 1);
  }, [activeIndex, hasPrev, onNavigate]);

  const goNext = useCallback(() => {
    if (activeIndex !== null && hasNext) onNavigate(activeIndex + 1);
  }, [activeIndex, hasNext, onNavigate]);

  useEffect(() => {
    if (activeIndex === null) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, onClose, goPrev, goNext]);

  if (!photo || activeIndex === null) return null;

  const inCart = cartIds.has(photo.id);
  const isFavorite = favoriteIds.has(photo.id);
  const orderItem = orderItemsByPhotoId[photo.id];
  const isPreviouslyOrdered = orderItem?.isPreviouslyOrdered ?? false;

  return (
    <Dialog open={activeIndex !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        hideClose
        className="max-h-[100dvh] w-[calc(100%-1rem)] max-w-6xl overflow-visible border-none bg-transparent p-0 shadow-none sm:w-full"
        aria-describedby="gallery-lightbox-caption"
      >
        <DialogClose
          className="fixed right-3 top-3 z-[60] flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/90 text-aqua-900 shadow-lg backdrop-blur-sm transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-aqua-400 sm:right-5 sm:top-5"
          aria-label="Lightbox schließen"
        >
          <X className="h-5 w-5" strokeWidth={2.25} />
        </DialogClose>

        {hasPrev && (
          <button
            type="button"
            onClick={goPrev}
            className="fixed left-2 top-1/2 z-[60] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/90 text-aqua-900 shadow-lg backdrop-blur-sm transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-aqua-400 sm:left-4 sm:h-14 sm:w-14"
            aria-label="Vorheriges Bild"
          >
            <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" />
          </button>
        )}

        {hasNext && (
          <button
            type="button"
            onClick={goNext}
            className="fixed right-2 top-1/2 z-[60] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/90 text-aqua-900 shadow-lg backdrop-blur-sm transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-aqua-400 sm:right-4 sm:h-14 sm:w-14"
            aria-label="Nächstes Bild"
          >
            <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" />
          </button>
        )}

        <div className="overflow-hidden rounded-2xl bg-aqua-950 shadow-2xl sm:rounded-3xl">
          <div className="relative flex max-h-[calc(100dvh-8rem)] min-h-[50dvh] w-full items-center justify-center bg-aqua-950">
            <Image
              src={photo.src}
              alt={photo.filename}
              width={1600}
              height={1200}
              className="max-h-[calc(100dvh-8rem)] w-auto max-w-full object-contain"
              unoptimized={photo.src.startsWith("/uploads/")}
              priority
            />
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-6xl font-bold text-white/15 sm:text-7xl">
              AquaFotos
            </span>
          </div>

          <div
            id="gallery-lightbox-caption"
            className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-aqua-950 px-4 py-3 sm:px-5 sm:py-4"
          >
            <div className="min-w-0 text-white">
              <p className="truncate text-sm font-medium sm:text-base">{photo.filename}</p>
              <p className="text-xs text-white/60">
                Bild {activeIndex + 1} von {photos.length} · Pfeiltasten ← →
                {isPreviouslyOrdered && !inCart ? " · Bereits bestellt" : ""}
                {inCart && isPreviouslyOrdered ? " · Nachbestellung" : ""}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className={cn(
                  "border-white/20 bg-white/10 text-white hover:bg-white/20",
                  isFavorite && "border-red-300 text-red-300",
                )}
                disabled={pending}
                aria-pressed={isFavorite}
                onClick={() => onToggleFavorite(photo.id)}
              >
                <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} aria-hidden />
                Favorit
              </Button>
              <Button
                type="button"
                size="sm"
                variant={inCart ? "secondary" : isPreviouslyOrdered ? "outline" : "default"}
                className={cn(
                  isPreviouslyOrdered &&
                    !inCart &&
                    "border-amber-200/60 bg-amber-500/20 text-white hover:bg-amber-500/30",
                )}
                disabled={pending}
                aria-pressed={inCart}
                onClick={() => onToggleCart(photo.id)}
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
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
