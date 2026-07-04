"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Gift, Menu, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shootingOpen, setShootingOpen] = useState(false);

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

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Hauptnavigation">
            <Link
              href="/"
              className="rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-aqua-50 hover:text-aqua-700"
            >
              Start
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-slate-700 outline-none transition-colors hover:bg-aqua-50 hover:text-aqua-700 focus-visible:ring-2 focus-visible:ring-aqua-500"
                aria-label="Shooting-Arten anzeigen"
              >
                Shooting-Arten
                <ChevronDown className="h-4 w-4 opacity-60" aria-hidden />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                {siteConfig.shootingNav.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem asChild>
                  <Link href="/shootings" className="font-medium text-aqua-700">
                    Alle Termine →
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {siteConfig.nav.slice(1).map((item) => (
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
              <Link href="/shootings">Shooting finden</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="hidden md:inline-flex">
              <Link href="/bilder-bestellen">Bilder bestellen</Link>
            </Button>
            <Link
              href="/gutschein/warenkorb"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-aqua-700 transition-colors hover:bg-aqua-50"
              aria-label="Gutschein-Warenkorb"
            >
              <Gift className="h-5 w-5" />
            </Link>
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
          mobileOpen ? "max-h-[40rem] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <nav className="flex flex-col p-4" aria-label="Mobile Navigation">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-aqua-50"
          >
            Start
          </Link>

          <button
            type="button"
            className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-aqua-50"
            onClick={() => setShootingOpen(!shootingOpen)}
            aria-expanded={shootingOpen}
          >
            Shooting-Arten
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", shootingOpen && "rotate-180")}
              aria-hidden
            />
          </button>
          {shootingOpen && (
            <div className="ml-2 flex flex-col border-l border-aqua-100 pl-2">
              {siteConfig.shootingNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-2xl px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-aqua-50"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/shootings"
                onClick={() => setMobileOpen(false)}
                className="rounded-2xl px-4 py-2.5 text-sm font-medium text-aqua-700"
              >
                Alle Termine
              </Link>
            </div>
          )}

          {siteConfig.nav.slice(1).map((item) => (
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
              <Link href="/shootings" onClick={() => setMobileOpen(false)}>
                Shooting finden
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/bilder-bestellen" onClick={() => setMobileOpen(false)}>
                Bilder bestellen
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
