import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** Platzhalter – Auth-Integration folgt. */
export function LoginForm() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <Lock className="mx-auto h-10 w-10 text-aqua-600" aria-hidden="true" />
        <CardTitle className="mt-2">Login</CardTitle>
        <p className="text-sm text-slate-600">
          Der Login wird in Kürze neu angebunden. Bis dahin erreichen Sie uns über Kontakt.
        </p>
      </CardHeader>
      <CardContent className="space-y-3 text-center">
        <Button asChild className="w-full">
          <Link href="/kontakt">Zum Kontakt</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/">Zur Startseite</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
