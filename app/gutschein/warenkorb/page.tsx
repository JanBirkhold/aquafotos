import type { Metadata } from "next";
import { VoucherCartEmpty } from "@/components/voucher/voucher-cart-empty";
import { VoucherCartView } from "@/components/voucher/voucher-cart-view";
import { VoucherFlowActions } from "@/components/voucher/voucher-flow-actions";
import { getVoucherCartSummary } from "@/lib/voucher-queries";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Gutschein-Warenkorb – AquaFotos",
  description: "Gutschein-Warenkorb – verbindlich bestellen und per Überweisung bezahlen.",
  path: "/gutschein/warenkorb",
});

export default async function GutscheinWarenkorbPage() {
  const cart = await getVoucherCartSummary();

  return (
    <div className="section-padding pt-28">
      <div className="mx-auto max-w-7xl">
        <VoucherFlowActions className="justify-center" />
        <h1 className="mt-8 text-center font-display text-4xl font-bold text-aqua-900">
          Gutschein-Warenkorb
        </h1>
        <p className="mt-3 text-center text-sm text-slate-600">
          Beschenkte Person & Nachricht optional · Wunschtermin bei der Einlösung · Zahlung per
          Überweisung
        </p>

        <div className="mt-10">
          {cart.count === 0 ? (
            <VoucherCartEmpty />
          ) : (
            <VoucherCartView cart={cart} />
          )}
        </div>
      </div>
    </div>
  );
}
