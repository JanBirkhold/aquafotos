export function invoiceFilename(orderNumber: string): string {
  return `Rechnung-${orderNumber}.pdf`;
}
