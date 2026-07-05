export function formatActiveOrdersToastDescription(orderNumbers?: string[]): string {
  if (!orderNumbers?.length) {
    return "Bitte Bestellungen unter Admin → Bestellungen abschließen oder stornieren.";
  }

  const list = orderNumbers.join(", ");
  return `Betroffene Bestellungen: ${list}. Unter „Bestellungen“ prüfen, danach erneut löschen.`;
}

export function showActionResultToast(
  toast: {
    success: (title: string, description?: string) => void;
    error: (title: string, description?: string) => void;
    warning: (title: string, description?: string) => void;
  },
  result: {
    error?: string;
    message?: string;
    orderNumbers?: string[];
  },
) {
  if (result.error) {
    const description = result.orderNumbers?.length
      ? formatActiveOrdersToastDescription(result.orderNumbers)
      : undefined;
    toast.error(result.error, description);
    return;
  }

  if (result.message) {
    toast.success(result.message);
  }
}
