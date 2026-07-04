import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CustomerOrderStatusView } from "@/components/orders/customer-order-status-view";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import {
  serializeOrderItem,
  verifyOrderAccess,
} from "@/lib/order-queries";
import { createPageMetadata } from "@/lib/seo";
import { getGalleryAccessCookie } from "@/lib/gallery-session";

type Props = {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ code?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orderNumber } = await params;
  return createPageMetadata({
    title: `Bestellstatus ${orderNumber} – AquaFotos`,
    description: "Status Ihrer Bildbestellung und Download fertiger Fotos.",
    path: `/bestellung/${orderNumber}`,
  });
}

export default async function OrderStatusPage({ params, searchParams }: Props) {
  const { orderNumber } = await params;
  const { code: codeParam } = await searchParams;
  const session = await auth();
  const cookieCode = await getGalleryAccessCookie();
  const accessCode = codeParam ?? cookieCode;

  const { ok, order } = await verifyOrderAccess(
    orderNumber,
    accessCode,
    session?.user?.email,
  );

  if (!order) {
    return (
      <div className="section-padding pt-28 text-center">
        <h1 className="font-display text-2xl font-bold text-aqua-900">
          Bestellung nicht gefunden
        </h1>
        <Button asChild className="mt-6">
          <Link href="/bilder-bestellen">Zur Galerie</Link>
        </Button>
      </div>
    );
  }

  if (!ok) {
    redirect(
      `/bilder-bestellen?code=${encodeURIComponent(accessCode ?? "")}&order=${encodeURIComponent(orderNumber)}`,
    );
  }

  const view = {
    orderNumber: order.orderNumber,
    status: order.status,
    totalCents: order.totalCents,
    paidAt: order.paidAt?.toISOString() ?? null,
    processingStartedAt: order.processingStartedAt?.toISOString() ?? null,
    readyNotifiedAt: order.readyNotifiedAt?.toISOString() ?? null,
    deliveredAt: order.deliveredAt?.toISOString() ?? null,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map(serializeOrderItem),
  };

  return (
    <div className="section-padding pt-28">
      <div className="mx-auto max-w-3xl">
        <CustomerOrderStatusView order={view} accessCode={accessCode} />
      </div>
    </div>
  );
}
