const STORAGE_KEY = "aquafotos.voucher-confirmed-location";

export function getLastConfirmedShootingLocation(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)?.trim();
    return value || null;
  } catch {
    return null;
  }
}

export function setLastConfirmedShootingLocation(location: string): void {
  if (typeof window === "undefined") return;
  const trimmed = location.trim();
  if (!trimmed) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, trimmed);
  } catch {
    // Quota or private mode – ignore
  }
}

export function resolveDefaultShootingLocation(fallback: string): string {
  return getLastConfirmedShootingLocation() ?? fallback;
}
