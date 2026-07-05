"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Mail,
  MoreHorizontal,
  Printer,
  UserCheck,
} from "lucide-react";
import { sendOrderInvoiceEmail } from "@/lib/actions/orders";
import {
  downloadOrderInvoicePdf,
  openOrderInvoicePdf,
} from "@/lib/order-invoice-client";
import { invoiceFilename } from "@/lib/invoice-filename";
import type { ParticipantOrderSummary } from "@/lib/shooting-participant-orders";
import { orderStatusLabels } from "@/lib/order-workflow";
import { formatEuro } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ParticipantStatus } from "@prisma/client";

type Props = {
  participantId: string;
  participantLabel: string;
  eventId: string;
  status: ParticipantStatus;
  orders: ParticipantOrderSummary[];
  onResendConfirmation?: () => void;
  onConfirmManual?: () => void;
  resendLoading?: boolean;
};

export function ShootingParticipantMenu({
  participantLabel,
  status,
  orders,
  onResendConfirmation,
  onConfirmManual,
  resendLoading = false,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [invoicePending, setInvoicePending] = useState(false);
  const primaryOrder = orders[0] ?? null;
  const hasOrder = orders.length > 0;
  const menuDisabled = pending || invoicePending || resendLoading;

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

  async function handleInvoiceAction(orderNumber: string, mode: "view" | "print") {
    setInvoicePending(true);
    try {
      await openOrderInvoicePdf(orderNumber, mode);
    } finally {
      setInvoicePending(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={menuDisabled}
          aria-label={`Aktionen für ${participantLabel}`}
        >
          {menuDisabled ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <MoreHorizontal className="h-4 w-4" aria-hidden />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        {onResendConfirmation && (
          <DropdownMenuItem onClick={onResendConfirmation}>
            <Mail className="mr-2 h-4 w-4" aria-hidden />
            Bestätigung erneut senden
          </DropdownMenuItem>
        )}

        {status === "INVITED" && onConfirmManual && (
          <DropdownMenuItem onClick={onConfirmManual}>
            <UserCheck className="mr-2 h-4 w-4" aria-hidden />
            Als akzeptiert markieren
          </DropdownMenuItem>
        )}

        {hasOrder && (onResendConfirmation || (status === "INVITED" && onConfirmManual)) && (
          <DropdownMenuSeparator />
        )}

        {hasOrder && primaryOrder && (
          <>
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                void handleInvoiceAction(primaryOrder.orderNumber, "view");
              }}
            >
              <FileText className="mr-2 h-4 w-4" aria-hidden />
              Rechnung anzeigen
              {orders.length > 1 ? ` (${primaryOrder.orderNumber})` : ""}
            </DropdownMenuItem>

            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                void handleInvoiceAction(primaryOrder.orderNumber, "print");
              }}
            >
              <Printer className="mr-2 h-4 w-4" aria-hidden />
              Rechnung drucken
            </DropdownMenuItem>

            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                void downloadOrderInvoicePdf(
                  primaryOrder.orderNumber,
                  invoiceFilename(primaryOrder.orderNumber),
                );
              }}
            >
              <Download className="mr-2 h-4 w-4" aria-hidden />
              Rechnung herunterladen
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() =>
                runAction(() => sendOrderInvoiceEmail(primaryOrder.orderNumber))
              }
            >
              <Mail className="mr-2 h-4 w-4" aria-hidden />
              Rechnung per E-Mail
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href={`/admin/bestellungen/${primaryOrder.orderId}`}>
                <FileText className="mr-2 h-4 w-4" aria-hidden />
                Bestellung bearbeiten
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <a
                href={`/bestellung/${encodeURIComponent(primaryOrder.orderNumber)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" aria-hidden />
                Kundenansicht öffnen
              </a>
            </DropdownMenuItem>
          </>
        )}

        {orders.length > 1 &&
          orders.slice(1).map((order) => (
            <DropdownMenuItem key={order.orderId} asChild>
              <Link href={`/admin/bestellungen/${order.orderId}`}>
                <span className="truncate">
                  {order.isReorder ? "Nachbestellung" : "Bestellung"}{" "}
                  {order.orderNumber} · {formatEuro(order.totalCents)} ·{" "}
                  {orderStatusLabels[order.status]}
                </span>
              </Link>
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
