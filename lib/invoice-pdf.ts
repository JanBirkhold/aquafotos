import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import sharp from "sharp";
import type { BankTransferDetails } from "@/lib/voucher-payment";
import { formatIbanDisplay } from "@/lib/voucher-payment";
import { formatEuro } from "@/lib/pricing";
import { siteConfig } from "@/lib/site-config";

export type InvoiceLineItem = {
  position: number;
  label: string;
  priceCents: number;
};

export type OrderInvoiceInput = {
  orderNumber: string;
  customerEmail: string;
  customerName?: string | null;
  createdAt: Date;
  items: InvoiceLineItem[];
  totalCents: number;
  bank: BankTransferDetails;
  paymentHint?: string;
};

const BRAND = rgb(0.04, 0.16, 0.2);
const MUTED = rgb(0.35, 0.4, 0.45);
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 50;

async function loadLogoPng(): Promise<Uint8Array | null> {
  try {
    const svgPath = path.join(process.cwd(), "public/images/aquafotos_logo.svg");
    const svg = await readFile(svgPath);
    return sharp(svg).resize(200).png().toBuffer();
  } catch {
    return null;
  }
}

function drawWrappedText(
  page: ReturnType<PDFDocument["addPage"]>,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  size: number,
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
  color = BRAND,
) {
  const words = text.split(/\s+/);
  let line = "";
  let cursorY = y;

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > maxWidth && line) {
      page.drawText(line, { x, y: cursorY, size, font, color });
      cursorY -= size + 4;
      line = word;
    } else {
      line = next;
    }
  }

  if (line) {
    page.drawText(line, { x, y: cursorY, size, font, color });
  }

  return cursorY;
}

export async function generateOrderInvoicePdf(input: OrderInvoiceInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  const logoPng = await loadLogoPng();
  if (logoPng) {
    const logo = await pdf.embedPng(logoPng);
    const logoHeight = 48;
    const logoWidth = (logo.width / logo.height) * logoHeight;
    page.drawImage(logo, {
      x: MARGIN,
      y: y - logoHeight,
      width: logoWidth,
      height: logoHeight,
    });
    y -= logoHeight + 24;
  } else {
    page.drawText(siteConfig.name, {
      x: MARGIN,
      y: y - 20,
      size: 22,
      font: fontBold,
      color: BRAND,
    });
    y -= 44;
  }

  page.drawText("Rechnung", {
    x: MARGIN,
    y,
    size: 20,
    font: fontBold,
    color: BRAND,
  });
  y -= 28;

  const invoiceDate = input.createdAt.toLocaleDateString("de-DE");
  page.drawText(`Rechnungsnummer: ${input.orderNumber}`, {
    x: MARGIN,
    y,
    size: 11,
    font,
    color: BRAND,
  });
  y -= 16;
  page.drawText(`Datum: ${invoiceDate}`, {
    x: MARGIN,
    y,
    size: 11,
    font,
    color: MUTED,
  });
  y -= 28;

  page.drawText("Rechnungssteller", {
    x: MARGIN,
    y,
    size: 10,
    font: fontBold,
    color: MUTED,
  });
  y -= 14;
  page.drawText(siteConfig.owner.name, { x: MARGIN, y, size: 11, font, color: BRAND });
  y -= 14;
  page.drawText(`${siteConfig.address.street}, ${siteConfig.address.postalCode} ${siteConfig.address.city}`, {
    x: MARGIN,
    y,
    size: 11,
    font,
    color: BRAND,
  });
  y -= 14;
  page.drawText(`${siteConfig.emailUser}@${siteConfig.emailDomain}`, {
    x: MARGIN,
    y,
    size: 11,
    font,
    color: BRAND,
  });
  y -= 24;

  page.drawText("Rechnungsempfänger", {
    x: MARGIN,
    y,
    size: 10,
    font: fontBold,
    color: MUTED,
  });
  y -= 14;
  if (input.customerName) {
    page.drawText(input.customerName, { x: MARGIN, y, size: 11, font, color: BRAND });
    y -= 14;
  }
  page.drawText(input.customerEmail, { x: MARGIN, y, size: 11, font, color: BRAND });
  y -= 32;

  page.drawText("Pos.", { x: MARGIN, y, size: 10, font: fontBold, color: MUTED });
  page.drawText("Leistung", { x: MARGIN + 28, y, size: 10, font: fontBold, color: MUTED });
  page.drawText("Betrag", {
    x: PAGE_WIDTH - MARGIN - 70,
    y,
    size: 10,
    font: fontBold,
    color: MUTED,
  });
  y -= 8;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_WIDTH - MARGIN, y },
    thickness: 0.5,
    color: rgb(0.85, 0.87, 0.9),
  });
  y -= 18;

  for (const item of input.items) {
    page.drawText(String(item.position), {
      x: MARGIN,
      y,
      size: 10,
      font,
      color: BRAND,
    });
    page.drawText(item.label, {
      x: MARGIN + 28,
      y,
      size: 10,
      font,
      color: BRAND,
    });
    page.drawText(formatEuro(item.priceCents), {
      x: PAGE_WIDTH - MARGIN - 70,
      y,
      size: 10,
      font,
      color: BRAND,
    });
    y -= 18;
  }

  y -= 8;
  page.drawLine({
    start: { x: MARGIN, y: y + 8 },
    end: { x: PAGE_WIDTH - MARGIN, y: y + 8 },
    thickness: 0.5,
    color: rgb(0.85, 0.87, 0.9),
  });
  page.drawText("Gesamtbetrag", {
    x: MARGIN + 28,
    y: y - 10,
    size: 12,
    font: fontBold,
    color: BRAND,
  });
  page.drawText(formatEuro(input.totalCents), {
    x: PAGE_WIDTH - MARGIN - 70,
    y: y - 10,
    size: 12,
    font: fontBold,
    color: BRAND,
  });
  y -= 28;

  if (siteConfig.invoiceSmallBusinessNotice) {
    y = drawWrappedText(
      page,
      siteConfig.invoiceSmallBusinessNotice,
      MARGIN,
      y,
      PAGE_WIDTH - MARGIN * 2,
      9,
      font,
      MUTED,
    );
    y -= 16;
  }

  page.drawText("Zahlung per Überweisung", {
    x: MARGIN,
    y,
    size: 12,
    font: fontBold,
    color: BRAND,
  });
  y -= 18;

  const iban = input.bank.iban ? formatIbanDisplay(input.bank.iban) : "Bitte kontaktieren Sie uns";
  const paymentLines = [
    `Empfänger: ${input.bank.accountHolder}`,
    input.bank.bankName ? `Bank: ${input.bank.bankName}` : null,
    `IBAN: ${iban}`,
    input.bank.bic ? `BIC: ${input.bank.bic}` : null,
    `Betrag: ${formatEuro(input.totalCents)}`,
    `Verwendungszweck: ${input.orderNumber}`,
  ].filter(Boolean) as string[];

  for (const line of paymentLines) {
    page.drawText(line, { x: MARGIN, y, size: 10, font, color: BRAND });
    y -= 14;
  }

  y -= 10;
  y = drawWrappedText(
    page,
    input.paymentHint ??
      "Bitte überweisen Sie den Betrag innerhalb von 7 Tagen. Nach Zahlungseingang beginnen wir mit der Bearbeitung Ihrer Bilder.",
    MARGIN,
    y,
    PAGE_WIDTH - MARGIN * 2,
    10,
    font,
    MUTED,
  );

  y -= 24;
  drawWrappedText(
    page,
    "Vielen Dank für Ihre Bestellung bei AquaFotos!",
    MARGIN,
    y,
    PAGE_WIDTH - MARGIN * 2,
    10,
    font,
    MUTED,
  );

  return pdf.save();
}

