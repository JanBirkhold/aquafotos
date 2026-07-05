"use server";

import { lookupVoucherForVerifiedAccess } from "@/lib/voucher-queries";
import type { VoucherRedeemLookupView } from "@/lib/voucher-queries";

export type VoucherRedeemAccessState = {
  error?: string;
  voucher?: VoucherRedeemLookupView;
} | null;

export async function verifyVoucherRedeemAccess(
  _prev: VoucherRedeemAccessState,
  formData: FormData,
): Promise<VoucherRedeemAccessState> {
  const code = formData.get("code");
  const email = formData.get("email");

  if (typeof code !== "string" || typeof email !== "string") {
    return { error: "Bitte Gutschein-Code und E-Mail angeben." };
  }

  const result = await lookupVoucherForVerifiedAccess(code, email);
  if ("error" in result) {
    return { error: result.error };
  }

  return { voucher: result.voucher };
}
