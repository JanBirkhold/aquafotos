"use client";

import { Download, FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { invoiceFilename } from "@/lib/invoice-filename";

type Props = {
  purchaseNumber: string;
  invoiceUrl?: string | null;
};

export function VoucherInvoiceActions({ purchaseNumber, invoiceUrl }: Props) {
  const href =
    invoiceUrl ??
    `/api/gutschein/${encodeURIComponent(purchaseNumber)}/invoice`;

  return (
    <div className="flex flex-wrap gap-3">
      <Button asChild variant="outline" size="sm">
        <a href={href} target="_blank" rel="noopener noreferrer">
          <FileText className="mr-2 h-4 w-4" aria-hidden />
          Rechnung anzeigen
        </a>
      </Button>
      <Button asChild variant="outline" size="sm">
        <a href={href} download={invoiceFilename(purchaseNumber)}>
          <Download className="mr-2 h-4 w-4" aria-hidden />
          Rechnung herunterladen
        </a>
      </Button>
      <Button asChild variant="outline" size="sm">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.preventDefault();
            const win = window.open(href, "_blank", "noopener,noreferrer");
            win?.addEventListener("load", () => win.print());
          }}
        >
          <Printer className="mr-2 h-4 w-4" aria-hidden />
          Rechnung drucken
        </a>
      </Button>
    </div>
  );
}
