# AquaFotos Redesign – Technische To-do-Liste

## Phase 1 – Sofort (vor Go-Live)

- [ ] Echte Galerie-Bilder in `public/images/gallery/` ersetzen (aktuell Hero-Platzhalter)
- [ ] Terminformular an Backend anbinden (Server Action + Resend/SMTP oder Supabase)
- [ ] `npm run build` + Lighthouse Mobile Audit (Ziel: LCP < 2.5s)
- [ ] OG-Image (`public/images/og-image.jpg`, 1200×630) erstellen
- [ ] Favicon + Apple Touch Icon generieren
- [ ] Domain `aquafotos.com` in Vercel/Hosting deployen
- [ ] SSL + Canonical-URLs verifizieren

## Phase 2 – Commerce & Auth (Supabase)

- [ ] Supabase-Projekt anlegen + `.env.local` (URL, Publishable Key)
- [ ] `proxy.ts` mit SSR-Auth (`getAll`/`setAll` Cookies)
- [ ] DB-Schema: events, photos, cart_items, orders, users
- [ ] Storage: `previews/` (Wasserzeichen) + `fullres/` (Download nach Kauf)
- [ ] Login mit Veranstaltungs-Passwort
- [ ] Warenkorb-Persistenz (Cookie + DB)
- [ ] Checkout + Echtzeit-Überweisung Flow
- [ ] Automatischer E-Mail-Versand nach Zahlung

## Phase 3 – SEO & Content

- [ ] Google Search Console + Bing Webmaster einrichten
- [ ] Google Business Profile (Local SEO Barntrup/Lippe)
- [ ] FAQ-Section auf Startseite sichtbar machen (Schema existiert bereits)
- [ ] Blog/Ratgeber-Artikel für Long-Tail Keywords (optional)
- [ ] Structured Data mit Google Rich Results Test prüfen

## Phase 4 – Performance & UX

- [ ] Hero-Bild weiter komprimieren (AVIF, ~150–200 KB Ziel)
- [ ] `priority` nur auf Hero, Rest `loading="lazy"`
- [ ] Cookie-Banner (DSGVO) vor Tracking
- [ ] Analytics (privacy-friendly, z. B. Plausible) optional

---

## Bildnamen & Alt-Texte (Vorschlag)

| Dateiname | Alt-Text |
|-----------|----------|
| `hero-bg.webp` | Atmosphärisches Unterwasser-Fotoshooting bei AquaFotos Barntrup |
| `aquafotos_logo.svg` | AquaFotos Logo – Unterwasserfotografie Barntrup |
| `gallery/unterwasser-01.webp` | Unterwasserfoto Kind – professionelles Unterwasserfotoshooting AquaFotos Barntrup |
| `gallery/unterwasser-02.webp` | Emotionales Unterwasserporträt – AquaFotos Lippe |
| `gallery/unterwasser-03.webp` | Professionelle Unterwasserbilder – AquaFotos Fotostudio Lippe |
| `gallery/kinder-01.webp` | Unterwasserfotos Kinder – fröhliches Shooting bei AquaFotos |
| `gallery/kinder-02.webp` | Kinder Unterwasser Fotoshooting Barntrup – AquaFotos |
| `gallery/kinder-03.webp` | Unterwasserfotos Kinder Barntrup – natürliche Portraits AquaFotos |
| `gallery/familien-01.webp` | Unterwasser Fotos Familie – gemeinsame Erinnerungen AquaFotos |
| `gallery/familien-02.webp` | Familien Unterwasserfotografie OWL – AquaFotos Barntrup |
| `gallery/events-01.webp` | Event Unterwasserfotografie – Veranstaltung AquaFotos Lippe |
| `gallery/events-02.webp` | Veranstaltungsfotos Unterwasser – AquaFotos Barntrup |
| `gallery/weihnachtsminis-01.webp` | WeihnachtsMinis Barntrup – festliches Unterwasserfoto AquaFotos |
| `gallery/weihnachtsminis-02.webp` | WeihnachtsMinis Unterwasserfotografie – AquaFotos OWL |
| `og-image.jpg` | AquaFotos – Unterwasserfotografie Barntrup, Lippe, OWL |
