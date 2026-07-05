import { siteConfig } from "@/lib/site-config";

export const VOUCHER_LIFECYCLE_STEPS = [
  {
    title: "Gutschein kaufen",
    description:
      "Produkt wählen, optional Beschenkte Person & Nachricht, per Überweisung bezahlen. Rechnung per E-Mail.",
  },
  {
    title: "Freigabe & Code",
    description:
      "Nach Zahlungseingang senden wir Code und QR-Code per E-Mail – Einlösung ist dann möglich.",
  },
  {
    title: "Gutschein einlösen",
    description:
      "Code eingeben, Kontaktdaten & Wunschtermin hinterlegen, Terminanfrage absenden.",
  },
  {
    title: "Terminbestätigung",
    description: `Wir melden uns bei Ihnen (${siteConfig.phoneDisplay}) und bestätigen Ihren individuellen Termin – kein automatischer Platz bei öffentlichen Shootings.`,
  },
  {
    title: "Shooting & Galerie",
    description:
      "Nach dem Shooting erhalten Sie Galerie-Zugang und bestellen Ihre Bilder wie gewohnt online.",
  },
] as const;

export const VOUCHER_REDEEM_NOTE =
  "Einlösen bedeutet eine verbindliche Terminanfrage – nicht die automatische Buchung eines öffentlichen Shooting-Termins.";

export const VOUCHER_REDEEM_SUCCESS_STEPS = [
  "Ihre Anmeldung liegt bei uns vor.",
  "Wir prüfen Ihren Wunschtermin und melden uns per E-Mail oder Telefon.",
  "Nach der Terminbestätigung erhalten Sie alle Details zum Shooting.",
  "Anschließend Galerie-Zugang zum Bilder bestellen.",
] as const;
