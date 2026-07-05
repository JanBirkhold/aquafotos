import { prisma } from "@/lib/prisma";
import {
  EMAIL_TEMPLATE_DEFINITIONS,
  renderEmailTemplate,
  type EmailTemplateKey,
} from "@/lib/email-template-definitions";

export async function ensureEmailTemplatesSeeded() {
  for (const def of EMAIL_TEMPLATE_DEFINITIONS) {
    await prisma.emailTemplate.upsert({
      where: { key: def.key },
      update: {},
      create: {
        key: def.key,
        label: def.label,
        description: def.description,
        subject: def.subject,
        bodyHtml: def.bodyHtml,
        placeholders: def.placeholders.join(", "),
      },
    });
  }
}

export async function getEmailTemplate(key: EmailTemplateKey | string) {
  await ensureEmailTemplatesSeeded();
  const template = await prisma.emailTemplate.findUniqueOrThrow({
    where: { key },
  });
  return template;
}

export async function listEmailTemplates() {
  await ensureEmailTemplatesSeeded();
  return prisma.emailTemplate.findMany({
    orderBy: { label: "asc" },
  });
}

export async function renderStoredEmail(
  key: EmailTemplateKey | string,
  variables: Record<string, string>,
  overrides?: { subject?: string; bodyHtml?: string },
) {
  const template = await getEmailTemplate(key);
  return {
    subject: renderEmailTemplate(overrides?.subject ?? template.subject, variables),
    html: renderEmailTemplate(overrides?.bodyHtml ?? template.bodyHtml, variables),
  };
}

export function buildTimeLine(time?: string): string {
  return time ? `<br><strong>Uhrzeit:</strong> ${time}` : "";
}

export function buildAccessCodeBlock(accessCode?: string, galleryUrl?: string): string {
  if (!accessCode) return "";

  const link = galleryUrl ?? "/bilder-bestellen";
  return `<p><strong>Ihr Zugang zur Bildergalerie</strong></p>
<p>So gelangen Sie zu Ihren Fotos:</p>
<ol>
  <li>Seite <a href="${link}">Bilder bestellen</a> öffnen</li>
  <li>Ihre <strong>E-Mail-Adresse</strong> und den <strong>Zugangscode</strong> eingeben (kein separates Passwort nötig)</li>
  <li>Galerie ansehen, Favoriten markieren und Bilder bestellen</li>
</ol>
<p><strong>Ihr Zugangscode:</strong><br>
<code style="font-size:1.1em;letter-spacing:0.05em">${accessCode}</code></p>
<p style="font-size:0.9em;color:#64748b">Bitte bewahren Sie Code und E-Mail gemeinsam auf – beides wird zur Anmeldung benötigt.</p>`;
}

export function buildGalleryAccessGuideBlock(galleryUrl: string): string {
  return `<p><strong>So bestellen Sie Ihre Bilder</strong></p>
<ol>
  <li><a href="${galleryUrl}">Galerie-Zugang öffnen</a></li>
  <li>Mit <strong>E-Mail</strong> und <strong>Zugangscode</strong> anmelden</li>
  <li>Bilder auswählen → Warenkorb → verbindlich bestellen</li>
</ol>`;
}

export function buildQrCodeBlock(
  qrDataUrl?: string | null,
  participantNumber?: number,
): string {
  if (!qrDataUrl) return "";

  const nr = participantNumber
    ? String(participantNumber).padStart(3, "0")
    : "001";

  return `<p><strong>Ihr QR-Code (Teilnehmer #${nr})</strong></p>
<p>Am Shooting vorzeigen – der Code verknüpft Ihre Fotos automatisch:</p>
<p><img src="${qrDataUrl}" alt="QR-Code Teilnehmer ${nr}" width="160" height="160" style="border:1px solid #e2e8f0;border-radius:8px" /></p>
<p style="font-size:0.9em;color:#64748b">Alternativ reicht Ihr Zugangscode. Fotos werden intern als ${nr}_… benannt.</p>`;
}

export function buildNotesBlock(notes?: string): string {
  return notes ? `<p>${notes}</p>` : "";
}

export function buildReasonBlock(reason?: string): string {
  return reason ? `<p><strong>Grund:</strong> ${reason}</p>` : "";
}

export function buildOrderFlowBlock(): string {
  return `<p><strong>So geht es weiter:</strong></p>
<ol>
  <li><strong>Auswahl</strong> – Sie haben Ihre Bilder in der Galerie gewählt</li>
  <li><strong>Bearbeitung</strong> – Entfernung Wasserzeichen &amp; Retusche</li>
  <li><strong>Sichtung</strong> – Qualitätskontrolle in unserem Studio</li>
  <li><strong>Benachrichtigung</strong> – E-Mail, sobald alles fertig ist</li>
  <li><strong>Download</strong> – fertige Dateien ohne Wasserzeichen</li>
</ol>`;
}

export function buildOrderDownloadBlock(
  items: { filename: string; downloadUrl: string }[],
): string {
  if (items.length === 0) {
    return `<p>Ihre Downloads stehen im <a href="#">Bestellstatus</a> bereit.</p>`;
  }
  const links = items
    .map(
      (i) =>
        `<li><a href="${i.downloadUrl}" download="${i.filename}">${i.filename}</a></li>`,
    )
    .join("");
  return `<p><strong>Downloads:</strong></p><ul>${links}</ul>`;
}

export function buildGalleryLinkBlock(galleryUrl: string): string {
  return `<p><a href="${galleryUrl}">Zur Galerie – Bilder ansehen und bestellen</a></p>`;
}

export function buildVoucherListBlock(
  vouchers: {
    code: string;
    title: string;
    preferredDate: string;
    qrDataUrl: string | null;
    redeemUrl: string;
  }[],
): string {
  if (vouchers.length === 0) return "";

  return vouchers
    .map(
      (v) => `<div style="margin:1.25em 0;padding:1em;border:1px solid #e2e8f0;border-radius:12px">
<p><strong>${v.title}</strong></p>
<p><strong>Code:</strong> <code style="font-size:1.05em;letter-spacing:0.05em">${v.code}</code></p>
${v.preferredDate ? `<p><strong>Wunschtermin:</strong> ${v.preferredDate}</p>` : ""}
${v.qrDataUrl ? `<p><img src="${v.qrDataUrl}" alt="QR-Code Gutschein ${v.code}" width="140" height="140" style="border:1px solid #e2e8f0;border-radius:8px" /></p>` : ""}
<p><a href="${v.redeemUrl}">Gutschein einlösen</a></p>
</div>`,
    )
    .join("");
}

export function buildVoucherRedeemGuideBlock(redeemUrl: string): string {
  return `<p><strong>So lösen Sie den Gutschein ein:</strong></p>
<ol>
  <li><a href="${redeemUrl}">Einlöse-Seite öffnen</a> oder QR-Code scannen</li>
  <li>Code eingeben und Anmeldedaten vervollständigen</li>
  <li>Wir bestätigen Ihren Wunschtermin per E-Mail</li>
</ol>`;
}

export function buildBankTransferBlock(params: {
  accountHolder: string;
  bankName: string;
  iban: string;
  bic: string;
  amount: string;
  reference: string;
}): string {
  const iban = params.iban.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim();
  return `<div style="margin:1em 0;padding:1em;border:1px solid #fcd34d;border-radius:12px;background:#fffbeb">
<p><strong>Zahlung per Überweisung</strong></p>
<p>Empfänger: ${params.accountHolder}<br>
${params.bankName ? `Bank: ${params.bankName}<br>` : ""}
IBAN: <code>${iban}</code><br>
${params.bic ? `BIC: ${params.bic}<br>` : ""}
Betrag: <strong>${params.amount}</strong><br>
Verwendungszweck: <code>${params.reference}</code></p>
</div>`;
}

export function buildVoucherOrderItemsBlock(
  items: { title: string; price: string; preferredDate?: string }[],
): string {
  if (items.length === 0) return "";
  const rows = items
    .map(
      (i) =>
        `<li>${i.title}${i.preferredDate ? ` · Wunschtermin ${i.preferredDate}` : ""} · ${i.price}</li>`,
    )
    .join("");
  return `<p><strong>Bestellte Gutscheine:</strong></p><ul>${rows}</ul>`;
}

export function buildOrderItemsBlock(
  items: { label: string; price: string }[],
): string {
  if (items.length === 0) return "";
  const rows = items.map((i) => `<li>${i.label} · ${i.price}</li>`).join("");
  return `<p><strong>Bestellte Bilder:</strong></p><ul>${rows}</ul>`;
}

export function buildLocationLine(location?: string): string {
  return location ? ` in ${location}` : "";
}
