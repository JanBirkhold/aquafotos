export function formatArchivedDeleteCenterNotice(orderNumbers: string[]): {
  title: string;
  description: string;
} {
  const list = orderNumbers.length > 0 ? orderNumbers.join(", ") : "—";

  return {
    title: "Aktive Bestellungen vorhanden",
    description: [
      "Der Termin kann gelöscht werden. Galerie und Rohfotos werden entfernt.",
      "",
      `Betroffene Bestellungen: ${list}`,
      "",
      "Die Bestellungen bleiben unter „Bestellungen“ mit Status „Galerie-Daten gelöscht“.",
      "Bestellhistorie, Positionen und Rechnungen bleiben erhalten.",
    ].join("\n"),
  };
}

export function formatSimpleDeleteCenterNotice(parentName: string): {
  title: string;
  description: string;
} {
  return {
    title: "Archivierten Termin löschen?",
    description: `${parentName} – Galerie, Fotos und Terminanfrage werden unwiderruflich gelöscht. Der Gutschein bleibt bestehen.`,
  };
}
