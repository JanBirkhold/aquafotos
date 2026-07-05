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
} from "lucide-react";
import { sendOrderInvoiceEmail } from "@/lib/actions/orders";
import {
  downloadOrderInvoicePdf,
  openOrderInvoicePdf,
} from "@/lib/order-invoice-client";
import { invoiceFilename } from "@/lib/invoice-filename";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { OrderStatus } from "@prisma/client";

type Props = {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
};

export function OrderRowMenu({ orderId, orderNumber, status }: Props) {
  const [pending, startTransition] = useTransition();
  const [invoicePending, setInvoicePending] = useState(false);
  const invoiceName = invoiceFilename(orderNumber);
  const menuDisabled = pending || invoicePending;
  const canInvoice = status !== "CANCELLED";

  function runAction(
    action: () => Promise<{ error?: string; success?: boolean; message?: string }>,
  ) {
    startTransition(async () => {
      const result = await action();
      if (result.error) alert(result.error);
      else if (result.message) alert(result.message);
    });
  }

  async function handleInvoiceAction(mode: "view" | "print") {
    setInvoicePending(true);
    try {
      await openOrderInvoicePdf(orderNumber, mode);
    } finally {
      setInvoicePending(false);
    }
  }

  if (!canInvoice) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={menuDisabled}
          aria-label={`Aktionen für Bestellung ${orderNumber}`}
        >
          {menuDisabled ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <MoreHorizontal className="h-4 w-4" aria-hidden />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
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
            void downloadOrderInvoicePdf(orderNumber, invoiceName);
          }}
        >
          <Download className="mr-2 h-4 w-4" aria-hidden />
          Rechnung herunterladen
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => runAction(() => sendOrderInvoiceEmail(orderNumber))}>
          <Mail className="mr-2 h-4 w-4" aria-hidden />
          Rechnung per E-Mail
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/admin/bestellungen/${orderId}`}>Bestellung bearbeiten</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={`/bestellung/${encodeURIComponent(orderNumber)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="mr-2 h-4 w-4" aria-hidden />
            Kundenansicht
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
