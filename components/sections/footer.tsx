import Link from "next/link";
import { Phone, MapPin } from "lucide-react";
import { ObfuscatedEmailLink } from "@/components/obfuscated-email";
import { siteConfig } from "@/lib/site-config";

const footerLinkClass =
  "text-slate-200 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-400 focus-visible:ring-offset-2 focus-visible:ring-offset-aqua-950 rounded-sm";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-aqua-800/60 bg-aqua-950 text-slate-100">
      <div className="mx-auto max-w-7xl section-padding pb-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-white">
              Kontakt
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed">
              <li>
                <a
                  href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
                  className={`inline-flex items-center gap-2 ${footerLinkClass}`}
                >
                  <Phone className="h-4 w-4 shrink-0 text-aqua-300" aria-hidden="true" />
                  {siteConfig.phoneDisplay}
                </a>
              </li>
              <li>
                <ObfuscatedEmailLink
                  className={`${footerLinkClass} hover:underline underline-offset-2`}
                />
              </li>
              <li className="flex items-start gap-2 text-slate-200">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-aqua-300" aria-hidden="true" />
                <span>
                  {siteConfig.address.street}, {siteConfig.address.postalCode}{" "}
                  {siteConfig.address.city}
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-white">
              Navigation
            </h2>
            <nav className="mt-4" aria-label="Footer Navigation">
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
                {siteConfig.nav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={footerLinkClass}>
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/login" className={footerLinkClass}>
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/impressum" className={footerLinkClass}>
                    Impressum
                  </Link>
                </li>
                <li>
                  <Link href="/datenschutz" className={footerLinkClass}>
                    Datenschutz
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-white">
              AquaFotos – Unterwasserfotografie
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-200 sm:text-[0.9375rem]">
              AquaFotos ist Ihr Spezialist für professionelle Unterwasserfotografie
              in Barntrup, Kreis Lippe und Ostwestfalen-Lippe (OWL). Ob
              Unterwasserfotos für Kinder, Familien-Shootings, Veranstaltungen oder
              WeihnachtsMinis – wir schaffen emotionale Bilder, die bleibende
              Erinnerungen werden.{" "}
              <Link href="/#termin" className={`${footerLinkClass} font-medium underline underline-offset-2`}>
                Jetzt Termin buchen
              </Link>{" "}
              oder{" "}
              <Link href="/galerie" className={`${footerLinkClass} font-medium underline underline-offset-2`}>
                Bilder in unserer Galerie entdecken
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-slate-300 sm:flex-row">
          <p>© {currentYear} {siteConfig.name}. Alle Rechte vorbehalten.</p>
          <p>
            Verantwortlich: {siteConfig.owner.name} ·{" "}
            <Link
              href="/impressum"
              className={`${footerLinkClass} underline underline-offset-2`}
            >
              Impressum
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
