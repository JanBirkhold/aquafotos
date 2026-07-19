# AquaFotos – Portfolio-Architektur

## Stack

| Layer | Technologie |
|-------|-------------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind 4, shadcn-style UI |
| Hosting | Statische/SSR-Marketing-Site – **ohne Datenbank im Projekt** |
| SEO | Metadata API, JSON-LD (LocalBusiness, FAQ, Team), sitemap, robots |

## Module

### Marketing (`/`, `/unterwasser`, `/kita`, `/baby`, `/familie`, `/aktionen`)
- Immersives Hero-Video (Scroll-Scrub)
- Zielgruppen, Angebote, Team, Galerie-Preview
- Service-Landingpages via `app/[slug]/page.tsx`

### Info & Conversion
- `/info` – Ablauf, Preise, FAQ
- `/shootings` – aktueller Termin (statisch, `lib/public-shooting-event.ts`)
- `/bilder-bestellen`, `/gutschein` – Erklärseiten + Kontakt-CTAs
- `/partner` – B2B mit QR-Aushang-Prozess, mailto-Anfrage
- `/kontakt` – NAP (Barntrup / Lippe / OWL)

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Keine Prisma-/Postgres-Abhängigkeit in diesem Repo. Eine ggf. lokal noch laufende Docker-DB (`aquafotos-db`) gehört **nicht** mehr zu diesem Projekt und wird hier weder gestartet noch verwaltet.
