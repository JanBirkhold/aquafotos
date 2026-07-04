import { cookies } from "next/headers";

export const VOUCHER_CART_COOKIE = "aquafotos_voucher_cart";

export async function getOrCreateVoucherSessionId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(VOUCHER_CART_COOKIE)?.value;
  if (existing) return existing;

  const sessionId = crypto.randomUUID();
  jar.set(VOUCHER_CART_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  return sessionId;
}

export async function getVoucherSessionId(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(VOUCHER_CART_COOKIE)?.value ?? null;
}
