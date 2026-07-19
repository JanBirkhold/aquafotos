/**
 * Captures AquaFotos screenshots and builds a portfolio PDF.
 * Run: node scripts/build-portfolio-pdf.mjs
 * Requires: npx playwright (chromium)
 */
import { chromium } from "playwright";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "docs", "portfolio");
const SHOTS = path.join(OUT, "screenshots");
const BASE = process.env.PORTFOLIO_BASE_URL ?? "http://localhost:3000";

const PAGES = [
  {
    id: "01-start",
    path: "/",
    title: "Startseite / Hero",
    role: "Einstieg & Marke",
    points: [
      "Immersives Hero-Video mit Scroll-Scrub (oben Autoplay, beim Scrollen Frame-für-Frame).",
      "Klare CTAs: Shooting finden & Bilder bestellen.",
      "Lokaler GEO-Bezug im Hero (Barntrup, Detmold, Lage, Bad Salzuflen).",
      "Zielgruppen-Teaser, Angebote, Partner-Logos und „Partner werden“-Block.",
    ],
  },
  {
    id: "02-info",
    path: "/info",
    title: "Info & FAQ",
    role: "Ablauf & Vertrauen",
    points: [
      "Ein durchgängiger Unterwasser-Ablauf statt fragmentierter Kategorie-Seiten.",
      "Preise und Veranstaltungsregeln transparent für Eltern.",
      "FAQ mit strukturierten Daten (JSON-LD) für SEO.",
      "Anmeldung bewusst einfach: WhatsApp, Telefon, E-Mail – kein Shop-Login nötig.",
    ],
  },
  {
    id: "03-partner",
    path: "/partner",
    title: "Partner werden",
    role: "B2B-Kooperation",
    points: [
      "Pitch für Schwimmbäder, Kitas, Hebammen und Familienzentren in Lippe / OWL.",
      "Prozess mit QR-Aushang: Einrichtung hängt aus, Anmeldung läuft bei AquaFotos.",
      "Kein Partner-Admin, kein Wartelisten-Tool, kein Warenkorb-Management für die Einrichtung.",
      "Leichte Anfrage per mailto-Formular (Unternehmen, Ort, E-Mail).",
    ],
  },
  {
    id: "04-shootings",
    path: "/shootings",
    title: "Shooting finden",
    role: "Termine & Conversion",
    points: [
      "Aktueller Termin als klare Karte (Beispiel: VitaSol Bad Salzuflen).",
      "Direkte Kontaktwege: Anruf, E-Mail, Kontaktseite.",
      "Statischer Event-Eintrag – passt zum schlanken Portfolio-Stack ohne Booking-Backend.",
    ],
  },
  {
    id: "05-gutschein",
    path: "/gutschein",
    title: "Gutschein",
    role: "Geschenk & Upsell",
    points: [
      "Gutschein-Anfrage ohne Checkout-Warenkorb – passend zum aktuellen Workflow.",
      "Zahlung per Vorkasse / Überweisung, Code per E-Mail nach Zahlungseingang.",
      "CTA über E-Mail, Telefon und Kontaktseite.",
    ],
  },
  {
    id: "06-kontakt",
    path: "/kontakt",
    title: "Kontakt",
    role: "NAP & Erreichbarkeit",
    points: [
      "Telefon, E-Mail und Adresse (Barntrup) – NAP-konsistent für Local SEO.",
      "Einzugsgebiet explizit: Detmold, Lage, Bad Salzuflen und Umgebung.",
      "Persönlicher Ton, kurze Wege – Portfolio statt Self-Service-Shop.",
    ],
  },
];

async function capture(page, item) {
  const url = `${BASE}${item.path}`;
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(800);
  const file = path.join(SHOTS, `${item.id}.png`);
  await page.screenshot({ path: file, fullPage: false });
  return file;
}

function escapeHtml(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function buildHtml(shotPaths) {
  const cover = `
    <section class="page cover">
      <p class="eyebrow">Portfolio Case Study</p>
      <h1>AquaFotos</h1>
      <p class="tagline">Unterwasserfotografie · Barntrup · Lippe / OWL</p>
      <p class="lede">
        Schlanke Next.js-Portfolio-Website: immersive Hero-Experience, klare
        Eltern-Journey und Partner-Prozess mit QR-Aushang – ohne schweres
        Shop-/Admin-Backend auf der öffentlichen Site.
      </p>
      <ul class="meta">
        <li><strong>Stack:</strong> Next.js App Router, TypeScript, Tailwind, shadcn/ui</li>
        <li><strong>Fokus:</strong> SEO / Local SEO (GEO), Accessibility, Performance</li>
        <li><strong>Region:</strong> Barntrup, Detmold, Lage, Bad Salzuflen</li>
        <li><strong>Stand:</strong> ${new Date().toLocaleDateString("de-DE", { year: "numeric", month: "long" })}</li>
      </ul>
    </section>
  `;

  const overview = `
    <section class="page overview">
      <h2>Produktüberblick</h2>
      <p>
        Die Site führt zwei Zielgruppen: <strong>Familien</strong> (Termine,
        Ablauf, Bilder bestellen) und <strong>Einrichtungen</strong>
        (Partner werden). Marketing-Copy und Technikstack sind bewusst
        synchron – kein Versprechen von Online-Shop, Wartelisten-Software
        oder Kapazitätsmanagement, das die Website nicht mehr liefert.
      </p>
      <div class="grid">
        <div>
          <h3>Familien</h3>
          <ol>
            <li>Start / Hero</li>
            <li>Info &amp; FAQ</li>
            <li>Shooting finden</li>
            <li>Gutschein / Kontakt</li>
          </ol>
        </div>
        <div>
          <h3>Partner</h3>
          <ol>
            <li>Partner-Teaser auf Start</li>
            <li>Partner-Landing mit QR-Prozess</li>
            <li>Mailto-Anfrage</li>
          </ol>
        </div>
      </div>
    </section>
  `;

  const screens = await Promise.all(
    PAGES.map(async (item, i) => {
      const imgPath = shotPaths[i];
      const buf = await readFile(imgPath);
      const b64 = buf.toString("base64");
      return `
        <section class="page screen">
          <div class="screen-head">
            <p class="eyebrow">Screen ${String(i + 1).padStart(2, "0")} · ${escapeHtml(item.role)}</p>
            <h2>${escapeHtml(item.title)}</h2>
            <p class="path">${escapeHtml(item.path === "/" ? "/" : item.path)}</p>
          </div>
          <figure>
            <img src="data:image/png;base64,${b64}" alt="${escapeHtml(item.title)}" />
          </figure>
          <ul class="points">
            ${item.points.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}
          </ul>
        </section>
      `;
    }),
  );

  const closing = `
    <section class="page closing">
      <h2>Technische Highlights</h2>
      <ul class="points">
        <li>Server Components first, Client nur für Hero-Video und Interaktion.</li>
        <li>Metadata API, Canonical, Open Graph, LocalBusiness + Geo-Koordinaten.</li>
        <li>Sitemap &amp; robots; Login noindex.</li>
        <li>Partner- und Eltern-Workflows textlich an den realen Prozess angepasst (QR, WhatsApp/Telefon/Mail, Galerie per E-Mail).</li>
      </ul>
      <p class="footer-note">
        Screenshots lokal gegen <code>${escapeHtml(BASE)}</code> erzeugt.
        Dokument: <code>docs/portfolio/AquaFotos-Portfolio.pdf</code>
      </p>
    </section>
  `;

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <title>AquaFotos – Portfolio</title>
  <style>
    @page { size: A4; margin: 14mm 14mm 16mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
      color: #0c2a33;
      font-size: 11pt;
      line-height: 1.45;
    }
    .page {
      break-after: page;
      page-break-after: always;
      min-height: 250mm;
    }
    .page:last-child { break-after: auto; page-break-after: auto; }
    .cover {
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding-top: 28mm;
    }
    .eyebrow {
      text-transform: uppercase;
      letter-spacing: 0.16em;
      font-size: 9pt;
      color: #0e7490;
      font-weight: 600;
      margin: 0 0 8px;
    }
    h1 {
      font-size: 36pt;
      margin: 0;
      letter-spacing: -0.02em;
      color: #083344;
    }
    h2 {
      font-size: 18pt;
      margin: 0 0 8px;
      color: #083344;
    }
    h3 { font-size: 12pt; margin: 0 0 6px; color: #0e7490; }
    .tagline { font-size: 13pt; color: #155e75; margin: 10px 0 18px; }
    .lede { max-width: 140mm; color: #334155; margin: 0 0 22px; }
    .meta { list-style: none; padding: 0; margin: 0; }
    .meta li { margin: 6px 0; color: #334155; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 18px; }
    .grid > div {
      border: 1px solid #bae6fd;
      border-radius: 12px;
      padding: 14px 16px;
      background: #f0f9ff;
    }
    .grid ol { margin: 0; padding-left: 18px; color: #334155; }
    .screen-head { margin-bottom: 10px; }
    .path {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 9pt;
      color: #64748b;
      margin: 0;
    }
    figure { margin: 0 0 12px; }
    figure img {
      width: 100%;
      height: auto;
      border-radius: 10px;
      border: 1px solid #cbd5e1;
      box-shadow: 0 8px 24px rgba(8, 51, 68, 0.12);
    }
    .points { margin: 0; padding-left: 18px; color: #334155; }
    .points li { margin: 5px 0; }
    .footer-note {
      margin-top: 28px;
      font-size: 9pt;
      color: #64748b;
    }
    code { font-size: 8.5pt; }
  </style>
</head>
<body>
  ${cover}
  ${overview}
  ${screens.join("\n")}
  ${closing}
</body>
</html>`;
}

async function main() {
  await mkdir(SHOTS, { recursive: true });
  console.log(`Base URL: ${BASE}`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
  });

  const shotPaths = [];
  for (const item of PAGES) {
    process.stdout.write(`Screenshot ${item.path} … `);
    const file = await capture(page, item);
    shotPaths.push(file);
    console.log("ok");
  }

  const html = await buildHtml(shotPaths);
  const htmlPath = path.join(OUT, "portfolio.html");
  await writeFile(htmlPath, html, "utf8");

  const pdfPath = path.join(OUT, "AquaFotos-Portfolio.pdf");
  await page.setContent(html, { waitUntil: "load" });
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    margin: { top: "12mm", bottom: "14mm", left: "12mm", right: "12mm" },
  });

  await browser.close();
  console.log(`\nPDF: ${pdfPath}`);
  console.log(`HTML: ${htmlPath}`);
  console.log(`Screens: ${SHOTS}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
