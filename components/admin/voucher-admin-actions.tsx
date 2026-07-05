"use client";

import { useState, useTransition } from "react";
import {
  Ban,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Mail,
  MoreHorizontal,
  Printer,
} from "lucide-react";
import {
  cancelVoucher,
  cancelVoucherPurchase,
  confirmVoucherPayment,
  resendVoucherPurchaseEmail,
  sendVoucherInvoiceEmail,
} from "@/lib/actions/voucher";
import { VoucherRedemptionConfirm } from "@/components/admin/voucher-redemption-confirm";
import { VoucherRedemptionReschedule } from "@/components/admin/voucher-redemption-reschedule";
import { VoucherCalendarMenuItems } from "@/components/admin/voucher-calendar-menu-items";
import { openVoucherInvoicePdf, downloadVoucherInvoicePdf } from "@/lib/voucher-invoice-client";
import { invoiceFilename } from "@/lib/invoice-filename";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatEuro } from "@/lib/pricing";
import type { VoucherAssignableEvent } from "@/lib/events";
import type { ShootingType, VoucherStatus } from "@prisma/client";

export type VoucherPurchaseGroup = {
  purchaseNumber: string;
  buyerName: string;
  buyerEmail: string;
  totalCents: number;
  createdAt: string;
  status: "PENDING_PAYMENT" | "PAID" | "PARTIAL" | "REDEEMED";
  itemCount: number;
  voucherIds: string[];
};

type RowContext = {
  voucherId: string;
  code: string;
  status: VoucherStatus;
  purchaseNumber: string;
  isPurchaseLead: boolean;
  group: VoucherPurchaseGroup;
  redemption?: {
    parentName: string;
    defaultDate: string;
    defaultLocation: string;
    productTitle?: string;
    shootingType?: ShootingType;
    needsContact?: boolean;
    defaultEmail?: string;
    defaultChildName?: string;
  };
  reschedule?: {
    parentName: string;
    defaultDate: string;
    defaultTime: string;
    defaultLocation: string;
    currentLabel: string;
  };
  calendar?: {
    title: string;
    description: string;
    date: string;
    time?: string | null;
    location?: string | null;
    uid: string;
  };
};

export function VoucherAdminActions({ group }: { group: VoucherPurchaseGroup }) {
  const [pending, startTransition] = useTransition();

  if (group.status !== "PENDING_PAYMENT") return null;

  return (
    <Button
      type="button"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await confirmVoucherPayment(group.purchaseNumber);
          if (result.error) alert(result.error);
        })
      }
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        <>
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          Zahlung bestätigen
        </>
      )}
    </Button>
  );
}

export function VoucherRowMenu({
  row,
  assignableEvents = [],
}: {
  row: RowContext;
  assignableEvents?: VoucherAssignableEvent[];
}) {
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [invoicePending, setInvoicePending] = useState(false);
  const { confirm, confirmDialog } = useConfirm();
  const customerUrl = `/gutschein/erfolg?purchase=${encodeURIComponent(row.purchaseNumber)}`;
  const canConfirmRedemption = Boolean(row.redemption);
  const canReschedule = Boolean(row.reschedule);
  const canCancelVoucher =
    row.status !== "REDEEMED" && row.status !== "CANCELLED";
  const canCancelPurchase =
    row.isPurchaseLead && row.group.status !== "REDEEMED";
  const invoiceName = invoiceFilename(row.purchaseNumber);

  function runAction(
    action: () => Promise<{ error?: string; success?: boolean; message?: string }>,
  ) {
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        alert(result.error);
        return;
      }
      if (result.message) {
        alert(result.message);
      }
    });
  }

  async function handleInvoiceAction(mode: "view" | "print") {
    setInvoicePending(true);
    try {
      await openVoucherInvoicePdf(row.purchaseNumber, mode);
    } finally {
      setInvoicePending(false);
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(row.code);
    } catch {
      alert("Code konnte nicht kopiert werden.");
    }
  }

  const menuDisabled = pending || invoicePending;

  return (
    <>
      {canConfirmRedemption && row.redemption && (
        <VoucherRedemptionConfirm
          voucherId={row.voucherId}
          code={row.code}
          parentName={row.redemption.parentName}
          productTitle={row.redemption.productTitle}
          shootingType={row.redemption.shootingType}
          defaultDate={row.redemption.defaultDate}
          defaultLocation={row.redemption.defaultLocation}
          needsContact={row.redemption.needsContact}
          defaultEmail={row.redemption.defaultEmail}
          defaultChildName={row.redemption.defaultChildName}
          assignableEvents={assignableEvents}
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          showTrigger={false}
        />
      )}

      {canReschedule && row.reschedule && (
        <VoucherRedemptionReschedule
          voucherId={row.voucherId}
          code={row.code}
          parentName={row.reschedule.parentName}
          defaultDate={row.reschedule.defaultDate}
          defaultTime={row.reschedule.defaultTime}
          defaultLocation={row.reschedule.defaultLocation}
          currentLabel={row.reschedule.currentLabel}
          open={rescheduleOpen}
          onOpenChange={setRescheduleOpen}
          showTrigger={false}
        />
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={menuDisabled}
            aria-label={`Aktionen für Gutschein ${row.code}`}
          >
            {menuDisabled ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <MoreHorizontal className="h-4 w-4" aria-hidden />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {row.group.status === "PENDING_PAYMENT" && row.isPurchaseLead && (
            <DropdownMenuItem
              onClick={() =>
                runAction(() => confirmVoucherPayment(row.purchaseNumber))
              }
            >
              <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden />
              Zahlung bestätigen
            </DropdownMenuItem>
          )}

          {canConfirmRedemption && (
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                setConfirmOpen(true);
              }}
            >
              <CalendarCheck className="mr-2 h-4 w-4" aria-hidden />
              Termin bestätigen
            </DropdownMenuItem>
          )}

          {canReschedule && (
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                setRescheduleOpen(true);
              }}
            >
              <CalendarClock className="mr-2 h-4 w-4" aria-hidden />
              Termin ändern
            </DropdownMenuItem>
          )}

          {(canConfirmRedemption || canReschedule) && <DropdownMenuSeparator />}

          {row.calendar && (
            <>
              <VoucherCalendarMenuItems {...row.calendar} />
              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              void handleInvoiceAction("view");
            }}
          >
            <FileText className="mr-2 h-4 w-4" aria-hidden />
            Rechnung anzeigen
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              void handleInvoiceAction("print");
            }}
          >
            <Printer className="mr-2 h-4 w-4" aria-hidden />
            Rechnung drucken
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              void downloadVoucherInvoicePdf(row.purchaseNumber, invoiceName);
            }}
          >
            <Download className="mr-2 h-4 w-4" aria-hidden />
            Rechnung herunterladen
          </DropdownMenuItem>

          {row.isPurchaseLead && (
            <DropdownMenuItem
              onClick={() =>
                runAction(() => sendVoucherInvoiceEmail(row.purchaseNumber))
              }
            >
              <Mail className="mr-2 h-4 w-4" aria-hidden />
              Rechnung per E-Mail
            </DropdownMenuItem>
          )}

          <DropdownMenuItem asChild>
            <a href={customerUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" aria-hidden />
              Kundenansicht öffnen
            </a>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={copyCode}>
            <Copy className="mr-2 h-4 w-4" aria-hidden />
            Code kopieren
          </DropdownMenuItem>

          {row.isPurchaseLead && (
            <DropdownMenuItem
              onClick={() =>
                runAction(() => resendVoucherPurchaseEmail(row.purchaseNumber))
              }
            >
              <Mail className="mr-2 h-4 w-4" aria-hidden />
              Gutschein-E-Mail erneut
            </DropdownMenuItem>
          )}

          {(canCancelVoucher || canCancelPurchase) && <DropdownMenuSeparator />}

          {canCancelVoucher && (
            <DropdownMenuItem
              className="text-red-700 focus:text-red-700"
              onClick={() => {
                void (async () => {
                  const ok = await confirm({
                    title: "Gutschein stornieren?",
                    description: `Gutschein ${row.code} wird storniert und ist nicht mehr einlösbar.`,
                    confirmLabel: "Stornieren",
                    variant: "destructive",
                  });
                  if (!ok) return;
                  runAction(() => cancelVoucher(row.voucherId));
                })();
              }}
            >
              <Ban className="mr-2 h-4 w-4" aria-hidden />
              Gutschein stornieren
            </DropdownMenuItem>
          )}

          {canCancelPurchase && (
            <DropdownMenuItem
              className="text-red-700 focus:text-red-700"
              onClick={() => {
                void (async () => {
                  const ok = await confirm({
                    title: "Kauf stornieren?",
                    description: `Gesamter Kauf ${row.purchaseNumber} (${formatEuro(row.group.totalCents)}) wird storniert. Alle zugehörigen Gutscheine werden ungültig.`,
                    confirmLabel: "Stornieren",
                    variant: "destructive",
                  });
                  if (!ok) return;
                  runAction(() => cancelVoucherPurchase(row.purchaseNumber));
                })();
              }}
            >
              <Ban className="mr-2 h-4 w-4" aria-hidden />
              Kauf stornieren
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {confirmDialog}
    </>
  );
}

export function VoucherPurchaseSummary({ group }: { group: VoucherPurchaseGroup }) {
  return (
    <p className="text-xs text-slate-500">
      {group.itemCount} Gutschein{group.itemCount !== 1 ? "e" : ""} · {formatEuro(group.totalCents)}
    </p>
  );
}
