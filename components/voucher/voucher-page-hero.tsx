import Image from "next/image";
import Link from "next/link";
import { VoucherFlowActions } from "@/components/voucher/voucher-flow-actions";

export function VoucherPageHero() {
  return (
    <section className="relative min-h-[48vh] overflow-hidden pt-28">
      <div className="absolute inset-0">
        <Image
          src="/images/gallery/unterwasser-02.webp"
          alt="Unterwasser-Gutschein – emotionale Erinnerung verschenken"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-aqua-950/90 via-aqua-900/75 to-aqua-950/55" />
      </div>

      <div className="relative mx-auto max-w-7xl section-padding">
        <div className="max-w-2xl">
          <VoucherFlowActions active="bestellen" variant="hero" />
          <h1 className="mt-6 font-display text-4xl font-bold text-white sm:text-5xl">
            Gutschein verschenken
          </h1>
          <p className="mt-4 text-lg text-aqua-100">
            Unvergessliche Unterwasser- und Familienerinnerungen – hochwertig inszeniert,
            persönlich mit QR-Code nach Zahlungsfreigabe – Wunschtermin bei der Einlösung.
          </p>
          <p className="mt-2 text-sm text-aqua-200/90">
            Zahlung per Überweisung · Code & QR per E-Mail ·{" "}
            <Link href="/info" className="underline underline-offset-2 hover:text-white">
              Info & FAQ
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
