export function buildBilderBestellenUrl(
  accessCode: string,
  options?: { email?: string; auto?: boolean },
): string {
  const params = new URLSearchParams();
  params.set("code", accessCode.trim().toUpperCase());
  const email = options?.email?.trim();
  if (email) params.set("email", email);
  if (options?.auto) params.set("auto", "1");
  return `/bilder-bestellen?${params.toString()}`;
}

export function appendGalleryEmailToPath(path: string, email?: string): string {
  const trimmed = email?.trim();
  if (!trimmed) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}email=${encodeURIComponent(trimmed)}`;
}
