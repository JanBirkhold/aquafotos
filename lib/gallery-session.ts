import { cookies } from "next/headers";

export const GALLERY_ACCESS_COOKIE = "aquafotos_gallery";

export function cartSessionId(accessCode: string): string {
  return accessCode.trim().toUpperCase();
}

export async function setGalleryAccessCookie(accessCode: string) {
  const jar = await cookies();
  jar.set(GALLERY_ACCESS_COOKIE, cartSessionId(accessCode), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getGalleryAccessCookie(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(GALLERY_ACCESS_COOKIE)?.value ?? null;
}
