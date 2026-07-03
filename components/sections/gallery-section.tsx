"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ZoomIn, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import {
  galleryItems,
  type GalleryItem,
} from "@/lib/gallery-data";
import {
  galleryCategoryLabels,
  type GalleryCategory,
} from "@/lib/site-config";
import { cn } from "@/lib/utils";

const categories: Array<GalleryCategory | "all"> = [
  "all",
  "unterwasser",
  "kinder",
  "familien",
  "events",
  "weihnachtsminis",
];

function aspectClass(aspect: GalleryItem["aspect"]) {
  switch (aspect) {
    case "portrait":
      return "row-span-2";
    case "landscape":
      return "col-span-2";
    default:
      return "";
  }
}

type GallerySectionProps = {
  showAll?: boolean;
  limit?: number;
};

export function GallerySection({ showAll = false, limit = 8 }: GallerySectionProps) {
  const [activeCategory, setActiveCategory] = useState<GalleryCategory | "all">("all");
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  const filtered =
    activeCategory === "all"
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeCategory);

  const displayed = showAll ? filtered : filtered.slice(0, limit);

  const closeLightbox = useCallback(() => setLightboxItem(null), []);

  return (
    <section
      id="galerie"
      aria-labelledby="gallery-heading"
      className="section-padding bg-gradient-to-b from-white to-aqua-50/30"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="gallery-heading"
            className="font-display text-3xl font-bold text-aqua-900 sm:text-4xl"
          >
            Galerie
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Einblicke in unsere Unterwasserfotografie – Kinder, Familien, Events
            und WeihnachtsMinis aus Barntrup und der Region Lippe.
          </p>
          <p className="mt-3 text-sm text-slate-500">
            Vorschaubilder können geschützt bzw. mit Wasserzeichen dargestellt
            werden. Nach dem Kauf erhalten Sie hochauflösende Dateien ohne
            Wasserzeichen.
          </p>
        </div>

        <div
          className="mt-8 flex flex-wrap justify-center gap-2"
          role="tablist"
          aria-label="Galerie-Kategorien"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                activeCategory === cat
                  ? "bg-aqua-600 text-white shadow-md shadow-aqua-600/25"
                  : "glass text-slate-600 hover:bg-white/80",
              )}
            >
              {cat === "all" ? "Alle" : galleryCategoryLabels[cat]}
            </button>
          ))}
        </div>

        <div className="mt-10 grid auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[220px] md:grid-cols-4 lg:gap-4">
          {displayed.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setLightboxItem(item)}
              className={cn(
                "group relative overflow-hidden rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-500 focus-visible:ring-offset-2",
                aspectClass(item.aspect),
              )}
              aria-label={`${item.alt} vergrößern`}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-aqua-950/0 transition-colors group-hover:bg-aqua-950/20" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                <span className="rounded-full bg-white/90 p-3 text-aqua-700 shadow-lg">
                  <ZoomIn className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
              <span className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-black/75 px-2.5 py-1 text-xs font-semibold tracking-wide text-white shadow-md backdrop-blur-sm">
                AquaFotos
              </span>
            </button>
          ))}
        </div>

        {!showAll && filtered.length > limit && (
          <div className="mt-10 text-center">
            <Button asChild variant="outline" size="lg">
              <Link href="/galerie">Alle Bilder ansehen</Link>
            </Button>
          </div>
        )}
      </div>

      <Dialog open={!!lightboxItem} onOpenChange={(open) => !open && closeLightbox()}>
        <DialogContent
          hideClose
          className="max-h-[100dvh] w-[calc(100%-2rem)] max-w-5xl overflow-visible border-none bg-transparent p-0 shadow-none sm:w-full"
        >
          <DialogClose
            className="fixed right-4 top-4 z-[60] flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/90 text-aqua-900 shadow-lg backdrop-blur-sm transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-aqua-400 focus:ring-offset-2 focus:ring-offset-transparent sm:right-6 sm:top-6 sm:h-12 sm:w-12"
            aria-label="Bild schließen"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.25} />
          </DialogClose>

          {lightboxItem && (
            <div className="overflow-hidden rounded-2xl bg-aqua-950 shadow-2xl sm:rounded-3xl">
              <div className="relative aspect-[4/3] w-full bg-aqua-950">
                <Image
                  src={lightboxItem.src}
                  alt={lightboxItem.alt}
                  fill
                  sizes="(max-width: 1200px) 100vw, 80vw"
                  className="object-contain"
                  priority
                />
              </div>
              <p className="border-t border-white/10 bg-aqua-950 px-4 py-3 text-sm leading-relaxed text-white sm:px-5 sm:py-4 sm:text-base">
                {lightboxItem.alt}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
