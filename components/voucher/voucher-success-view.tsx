import Image from "next/image";
import Link from "next/link";
import { Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatEuro } from "@/lib/pricing";

export type VoucherSuccessItem = {
  code: string;
  title: string;
  preferredDate: string | null;
  qrDataUrl: string | null;
  priceCents: number;
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

      <ul className="grid gap-6 sm:grid-cols-2">
        {vouchers.map((voucher) => (
          <li
            key={voucher.code}
            className="overflow-hidden rounded-2xl border border-aqua-100 bg-white shadow-sm"
          >
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
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link
                  href={`/gutschein/einloesen?code=${encodeURIComponent(voucher.code)}`}
                >
                  Jetzt einlösen
                </Link>
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <p className="rounded-2xl border border-aqua-100 bg-aqua-50/50 p-4 text-center text-sm text-slate-600">
        Die Codes und QR-Codes wurden auch per E-Mail versendet. Zum Einlösen scannen oder Code
        auf der Einlöse-Seite eingeben.
      </p>
    </div>
  );
}
