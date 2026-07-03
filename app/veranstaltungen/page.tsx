import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { OrderInfoNotices } from "@/components/sections/cart-notice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPageMetadata } from "@/lib/seo";
import { getBreadcrumbSchema } from "@/lib/schema";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = createPageMetadata({
  title: "Veranstaltungen – Fotos online bestellen",
  description:
    "AquaFotos Veranstaltungen: Unterwasserfotos von Events und Shootings online ansehen und bestellen. WeihnachtsMinis und Schul-Events in Barntrup.",
  path: "/veranstaltungen",
});

const placeholderEvents = [
  {
    id: "weihnachtsminis-2025",
    title: "WeihnachtsMinis 2025",
    date: "November – Dezember 2025",
    description:
      "Festliche Unterwasser-Minishootings für die ganze Familie in Barntrup.",
  },
  {
    id: "schule-beispiel",
    title: "Schulveranstaltung (Beispiel)",
    date: "Auf Anfrage",
    description:
      "Gruppenfotos und Einzelportraits – Bilder nach dem Event online bestellbar.",
  },
];

export default function VeranstaltungenPage() {
  return (
    <>
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Start", url: siteConfig.url },
          {
            name: "Veranstaltungen",
            url: `${siteConfig.url}/veranstaltungen`,
          },
        ])}
      />
      <div className="section-padding pt-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-display text-4xl font-bold text-aqua-900">
              Veranstaltungen
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Finden Sie Ihre Veranstaltung und bestellen Sie Unterwasserfotos
              bequem online. Login erforderlich für den Zugriff auf
              Vorschaubilder.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {placeholderEvents.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <CalendarDays
                      className="mt-1 h-5 w-5 text-aqua-600"
                      aria-hidden="true"
                    />
                    <div>
                      <CardTitle>{event.title}</CardTitle>
                      <p className="mt-1 text-sm text-aqua-600">{event.date}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">{event.description}</p>
                  <Button asChild className="mt-4">
                    <Link href="/login">Zur Veranstaltung</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <OrderInfoNotices />
        </div>
      </div>
    </>
  );
}
