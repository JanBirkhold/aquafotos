import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Bestellung erfolgreich – AquaFotos",
  description: "Vielen Dank für Ihre Bestellung bei AquaFotos.",
  path: "/bestellung/erfolg",
});

type Props = { searchParams: Promise<{ order?: string }> };

export default async function OrderSuccessPage({ searchParams }: Props) {
  const { order } = await searchParams;

  return (
    <div className="section-padding flex min-h-[70vh] items-center pt-28">
      <div className="mx-auto max-w-lg text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-aqua-600" aria-hidden />
        <h1 className="mt-6 font-display text-3xl font-bold text-aqua-900">
          Vielen Dank für Ihre Bestellung!
        </h1>
        {order && (
          <p className="mt-3 font-mono text-sm text-slate-600">
            Bestellnummer: <strong>{order}</strong>
          </p>
        )}
        <p className="mt-4 text-slate-600">
          Wir beginnen mit der Bearbeitung Ihrer Bilder. Sie erhalten eine E-Mail, sobald die
          fertigen Dateien zum Download bereitstehen.
        </p>
        {order && (
          <Button asChild className="mt-6" variant="outline">
            <Link href={`/bestellung/${encodeURIComponent(order)}`}>
              Bestellstatus verfolgen
            </Link>
          </Button>
        )}
        <Button asChild className="mt-4">
          <Link href="/">Zur Startseite</Link>
        </Button>
      </div>
    </div>
  );
}
