# AquaFotos Portfolio

Visuelle Case Study der öffentlichen Website (Screenshots + Erklärungen).

## Dateien

| Datei | Inhalt |
|---|---|
| `AquaFotos-Portfolio.pdf` | Portfolio-PDF (A4) |
| `portfolio.html` | Quell-Layout für den PDF-Export |
| `screenshots/*.png` | Viewport-Screenshots (1440×900) |

## Neu erzeugen

Dev-Server auf Port 3000, dann:

```bash
npm run portfolio:pdf
```

Optional andere Basis-URL:

```bash
PORTFOLIO_BASE_URL=http://localhost:3001 npm run portfolio:pdf
```
