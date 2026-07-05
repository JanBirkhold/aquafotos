import Link from "next/link";
import { CalendarClock, Gift } from "lucide-react";
import { VoucherConfirmedAppointment } from "@/components/voucher/voucher-confirmed-appointment";
import { VoucherGalleryAccessPanel } from "@/components/voucher/voucher-gallery-access-panel";
import { VoucherRedeemFlowStatusCard } from "@/components/voucher/voucher-redeem-flow-timeline";
import type { VoucherRedeemLookupView } from "@/lib/voucher-queries";
import { Button } from "@/components/ui/button";

type Props = {
  voucher: VoucherRedeemLookupView;
  headline?: string;
  message?: string;
};

export function VoucherRedeemStatusView({ voucher, headline, message }: Props) {
  if (voucher.status === "PENDING_PAYMENT") {
    return (
      <div className="space-y-8">
        <VoucherRedeemFlowStatusCard voucher={voucher} preferredDate={voucher.preferredDate} />
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold text-amber-950">
            Zahlung noch ausstehend
          </h2>
          <p className="mt-2 text-sm text-amber-900">
            Dieser Gutschein ist noch nicht freigegeben. Nach Zahlungseingang senden wir Code &
            QR-Code per E-Mail – danach können Sie hier einlösen.
          </p>
          <p className="mt-3 font-mono text-xs text-amber-800">{voucher.code}</p>
          <div className="mt-6">
            <Button asChild variant="outline">
              <Link href="/kontakt">Fragen zur Zahlung</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const hasConfirmedAppointment = !!voucher.confirmedDate;

  return (
    <div className="space-y-8">
      <VoucherRedeemFlowStatusCard voucher={voucher} preferredDate={voucher.preferredDate} />

      <div className="rounded-2xl border border-violet-200 bg-violet-50/70 p-6 sm:p-8">
        <Gift className="h-10 w-10 text-violet-700" aria-hidden />
        <h2 className="mt-4 font-display text-xl font-semibold text-violet-950">
          {headline ??
            (hasConfirmedAppointment
              ? "Termin bestätigt – Ihr Shooting steht"
              : "Terminanfrage liegt vor")}
        </h2>
        <p className="mt-2 text-sm text-violet-900">
          {message ??
            (hasConfirmedAppointment
              ? "Termin, Kalender-Download und Galerie-Status finden Sie unten."
              : "Wir prüfen Ihren Wunschtermin und melden uns zur Bestätigung.")}
        </p>

        <div className="mt-6 space-y-4 border-t border-violet-200/80 pt-6">
          {hasConfirmedAppointment ? (
            <>
              <VoucherConfirmedAppointment
                confirmedDate={voucher.confirmedDate!}
                confirmedTime={voucher.confirmedTime}
                confirmedLocation={voucher.confirmedLocation}
                eventTitle={voucher.title}
                voucherCode={voucher.code}
                purchaseNumber={voucher.purchaseNumber}
              />
              <VoucherGalleryAccessPanel
                gallery={voucher.gallery}
                confirmedDate={voucher.confirmedDate}
                email={voucher.verifiedEmail}
                childName={voucher.childName ?? undefined}
              />
            </>
          ) : (
            <div className="rounded-xl border border-violet-200 bg-white/80 p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-violet-950">
                <CalendarClock className="h-4 w-4 shrink-0" aria-hidden />
                Termin in Bearbeitung
              </p>
              {voucher.preferredDate && (
                <p className="mt-2 text-sm text-violet-900">
                  Ihr Wunschtermin:{" "}
                  <strong>
                    {new Date(`${voucher.preferredDate}T12:00:00`).toLocaleDateString("de-DE")}
                  </strong>
                </p>
              )}
              {voucher.parentName && (
                <p className="mt-1 text-sm text-slate-600">
                  {voucher.parentName}
                  {voucher.childName ? ` · ${voucher.childName}` : ""}
                </p>
              )}
              <p className="mt-3 text-xs text-slate-500">
                Sobald der Termin bestätigt ist, erscheinen hier Kalender-Download und Galerie-Zugang.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href={`/gutschein/erfolg?purchase=${encodeURIComponent(voucher.purchaseNumber)}`}>
              Gutschein-Übersicht
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/gutschein/einloesen">Anderen Gutschein abrufen</Link>
          </Button>
          <Button asChild>
            <Link href="/kontakt">Kontakt</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
