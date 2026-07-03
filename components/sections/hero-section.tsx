"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative min-h-[90vh] overflow-hidden pt-28"
    >
      <div className="absolute inset-0">
        <Image
          src="/images/hero-bg.webp"
          alt="Atmosphärisches Unterwasser-Fotoshooting bei AquaFotos Barntrup"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-aqua-950/60 via-aqua-900/50 to-aqua-950/80" />
        <div className="water-shimmer absolute inset-0 opacity-40" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(90vh-7rem)] max-w-7xl flex-col justify-center px-4 pb-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <p className="mb-4 inline-flex rounded-full glass-dark px-4 py-1.5 text-sm font-medium text-aqua-100">
            Unterwasserfotografie · Barntrup · Lippe · OWL
          </p>
          <h1
            id="hero-heading"
            className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl"
          >
            Unterwasserfotos, die echte Erinnerungen sichtbar machen
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-aqua-50/90 sm:text-xl">
            Professionelle Unterwasser-Fotoshootings für Kinder, Familien und
            besondere Momente – liebevoll inszeniert, hochwertig bearbeitet und
            einfach online bestellbar.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg">
              <Link href="/#termin">Termin buchen</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/galerie">Galerie ansehen</Link>
            </Button>
          </div>

          <p className="mt-6 inline-flex items-center gap-2 rounded-2xl glass-dark px-4 py-3 text-sm text-aqua-100">
            <ShieldCheck className="h-4 w-4 shrink-0 text-aqua-300" aria-hidden="true" />
            Hochauflösende Bilddateien ohne Wasserzeichen nach dem Kauf.
          </p>
        </motion.div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-sand-50 to-transparent"
        aria-hidden="true"
      />
    </section>
  );
}
