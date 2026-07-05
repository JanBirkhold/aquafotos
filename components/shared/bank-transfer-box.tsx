import { CopyButton } from "@/components/voucher/copy-button";
import type { BankTransferDetails } from "@/lib/voucher-payment";
import { formatIbanDisplay } from "@/lib/voucher-payment";
import { formatEuro } from "@/lib/pricing";

type Props = {
  bank: BankTransferDetails;
  reference: string;
  totalCents: number;
  payerName?: string;
  title?: string;
  description?: string;
  referenceLabel?: string;
  referenceCopyLabel?: string;
};

export function BankTransferBox({
  bank,
  reference,
  totalCents,
  payerName,
  title = "Zahlung per Überweisung",
  description = "Bitte überweisen Sie den Betrag innerhalb von 7 Tagen. Geben Sie als Verwendungszweck exakt die Referenznummer an.",
  referenceLabel = "Verwendungszweck",
  referenceCopyLabel = "Referenz kopieren",
}: Props) {
  const ibanDisplay = bank.iban ? formatIbanDisplay(bank.iban) : "Bitte kontaktieren Sie uns";

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
      <h2 className="font-display text-lg font-semibold text-amber-950">{title}</h2>
      <p className="mt-2 text-sm text-amber-900/90">{description}</p>

      <dl className="mt-5 space-y-3 rounded-xl bg-white/80 p-4 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <dt className="text-slate-500">Empfänger</dt>
          <dd className="font-medium text-aqua-900">{bank.accountHolder}</dd>
        </div>
        {bank.bankName && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <dt className="text-slate-500">Bank</dt>
            <dd>{bank.bankName}</dd>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <dt className="text-slate-500">IBAN</dt>
          <dd className="flex items-center gap-2 font-mono text-aqua-900">
            {ibanDisplay}
            {bank.iban && <CopyButton value={bank.iban.replace(/\s/g, "")} label="IBAN kopieren" />}
          </dd>
        </div>
        {bank.bic && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <dt className="text-slate-500">BIC</dt>
            <dd className="font-mono">{bank.bic}</dd>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <dt className="text-slate-500">Betrag</dt>
          <dd className="text-lg font-bold text-aqua-900">{formatEuro(totalCents)}</dd>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <dt className="text-slate-500">{referenceLabel}</dt>
          <dd className="flex items-center gap-2 font-mono font-semibold text-aqua-900">
            {reference}
            <CopyButton value={reference} label={referenceCopyLabel} />
          </dd>
        </div>
        {payerName && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <dt className="text-slate-500">Kontoinhaber (Referenz)</dt>
            <dd>{payerName}</dd>
          </div>
        )}
      </dl>
    </section>
  );
}
