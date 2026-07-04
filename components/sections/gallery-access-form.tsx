"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { QrCode, KeyRound, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { openGalleryAccess } from "@/lib/actions/gallery-access";

type Props = {
  defaultAccessCode?: string;
};

export function GalleryAccessForm({ defaultAccessCode = "" }: Props) {
  const router = useRouter();
  const [accessCode, setAccessCode] = useState(defaultAccessCode.toUpperCase());
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const code = accessCode.trim().toUpperCase();
    const mail = email.trim();

    const result = await openGalleryAccess(mail, code);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    const signInResult = await signIn("credentials", {
      email: mail,
      accessCode: code,
      redirect: false,
    });

    if (signInResult?.error) {
      setError("Anmeldung fehlgeschlagen. Bitte erneut versuchen.");
      setLoading(false);
      return;
    }

    router.push(`/galerie/${code}`);
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader className="text-center">
        <KeyRound className="mx-auto h-10 w-10 text-aqua-600" />
        <CardTitle className="mt-2">Bilder bestellen</CardTitle>
        <p className="text-sm text-slate-600">
          Zugangscode und die bei der Anmeldung hinterlegte E-Mail-Adresse eingeben.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail-Adresse</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@beispiel.de"
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accessCode">Zugangscode</Label>
            <Input
              id="accessCode"
              name="accessCode"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
              placeholder="AF-XXXX-001"
              required
              className="font-mono uppercase"
              autoComplete="off"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Wird geprüft…" : "Galerie öffnen"}
          </Button>
        </form>
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-aqua-50 p-4 text-sm text-slate-600">
          <QrCode className="h-5 w-5 shrink-0 text-aqua-600" aria-hidden />
          Der QR-Code vom Shooting enthält Ihren Zugangscode – die E-Mail ist die aus
          Ihrer Anmeldung.
        </div>
        <p className="mt-4 text-center text-sm text-slate-500">
          Team-Login?{" "}
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-aqua-600 hover:underline"
          >
            <Lock className="h-3 w-3" aria-hidden />
            Anmelden
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
