"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { heroSlides, siteConfig } from "@/lib/site-config";

export function HeroSection() {
  const [index, setIndex] = useState(0);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % heroSlides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = heroSlides[index];

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative min-h-[100dvh] overflow-hidden pt-28"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.src}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-aqua-950/55 via-aqua-900/45 to-aqua-950/75" />
          <div className="water-shimmer absolute inset-0 opacity-30" />
        </motion.div>
      </AnimatePresence>

      <div className="relative mx-auto flex min-h-[calc(100dvh-7rem)] max-w-7xl flex-col justify-center px-4 pb-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <p className="mb-4 inline-flex rounded-full glass-dark px-4 py-1.5 text-sm font-medium text-aqua-100">
            {slide.label} · Barntrup · Lippe · OWL
          </p>
          <h1
            id="hero-heading"
            className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl"
          >
            {siteConfig.tagline}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-aqua-50/95 sm:text-xl">
            {siteConfig.subline}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg">
              <Link href="/shootings">Shooting finden</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/bilder-bestellen">Bilder bestellen</Link>
            </Button>
          </div>

          <p className="mt-6 inline-flex items-center gap-2 rounded-2xl glass-dark px-4 py-3 text-sm text-aqua-100">
            <ShieldCheck className="h-4 w-4 shrink-0 text-aqua-300" aria-hidden="true" />
            Nur Ihre Familie sieht Ihre Bilder – DSGVO-konform & sicher.
          </p>
        </motion.div>

        <div
          className="absolute bottom-8 left-4 flex gap-2 sm:left-8"
          role="tablist"
          aria-label="Hero-Bilder"
        >
          {heroSlides.map((s, i) => (
            <button
              key={s.src}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={s.label}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-8 bg-white" : "w-4 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-sand-50 to-transparent"
        aria-hidden="true"
      />
    </section>
  );
}
