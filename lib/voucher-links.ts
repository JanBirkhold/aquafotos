export function getVoucherSuccessUrl(purchaseNumber: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://aquafotos.com";
  return `${appUrl}/gutschein/erfolg?purchase=${encodeURIComponent(purchaseNumber)}`;
}

export function buildVoucherStatusOverviewEmailBlock(purchaseNumber: string): string {
  const link = getVoucherSuccessUrl(purchaseNumber);
  return `<p style="margin-top:20px;padding:16px;background:#ecfdf5;border-radius:8px;color:#065f46;font-size:15px;line-height:1.5;">
<strong>Termin, Gutschein &amp; Galerie:</strong> Status, Kalender und Galerie-Zugang finden Sie jederzeit in
<a href="${link}" style="color:#047857;font-weight:600;">Ihrer Gutschein-Übersicht</a>.
</p>`;
}
