"use client";

import { getOrderInvoicePdfForAdmin } from "@/lib/actions/orders";

function base64ToBlob(base64: string, mimeType: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mimeType });
}

export async function openOrderInvoicePdf(orderNumber: string, mode: "view" | "print") {
  const result = await getOrderInvoicePdfForAdmin(orderNumber);
  if (result.error || !result.pdfBase64) {
    alert(result.error ?? "Rechnung konnte nicht geladen werden.");
    return;
  }

  const blob = base64ToBlob(result.pdfBase64, "application/pdf");
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank", "noopener,noreferrer");

  if (!win) {
    URL.revokeObjectURL(url);
    alert("Pop-up blockiert – bitte Pop-ups für diese Seite erlauben.");
    return;
  }

  if (mode === "print") {
    const triggerPrint = () => {
      try {
        win.focus();
        win.print();
      } catch {
        // PDF viewer may block programmatic print
      }
    };
    win.addEventListener("load", triggerPrint);
    window.setTimeout(triggerPrint, 800);
  }

  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export async function downloadOrderInvoicePdf(orderNumber: string, filename: string) {
  const result = await getOrderInvoicePdfForAdmin(orderNumber);
  if (result.error || !result.pdfBase64) {
    alert(result.error ?? "Rechnung konnte nicht geladen werden.");
    return;
  }

  const blob = base64ToBlob(result.pdfBase64, "application/pdf");
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
