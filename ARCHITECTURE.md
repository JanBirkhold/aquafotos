# AquaFotos 2.0 – Plattform-Architektur

## Stack

| Layer | Technologie |
|-------|-------------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind 4, shadcn-style UI |
| Auth | NextAuth v5 (Credentials: Team + Galerie-Zugangscode) |
| DB | PostgreSQL + Prisma 6 |
| Payments | Stripe Checkout |
| E-Mail | Resend |
| Upload | Uploadthing (vorbereitet) |
| QR | qrcode (Server-seitig) |

## Module

### Marketing (`/`, `/unterwasser`, `/kita`, `/baby`, `/familie`, `/aktionen`)
- Hero-Carousel, Zielgruppen, Team, Galerie
- Service-Landingpages via `app/[slug]/page.tsx`

### Shootings (`/shootings`, `/shootings/[id]`)
- Event-Modell (kein Freitext-Kalender)
- Anmeldung, Warteliste, Restplätze
- QR + Zugangscode bei Registrierung

### Shop (`/bilder-bestellen`, `/galerie/[code]`, `/warenkorb`)
- Staffelpreise: 35€ / 25€ / 15€ (`lib/pricing.ts`)
- Stripe Checkout oder Demo-Modus ohne Keys

### Admin (`/admin/*`)
- Dashboard: Umsatz, Teilnehmer, Auslastung
- Shootings: Teilnehmerliste, QR-Anzeige, Upload-Platzhalter
- Preise, Partner, Bestellungen

### CRM / Workflow
- `ShootingNotification` – Mail bei neuen Terminen
- `IndividualShootingRequest` – Wunschdatum
- `ParticipantQR` – QR-Workflow für Fotografen
- Foto-Status: RAW → PRESELECTED → EDITING → APPROVED → READY

## Setup

```bash
cp .env.example .env.local
# DATABASE_URL, AUTH_SECRET, STRIPE_*, RESEND_* eintragen

npx prisma db push
npm run db:seed

npm run dev
```

**Seed-Login:** `admin@aquafotos.com` / `admin123!`

## Phase 2 (offen)

- [ ] Uploadthing: Batch-Upload + QR-Erkennung im Dateinamen
- [ ] Stripe Webhook → Order PAID → Mail an Fotograf
- [ ] PDF-Export aller QR-Codes pro Event
- [ ] Geschwisterlogik: FamilyAccount mit mehreren Children
- [ ] Warenkorb-Session (Cookie) + Favoriten UI
- [ ] Statistik-Charts (Conversion, Umsatz/Partner)
- [ ] Product Schema für Shop-SEO
- [ ] Review Schema aus DB
- [ ] Vercel Postgres / Neon Deploy
