import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VoucherSuccessView } from "@/components/voucher/voucher-success-view";
import { Button } from "@/components/ui/button";
import { getVouchersByPurchaseNumber } from "@/lib/voucher-queries";
import { createPageMetadata } from "@/lib/seo";

type Props = {
  searchParams: Promise<{ purchase?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { purchase } = await searchParams;
  return createPageMetadata({
    title: purchase ? `Gutschein ${purchase} – AquaFotos` : "Gutschein erfolgreich – AquaFotos",
    description: "Ihr AquaFotos Gutschein mit Code und QR-Code.",
    path: "/gutschein/erfolg",
  });
}

export default async function GutscheinErfolgPage({ searchParams }: Props) {
  const { purchase } = await searchParams;
  if (!purchase) notFound();

  const vouchers = await getVouchersByPurchaseNumber(purchase);
  const paid = vouchers.filter((v) => v.status === "PAID" || v.status === "REDEEMED");

  if (paid.length === 0) {
    return (
      <div className="section-padding pt-28 text-center">
        <h1 className="font-display text-2xl font-bold text-aqua-900">Zahlung ausstehend</h1>
        <p className="mt-2 text-slate-600">
          Sobald die Zahlung eingegangen ist, erscheinen hier Ihre Gutschein-Codes.
        </p>
        <Button asChild className="mt-6">
          <Link href="/gutschein/warenkorb">Zurück zum Warenkorb</Link>
        </Button>
      </div>
    );
  }

  const totalCents = paid.reduce((sum, v) => sum + v.priceCents, 0);

  return (
    <div className="section-padding pt-28">
      <div className="mx-auto max-w-4xl">
        <VoucherSuccessView
          purchaseNumber={purchase}
          buyerEmail={paid[0].buyerEmail}
          totalCents={totalCents}
          vouchers={paid.map((v) => ({
            code: v.code,
            title: v.product.title,
            preferredDate: v.preferredDate?.toISOString() ?? null,
            qrDataUrl: v.qrDataUrl,
            priceCents: v.priceCents,
          }))}
        />
      </div>
    </div>
  );
}
