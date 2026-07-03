"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-4 flex items-center justify-between rounded-full glass px-4 py-2 shadow-lg shadow-aqua-900/5">
          <Link href="/" className="flex shrink-0 items-center" aria-label="AquaFotos Startseite">
            <Image
              src="/images/aquafotos_logo.svg"
              alt="AquaFotos Logo – Unterwasserfotografie Barntrup"
              width={120}
              height={48}
              priority
              className="h-10 w-auto sm:h-12"
            />
          </Link>

          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="Hauptnavigation"
          >
            {siteConfig.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-aqua-50 hover:text-aqua-700"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link href="/#termin">Termin buchen</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="hidden md:inline-flex">
              <Link href="/galerie">Bilder ansehen</Link>
            </Button>
            <Link
              href="/warenkorb"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-aqua-700 transition-colors hover:bg-aqua-50"
              aria-label="Warenkorb"
            >
              <ShoppingCart className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="hidden rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-aqua-50 hover:text-aqua-700 sm:inline-block"
            >
              Login
            </Link>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-aqua-700 transition-colors hover:bg-aqua-50 lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              aria-label={mobileOpen ? "Menü schließen" : "Menü öffnen"}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={cn(
          "glass mx-4 mt-2 overflow-hidden rounded-3xl shadow-xl transition-all duration-300 lg:hidden",
          mobileOpen ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <nav className="flex flex-col p-4" aria-label="Mobile Navigation">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-aqua-50"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-2 border-t border-aqua-100 pt-4">
            <Button asChild>
              <Link href="/#termin" onClick={() => setMobileOpen(false)}>
                Termin buchen
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/galerie" onClick={() => setMobileOpen(false)}>
                Bilder ansehen
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
