"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LoginForm() {
  const [error, setError] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(true);
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <Lock className="mx-auto h-10 w-10 text-aqua-600" aria-hidden="true" />
        <CardTitle className="mt-2">Login</CardTitle>
        <p className="text-sm text-slate-600">
          Melden Sie sich mit Ihrem Veranstaltungs-Passwort an, um
          Vorschaubilder zu sehen und Fotos zu bestellen.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Passwort</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              aria-invalid={error}
              aria-describedby={error ? "login-error" : undefined}
            />
          </div>
          {error && (
            <p id="login-error" className="text-sm text-red-600" role="alert">
              Login-Funktion wird mit Supabase-Backend angebunden. Bitte
              kontaktieren Sie uns bei Fragen.
            </p>
          )}
          <Button type="submit" className="w-full">
            Anmelden
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          <Link
            href="/veranstaltungen"
            className="text-aqua-600 hover:underline"
          >
            Zur Veranstaltungsübersicht
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
