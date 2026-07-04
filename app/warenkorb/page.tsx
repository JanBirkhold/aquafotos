import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { CartView } from "@/components/cart/cart-view";
import {
  CartNotice,
  OrderInfoNotices,
} from "@/components/sections/cart-notice";
import { auth } from "@/lib/auth";
import { getCartSummary } from "@/lib/shop-queries";
import { getGalleryAccessCookie } from "@/lib/gallery-session";
import { createPageMetadata } from "@/lib/seo";
import { getBreadcrumbSchema } from "@/lib/schema";
import { siteConfig } from "@/lib/site-config";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = createPageMetadata({
  title: "Warenkorb – Bilder bestellen",
  description:
    "Ihr AquaFotos Warenkorb: Unterwasserfotos auswählen und online bestellen. Hochauflösende Dateien nach dem Kauf ohne Wasserzeichen.",
  path: "/warenkorb",
});

export default async function WarenkorbPage() {
  const session = await auth();
  const accessCode = await getGalleryAccessCookie();
  const cart = await getCartSummary(accessCode);

  let customerEmail = session?.user?.email ?? "";
  if (accessCode && !customerEmail) {
    const access = await prisma.galleryAccess.findUnique({
      where: { accessCode },
      include: { participant: true },
    });
    customerEmail = access?.participant.email ?? "";
  }

  return (
    <>
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Start", url: siteConfig.url },
          { name: "Warenkorb", url: `${siteConfig.url}/warenkorb` },
        ])}
      />
      <div className="section-padding pt-28">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-center font-display text-4xl font-bold text-aqua-900">
            Warenkorb
          </h1>

          <div className="mt-10">
            {!cart || cart.count === 0 ? (
              <CartNotice empty />
            ) : (
              <CartView cart={cart} customerEmail={customerEmail} />
            )}
          </div>

          {accessCode && cart && cart.count === 0 && (
            <p className="mt-4 text-center text-sm text-slate-500">
              <Link href={`/galerie/${accessCode}`} className="text-aqua-600 hover:underline">
                Zur Galerie zurück
              </Link>
            </p>
          )}

          <OrderInfoNotices />
        </div>
      </div>
    </>
  );
}
