import Link from "next/link";
import { Clock } from "lucide-react";
import { VoucherBankTransferBox } from "@/components/voucher/voucher-bank-transfer-box";
import { VoucherInvoiceActions } from "@/components/voucher/voucher-invoice-actions";
import { Button } from "@/components/ui/button";
import type { BankTransferDetails } from "@/lib/voucher-payment";
import { emailStatusMessage } from "@/lib/email-delivery";
import { cn } from "@/lib/utils";
import { formatEuro } from "@/lib/pricing";

type OrderItem = {
  title: string;
  shootingTypeLabel: string | null;
  preferredDate: string | null;
  recipientName: string | null;
  priceCents: number;
};

type Props = {
  purchaseNumber: string;
  buyerName: string;
  buyerEmail: string;
  totalCents: number;
  bank: BankTransferDetails;
  items: OrderItem[];
  emailStatus?: "sent" | "stub" | "failed";
};

export function VoucherPendingView({
  purchaseNumber,
  buyerName,
  buyerEmail,
  totalCents,
  bank,
  items,
  emailStatus,
}: Props) {
  const emailLine = emailStatusMessage(emailStatus, {
    sent: `Bestätigung inkl. Rechnung wurde an ${buyerEmail} gesendet.`,
    stub: "E-Mail-Versand ist derzeit nicht aktiv. Bitte notieren Sie die Kaufnummer – Überweisungsdaten und Rechnung stehen unten.",
    failed:
      "Bestätigungs-E-Mail konnte nicht versendet werden. Bitte notieren Sie die Kaufnummer unten.",
  });
  return (
    <div className="space-y-8">
      <div className="text-center">
        <Clock className="mx-auto h-12 w-12 text-amber-600" aria-hidden />
        <h1 className="mt-4 font-display text-3xl font-bold text-aqua-900">
          Bestellung eingegangen
        </h1>
        <p className="mt-2 text-slate-600">
          Kaufnummer <span className="font-mono font-medium">{purchaseNumber}</span> ·{" "}
          {formatEuro(totalCents)}
        </p>
        {emailLine && (
          <p
            className={cn(
              "mt-1 text-sm",
              emailStatus === "sent" ? "text-slate-500" : "text-amber-800",
            )}
            role={emailStatus === "sent" ? undefined : "note"}
          >
            {emailLine}
          </p>
        )}
      </div>

      <VoucherBankTransferBox
        bank={bank}
        purchaseNumber={purchaseNumber}
        totalCents={totalCents}
        buyerName={buyerName}
      />

      <section className="rounded-2xl border border-aqua-100 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-aqua-900">Rechnung</h2>
        <p className="mt-2 text-sm text-slate-600">
          Die Rechnung können Sie hier ansehen, herunterladen oder ausdrucken.
        </p>
        <div className="mt-4">
          <VoucherInvoiceActions purchaseNumber={purchaseNumber} />
        </div>
      </section>

      <section className="rounded-2xl border border-aqua-100 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-aqua-900">Ihre Gutscheine</h2>
        <ul className="mt-4 divide-y divide-slate-100">
          {items.map((item, index) => (
            <li key={index} className="flex flex-wrap items-start justify-between gap-2 py-3">
              <div>
                <p className="font-medium text-aqua-900">{item.title}</p>
                {item.shootingTypeLabel && (
                  <p className="text-sm text-slate-500">{item.shootingTypeLabel}</p>
                )}
                {item.recipientName && (
                  <p className="text-sm text-slate-500">Für: {item.recipientName}</p>
                )}
                {item.preferredDate && (
                  <p className="text-sm text-slate-600">
                    Wunschtermin:{" "}
                    {new Date(item.preferredDate).toLocaleDateString("de-DE")}
                  </p>
                )}
              </div>
              <p className="font-semibold text-aqua-800">{formatEuro(item.priceCents)}</p>
            </li>
          ))}
        </ul>
      </section>

      <p className="rounded-2xl border border-aqua-100 bg-aqua-50/50 p-4 text-center text-sm text-slate-600">
        Code und QR-Code erhalten Sie per E-Mail, sobald wir Ihre Überweisung geprüft haben.
        Diese Seite können Sie speichern – die Kaufnummer ist Ihr Zahlungsreferenz.
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild variant="outline">
          <Link href="/gutschein">Weitere Gutscheine</Link>
        </Button>
        <Button asChild>
          <Link href={`/gutschein/erfolg?purchase=${encodeURIComponent(purchaseNumber)}`}>
            Status prüfen
          </Link>
        </Button>
      </div>
    </div>
  );
}
