import Link from "next/link";
import { Clock } from "lucide-react";
import { BankTransferBox } from "@/components/shared/bank-transfer-box";
import { OrderInvoiceActions } from "@/components/orders/order-invoice-actions";
import { Button } from "@/components/ui/button";
import type { BankTransferDetails } from "@/lib/voucher-payment";
import { emailStatusMessage } from "@/lib/email-delivery";
import { cn } from "@/lib/utils";
import { formatEuro } from "@/lib/pricing";

type Props = {
  orderNumber: string;
  customerEmail: string;
  customerName?: string | null;
  totalCents: number;
  itemCount: number;
  bank: BankTransferDetails;
  invoiceUrl?: string | null;
  accessCode?: string | null;
  emailStatus?: "sent" | "stub" | "failed";
};

export function OrderPendingView({
  orderNumber,
  customerEmail,
  customerName,
  totalCents,
  itemCount,
  bank,
  invoiceUrl,
  accessCode,
  emailStatus,
}: Props) {
  const emailLine = emailStatusMessage(emailStatus, {
    sent: `Bestätigung inkl. Rechnung wurde an ${customerEmail} gesendet.`,
    stub: "E-Mail-Versand ist derzeit nicht aktiv. Bitte notieren Sie die Bestellnummer – Überweisungsdaten und Rechnung stehen unten.",
    failed:
      "Bestätigungs-E-Mail konnte nicht versendet werden. Bitte notieren Sie die Bestellnummer und nutzen Sie die Rechnung unten.",
  });

  return (
    <div className="space-y-8">
      <div className="text-center">
        <Clock className="mx-auto h-12 w-12 text-amber-600" aria-hidden />
        <h1 className="mt-4 font-display text-3xl font-bold text-aqua-900">
          Bestellung eingegangen
        </h1>
        <p className="mt-2 text-slate-600">
          Bestellnummer <span className="font-mono font-medium">{orderNumber}</span> ·{" "}
          {formatEuro(totalCents)}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {itemCount} Bild{itemCount !== 1 ? "er" : ""}
        </p>
        {emailLine && (
          <p
            className={cn(
              "mt-2 text-sm",
              emailStatus === "sent" ? "text-slate-500" : "text-amber-800",
            )}
            role={emailStatus === "sent" ? undefined : "note"}
          >
            {emailLine}
          </p>
        )}
      </div>

      <BankTransferBox
        bank={bank}
        reference={orderNumber}
        totalCents={totalCents}
        payerName={customerName ?? undefined}
        description="Bitte überweisen Sie den Betrag innerhalb von 7 Tagen. Nach Zahlungseingang beginnen wir mit der Bearbeitung Ihrer Bilder."
        referenceCopyLabel="Bestellnummer kopieren"
      />

      <section className="rounded-2xl border border-aqua-100 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-aqua-900">Rechnung</h2>
        <p className="mt-2 text-sm text-slate-600">
          Die Rechnung können Sie hier ansehen, herunterladen oder ausdrucken.
        </p>
        <div className="mt-4">
          <OrderInvoiceActions
            orderNumber={orderNumber}
            invoiceUrl={invoiceUrl}
            accessCode={accessCode}
          />
        </div>
      </section>

      <p className="rounded-2xl border border-aqua-100 bg-aqua-50/50 p-4 text-center text-sm text-slate-600">
        Sobald Ihre Überweisung bei uns eingegangen ist, bearbeiten wir Ihre Bilder. Sie werden
        per E-Mail informiert, sobald die fertigen Dateien zum Download bereitstehen.
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild variant="outline">
          <Link href={`/bestellung/${encodeURIComponent(orderNumber)}${accessCode ? `?code=${encodeURIComponent(accessCode)}` : ""}`}>
            Bestellstatus verfolgen
          </Link>
        </Button>
      </div>
    </div>
  );
}
