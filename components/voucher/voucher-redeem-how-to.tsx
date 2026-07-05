import { VOUCHER_LIFECYCLE_STEPS, VOUCHER_REDEEM_NOTE } from "@/lib/voucher-redeem-content";
import Link from "next/link";

export function VoucherRedeemHowTo() {
  return (
    <section className="mb-10 rounded-2xl border border-aqua-100 bg-aqua-50/40 p-6 sm:p-8">
      <h2 className="font-display text-xl font-semibold text-aqua-900">
        So funktioniert die Einlösung
      </h2>
      <p className="mt-2 text-sm text-slate-600">{VOUCHER_REDEEM_NOTE}</p>
      <ol className="mt-6 space-y-4">
        {VOUCHER_LIFECYCLE_STEPS.slice(2).map((step, index) => (
          <li key={step.title} className="flex gap-4">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-aqua-700 text-sm font-semibold text-white"
              aria-hidden
            >
              {index + 1}
            </span>
            <div>
              <p className="font-medium text-aqua-900">{step.title}</p>
              <p className="mt-0.5 text-sm text-slate-600">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-sm text-slate-600">
        Noch Fragen?{" "}
        <Link href="/info?kategorie=allgemein#gutschein-einloesen" className="text-aqua-700 underline">
          FAQ zur Gutschein-Einlösung
        </Link>
      </p>
    </section>
  );
}
