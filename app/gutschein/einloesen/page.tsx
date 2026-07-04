import type { Metadata } from "next";
import { VoucherRedeemForm } from "@/components/voucher/voucher-redeem-form";
import { lookupVoucherForDisplay } from "@/lib/voucher-queries";
import { createPageMetadata } from "@/lib/seo";

type Props = {
  searchParams: Promise<{ code?: string }>;
};

export const metadata: Metadata = createPageMetadata({
  title: "Gutschein einlösen – AquaFotos",
  description: "AquaFotos Gutschein-Code oder QR-Code einlösen und Termin zur Anmeldung reservieren.",
  path: "/gutschein/einloesen",
});

export default async function GutscheinEinloesenPage({ searchParams }: Props) {
  const { code: codeParam } = await searchParams;
  const initialCode = codeParam?.trim() ?? "";
  const voucher = initialCode ? await lookupVoucherForDisplay(initialCode) : null;

  return (
    <div className="section-padding pt-28">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold text-aqua-900">Gutschein einlösen</h1>
          <p className="mt-3 text-slate-600">
            Code eingeben oder QR-Code aus der E-Mail scannen – dann Anmeldung mit Ihrem
            Wunschtermin abschließen.
          </p>
        </div>

        <div className="mt-10">
          <VoucherRedeemForm initialCode={initialCode} voucher={voucher} />
        </div>
      </div>
    </div>
  );
}
