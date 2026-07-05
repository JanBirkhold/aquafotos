import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VoucherPendingView } from "@/components/voucher/voucher-pending-view";
import { VoucherSuccessView } from "@/components/voucher/voucher-success-view";
import { getVouchersByPurchaseNumber } from "@/lib/voucher-queries";
import { mapVoucherGalleryAccess } from "@/lib/voucher-gallery";
import { getBankTransferDetails } from "@/lib/voucher-payment";
import { shootingTypeLabels } from "@/lib/shooting-types";
import { createPageMetadata } from "@/lib/seo";

type Props = {
  searchParams: Promise<{ purchase?: string; mail?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { purchase } = await searchParams;
  return createPageMetadata({
    title: purchase ? `Gutschein ${purchase} – AquaFotos` : "Gutschein-Bestellung – AquaFotos",
    description: "Status Ihrer AquaFotos Gutschein-Bestellung.",
    path: "/gutschein/erfolg",
  });
}

export default async function GutscheinErfolgPage({ searchParams }: Props) {
  const { purchase, mail } = await searchParams;
  if (!purchase) notFound();

  const emailStatus =
    mail === "sent" || mail === "stub" || mail === "failed" ? mail : undefined;

  const vouchers = await getVouchersByPurchaseNumber(purchase);
  if (vouchers.length === 0) notFound();

  const first = vouchers[0];
  const totalCents = vouchers.reduce((sum, v) => sum + v.priceCents, 0);
  const paid = vouchers.filter((v) => v.status === "PAID" || v.status === "REDEEMED");
  const isPaid = paid.length === vouchers.length;

  if (isPaid) {
    return (
      <div className="section-padding pt-28">
        <div className="mx-auto max-w-4xl">
          <VoucherSuccessView
            purchaseNumber={purchase}
            buyerEmail={first.buyerEmail}
            totalCents={totalCents}
            vouchers={paid.map((v) => {
              const req = v.individualShootingReq;
              const galleryEmail = req?.email ?? v.buyerEmail;
              const gallery = mapVoucherGalleryAccess(req?.participant ?? null, {
                email: galleryEmail,
              });
              const confirmedDate = req?.confirmedDate?.toISOString().slice(0, 10) ?? null;
              return {
                code: v.code,
                title: v.product.title,
                preferredDate: v.preferredDate?.toISOString() ?? null,
                qrDataUrl: v.qrDataUrl,
                priceCents: v.priceCents,
                status: v.status,
                redeemedAt: v.redeemedAt?.toISOString() ?? null,
                confirmedDate,
                confirmedTime: req?.confirmedTime ?? null,
                confirmedLocation: req?.confirmedLocation ?? null,
                redeemEmail: req?.email ?? null,
                hasGalleryAccess: !!gallery,
                galleryReady: gallery?.galleryReady ?? false,
                gallery,
              };
            })}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding pt-28">
      <div className="mx-auto max-w-4xl">
        <VoucherPendingView
          purchaseNumber={purchase}
          buyerName={first.buyerName}
          buyerEmail={first.buyerEmail}
          totalCents={totalCents}
          bank={getBankTransferDetails()}
          emailStatus={emailStatus}
          items={vouchers.map((v) => ({
            title: v.product.title,
            shootingTypeLabel: v.product.shootingType
              ? shootingTypeLabels[v.product.shootingType]
              : null,
            preferredDate: v.preferredDate?.toISOString() ?? null,
            recipientName: v.recipientName,
            priceCents: v.priceCents,
          }))}
        />
      </div>
    </div>
  );
}
