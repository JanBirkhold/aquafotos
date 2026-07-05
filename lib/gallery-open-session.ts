"use client";

import { signIn } from "next-auth/react";
import { openGalleryAccess } from "@/lib/actions/gallery-access";

export async function openGallerySession(
  email: string,
  accessCode: string,
): Promise<{ error?: string; accessCode?: string }> {
  const code = accessCode.trim().toUpperCase();
  const mail = email.trim();

  if (!mail || !code) {
    return { error: "E-Mail und Zugangscode sind erforderlich." };
  }

  const result = await openGalleryAccess(mail, code);
  if (result.error) {
    return { error: result.error };
  }

  const signInResult = await signIn("credentials", {
    email: mail,
    accessCode: code,
    redirect: false,
  });

  if (signInResult?.error) {
    return { error: "Anmeldung fehlgeschlagen. Bitte erneut versuchen." };
  }

  return { accessCode: result.accessCode ?? code };
}
