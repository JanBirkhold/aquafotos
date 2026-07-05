import Link from "next/link";
import { ShoppingBag, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { siteConfig } from "@/lib/site-config";

type CartNoticeProps = {
  empty?: boolean;
};

export function CartNotice({ empty = true }: CartNoticeProps) {
  if (!empty) return null;

  return (
    <Card className="mx-auto max-w-xl text-center">
      <CardContent className="p-8">
        <ShoppingBag
          className="mx-auto h-12 w-12 text-aqua-400"
          aria-hidden="true"
        />
        <h2 className="mt-4 font-display text-xl font-semibold text-aqua-900">
          Ihr Warenkorb ist leer
        </h2>
        <p className="mt-2 text-slate-600">
          Es befinden sich keine Bilder in Ihrem Warenkorb. Hier geht es zur
          Veranstaltungsübersicht.
        </p>
        <Button asChild className="mt-6">
          <Link href="/bilder-bestellen">Zur Galerie / Bilder bestellen</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function OrderInfoNotices() {
  return (
    <div className="mx-auto mt-8 max-w-3xl space-y-4">
      <Notice
        title="Vorschaubilder"
        text="Vorschaubilder haben bewusst eine geringe Auflösung und ein Wasserzeichen. Nach dem Kauf erhalten Sie hochauflösende Bilddateien ohne Wasserzeichen."
      />
      <Notice
        title="Echtzeit-Überweisung"
        text={`Bei Echtzeit-Überweisung stehen Ihre fertigen Bilddateien in der Regel innerhalb weniger Minuten zum Download bereit – auch an Sonn- und Feiertagen. Bei Verzögerungen erreichen Sie uns unter ${siteConfig.phoneDisplay}.`}
      />
      <Notice
        title="Cookies im Bestellprozess"
        text="Im Bestellprozess werden Cookies für Authentifizierung und Warenkorb verwendet."
      />
    </div>
  );
}

function Notice({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-aqua-100 bg-aqua-50/50 p-4">
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-aqua-600" aria-hidden="true" />
      <div>
        <h3 className="text-sm font-semibold text-aqua-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">{text}</p>
      </div>
    </div>
  );
}
