import Image from "next/image";
import Link from "next/link";
import { Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoucherConfirmedAppointment } from "@/components/voucher/voucher-confirmed-appointment";
import { VoucherFlowTimeline } from "@/components/voucher/voucher-flow-timeline";
import { VoucherRedeemFlowTimeline } from "@/components/voucher/voucher-redeem-flow-timeline";
import { VoucherGalleryAccessPanel } from "@/components/voucher/voucher-gallery-access-panel";
import { VoucherInvoiceActions } from "@/components/voucher/voucher-invoice-actions";
import type { VoucherGalleryAccess } from "@/lib/voucher-gallery";
import type { VoucherFlowInput } from "@/lib/voucher-workflow";
import { formatEuro } from "@/lib/pricing";

export type VoucherSuccessItem = VoucherFlowInput & {
  code: string;
  title: string;
  preferredDate: string | null;
  qrDataUrl: string | null;
  priceCents: number;
  redeemedAt: string | null;
  confirmedTime: string | null;
  confirmedLocation: string | null;
  redeemEmail: string | null;
  gallery: VoucherGalleryAccess | null;
};

type Props = {
  purchaseNumber: string;
  buyerEmail: string;
  totalCents: number;
  vouchers: VoucherSuccessItem[];
};

export function VoucherSuccessView({
  purchaseNumber,
  buyerEmail,
  totalCents,
  vouchers,
}: Props) {
  const showPageTimeline = vouchers.length === 1;

  function StatusTimeline({ voucher }: { voucher: VoucherSuccessItem }) {
    if (voucher.status === "REDEEMED") {
      return (
        <VoucherRedeemFlowTimeline
          voucher={{
            status: voucher.status,
            confirmedDate: voucher.confirmedDate,
            galleryReady: voucher.gallery?.galleryReady ?? false,
          }}
          preferredDate={voucher.preferredDate}
          layout="horizontal"
        />
      );
    }
    return <VoucherFlowTimeline voucher={voucher} layout="horizontal" />;
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <Gift className="mx-auto h-12 w-12 text-aqua-600" aria-hidden />
        <h1 className="mt-4 font-display text-3xl font-bold text-aqua-900">
          Gutschein-Kauf erfolgreich
        </h1>
        <p className="mt-2 text-slate-600">
          Kaufnummer <span className="font-mono">{purchaseNumber}</span> ·{" "}
          {formatEuro(totalCents)} · Bestätigung an {buyerEmail}
        </p>
      </div>

      {showPageTimeline && (
        <section className="rounded-2xl border border-aqua-100 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="sr-only">Gutschein-Status</h2>
          <StatusTimeline voucher={vouchers[0]} />
        </section>
      )}

      <ul className="grid gap-6 sm:grid-cols-2">
        {vouchers.map((voucher) => (
          <li
            key={voucher.code}
            className="overflow-hidden rounded-2xl border border-aqua-100 bg-white shadow-sm"
          >
            {!showPageTimeline && (
              <div className="border-b border-aqua-100 bg-slate-50/80 px-4 py-4">
                <StatusTimeline voucher={voucher} />
              </div>
            )}
            <div className="bg-aqua-700 px-5 py-4 text-white">
              <p className="font-display text-lg font-semibold">{voucher.title}</p>
              {voucher.preferredDate && (
                <p className="mt-1 text-sm text-aqua-100">
                  Wunschtermin:{" "}
                  {new Date(voucher.preferredDate).toLocaleDateString("de-DE")}
                </p>
              )}
            </div>
            <div className="flex flex-col items-center p-5 text-center">
              {voucher.qrDataUrl && (
                <Image
                  src={voucher.qrDataUrl}
                  alt={`QR-Code ${voucher.code}`}
                  width={180}
                  height={180}
                  className="rounded-xl border border-slate-100"
                  unoptimized
                />
              )}
              <p className="mt-4 text-sm text-slate-600">Gutschein-Code</p>
              <p className="font-mono text-xl font-bold tracking-wide text-aqua-900">
                {voucher.code}
              </p>
              {voucher.confirmedDate ? (
                <>
                  <VoucherConfirmedAppointment
                    confirmedDate={voucher.confirmedDate}
                    confirmedTime={voucher.confirmedTime}
                    confirmedLocation={voucher.confirmedLocation}
                    eventTitle={voucher.title}
                    voucherCode={voucher.code}
                    purchaseNumber={purchaseNumber}
                  />
                  <VoucherGalleryAccessPanel
                    gallery={voucher.gallery}
                    confirmedDate={voucher.confirmedDate}
                    email={voucher.redeemEmail ?? undefined}
                    className="mt-4 w-full"
                  />
                </>
              ) : voucher.status === "REDEEMED" ? (
                <div className="mt-4 space-y-2">
                  <p className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-800">
                    Eingelöst
                    {voucher.redeemedAt &&
                      ` · ${new Date(voucher.redeemedAt).toLocaleDateString("de-DE")}`}
                  </p>
                  <p className="text-xs text-slate-600">
                    Terminanfrage liegt vor – wir melden uns zur Bestätigung.
                  </p>
                </div>
              ) : (
                <Button asChild variant="outline" size="sm" className="mt-4">
                  <Link
                    href={`/gutschein/einloesen?code=${encodeURIComponent(voucher.code)}`}
                  >
                    Jetzt einlösen
                  </Link>
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>

      <section className="rounded-2xl border border-aqua-100 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-aqua-900">Rechnung</h2>
        <p className="mt-2 text-sm text-slate-600">
          Rechnung ansehen, herunterladen oder ausdrucken.
        </p>
        <div className="mt-4">
          <VoucherInvoiceActions purchaseNumber={purchaseNumber} />
        </div>
      </section>

      <p className="rounded-2xl border border-aqua-100 bg-aqua-50/50 p-4 text-center text-sm text-slate-600">
        Die Codes und QR-Codes wurden auch per E-Mail versendet. Zum Einlösen scannen oder Code
        auf der Einlöse-Seite eingeben.
      </p>
    </div>
  );
}
