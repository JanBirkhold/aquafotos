"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, ExternalLink, Images } from "lucide-react";
import { GalleryProcessingEmptyState } from "@/components/gallery/gallery-processing-empty-state";
import { OpenGalleryButton } from "@/components/gallery/open-gallery-button";
import { buildBilderBestellenUrl } from "@/lib/gallery-access-url";
import type { VoucherGalleryAccess } from "@/lib/voucher-gallery";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  gallery: VoucherGalleryAccess | null;
  confirmedDate: string | null;
  email?: string;
  childName?: string;
  className?: string;
  compact?: boolean;
};

export function VoucherGalleryAccessPanel({
  gallery,
  confirmedDate,
  email,
  childName,
  className,
  compact = false,
}: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const verifiedEmail = email?.trim();

  if (!confirmedDate) return null;

  async function copyCode() {
    if (!gallery?.accessCode) return;
    try {
      await navigator.clipboard.writeText(gallery.accessCode);
      setMessage("Zugangscode kopiert.");
    } catch {
      setMessage("Kopieren fehlgeschlagen.");
    }
  }

  function renderGalleryOpenButton(label: string, variant: "default" | "outline" = "default") {
    if (!gallery || !verifiedEmail) {
      return (
        <Button asChild variant={variant} size="sm" className="w-full sm:w-auto">
          <Link
            href={buildBilderBestellenUrl(gallery?.accessCode ?? "", {
              email: verifiedEmail,
              auto: !!verifiedEmail,
            })}
          >
            <ExternalLink className="mr-2 h-4 w-4" aria-hidden />
            {label}
          </Link>
        </Button>
      );
    }

    return (
      <OpenGalleryButton
        email={verifiedEmail}
        accessCode={gallery.accessCode}
        variant={variant}
        className="w-full sm:w-auto"
      >
        {label}
      </OpenGalleryButton>
    );
  }

  if (!gallery) {
    return (
      <div
        className={cn(
          "rounded-xl border border-aqua-100 bg-aqua-50/60 p-4 text-left",
          compact && "mt-3 p-3",
          className,
        )}
      >
        <p className="flex items-center gap-2 text-sm font-medium text-aqua-900">
          <Images className="h-4 w-4 shrink-0" aria-hidden />
          Galerie-Zugang
        </p>
        <p className="mt-1 text-sm text-slate-600">
          Nach dem Shooting richten wir Ihre Galerie ein und senden den Zugangscode per E-Mail.
        </p>
      </div>
    );
  }

  if (!gallery.galleryReady) {
    return (
      <div className={cn(compact && "mt-3", className)}>
        <GalleryProcessingEmptyState
          childName={childName ?? "Ihr Kind"}
          email={verifiedEmail}
          accessCode={gallery.accessCode}
          variant="compact"
        />
        <div className="mt-3">{renderGalleryOpenButton("Galerie öffnen", "outline")}</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-green-200 bg-green-50/80 p-4 text-left",
        compact && "mt-3 p-3",
        className,
      )}
    >
      <p className="flex items-center gap-2 text-sm font-medium text-green-900">
        <Images className="h-4 w-4 shrink-0" aria-hidden />
        Galerie bereit · {gallery.photoCount} Bild{gallery.photoCount !== 1 ? "er" : ""}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <code className="rounded-lg bg-white px-3 py-1.5 font-mono text-sm tracking-wide text-aqua-900">
          {gallery.accessCode}
        </code>
        <Button type="button" variant="outline" size="sm" onClick={copyCode}>
          <Copy className="h-4 w-4" aria-hidden />
          Kopieren
        </Button>
      </div>
      <p className="mt-2 text-sm text-green-800">
        Bilder sind im Gutschein enthalten – Auswahl ohne Extra-Preise bestellen.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {renderGalleryOpenButton("Zur Galerie")}
        {!verifiedEmail && (
          <Button asChild variant="outline" size="sm">
            <Link href={gallery.bilderBestellenUrl}>Mit Code anmelden</Link>
          </Button>
        )}
      </div>
      {message && (
        <p className="mt-2 text-xs text-slate-600" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
