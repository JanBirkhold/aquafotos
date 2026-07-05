import type { Metadata } from "next";
import { VoucherFlowActions } from "@/components/voucher/voucher-flow-actions";
import { VoucherRedeemForm } from "@/components/voucher/voucher-redeem-form";
import { VoucherRedeemHowTo } from "@/components/voucher/voucher-redeem-how-to";
import { VOUCHER_REDEEM_NOTE } from "@/lib/voucher-redeem-content";
import { createPageMetadata } from "@/lib/seo";

type Props = {
  searchParams: Promise<{ code?: string; email?: string }>;
};

export const metadata: Metadata = createPageMetadata({
  title: "Gutschein einlösen – AquaFotos",
  description:
    "AquaFotos Gutschein einlösen: Terminanfrage für Ihr individuelles Shooting – wir bestätigen Ihren Wunschtermin persönlich.",
  path: "/gutschein/einloesen",
});

export default async function GutscheinEinloesenPage({ searchParams }: Props) {
  const { code: codeParam, email: emailParam } = await searchParams;
  const initialCode = codeParam?.trim() ?? "";
  const initialEmail = emailParam?.trim() ?? "";

  return (
    <div className="section-padding pt-28">
      <div className="mx-auto max-w-4xl">
        <VoucherFlowActions active="einloesen" className="justify-center" />
        <div className="mt-8 text-center">
          <h1 className="font-display text-4xl font-bold text-aqua-900">Gutschein einlösen</h1>
          <p className="mt-3 text-slate-600">
            Code und E-Mail aus der Gutschein-E-Mail – Terminstatus, Kalender-Download und Galerie
            abrufen oder neue Terminanfrage senden.
          </p>
          <p className="mt-2 text-sm text-slate-500">{VOUCHER_REDEEM_NOTE}</p>
        </div>

        <div className="mt-10">
          <VoucherRedeemHowTo />
          <VoucherRedeemForm initialCode={initialCode} initialEmail={initialEmail} />
        </div>
      </div>
    </div>
  );
}
