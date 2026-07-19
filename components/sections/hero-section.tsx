"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const VIDEO_SRC = "/images/Hero-video.mp4?v=scrub2";
const POSTER_SRC = "/images/hero-bg.webp";
/** Mehr Viewport-Höhe = langsameres, spürbareres Scrubbing */
const SCROLL_VH = 240;
const FRAME_DT = 1 / 24;
/** Unter diesem Scroll-Fortschritt: normales Abspielen (Video sichtbar „lebt“) */
const PLAY_ZONE = 0.02;

function snapToFrame(time: number, duration: number) {
  const frame = Math.round(time / FRAME_DT);
  return Math.min(duration, Math.max(0, frame * FRAME_DT));
}

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const targetTimeRef = useRef(0);
  const seekingRef = useRef(false);
  const durationRef = useRef(0);
  const rafScrollRef = useRef<number | null>(null);
  const scrubbingRef = useRef(false);

  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;

    const applyContent = (p: number) => {
      const t = Math.min(1, Math.max(0, p));
      if (!contentRef.current) return;
      contentRef.current.style.opacity = String(1 - t * 0.28);
      contentRef.current.style.transform = `translate3d(0, ${t * 24}px, 0)`;
    };

    const flushSeek = () => {
      if (seekingRef.current || !scrubbingRef.current) return;
      const next = targetTimeRef.current;
      if (Math.abs(video.currentTime - next) < FRAME_DT * 0.35) return;
      seekingRef.current = true;
      try {
        video.currentTime = next;
      } catch {
        seekingRef.current = false;
      }
    };

    const onSeeked = () => {
      seekingRef.current = false;
      if (!scrubbingRef.current) return;
      if (Math.abs(video.currentTime - targetTimeRef.current) >= FRAME_DT * 0.35) {
        flushSeek();
      }
    };

    const readProgress = () => {
      const el = sectionRef.current;
      if (!el) return 0;
      const scrollable = el.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return 0;
      const scrolled = Math.min(scrollable, Math.max(0, -el.getBoundingClientRect().top));
      return scrolled / scrollable;
    };

    const enterPlayMode = () => {
      scrubbingRef.current = false;
      seekingRef.current = false;
      video.loop = true;
      applyContent(0);
      const play = video.play();
      if (play) void play.catch(() => undefined);
    };

    const enterScrubMode = (p: number) => {
      scrubbingRef.current = true;
      video.loop = false;
      if (!video.paused) video.pause();
      const dur = durationRef.current || video.duration;
      if (!dur) return;
      targetTimeRef.current = snapToFrame(p * dur, dur);
      applyContent(p);
      flushSeek();
    };

    const onScroll = () => {
      if (rafScrollRef.current != null) return;
      rafScrollRef.current = requestAnimationFrame(() => {
        rafScrollRef.current = null;
        if (cancelled) return;
        const dur = durationRef.current || video.duration;
        if (!dur) return;
        const p = readProgress();
        if (p <= PLAY_ZONE) {
          if (scrubbingRef.current || video.paused) enterPlayMode();
          else applyContent(0);
          return;
        }
        enterScrubMode(p);
      });
    };

    const onReady = async () => {
      if (cancelled) return;
      durationRef.current = video.duration;
      video.muted = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      // First frame paint (Safari/Chrome oft schwarz ohne Play-Priming)
      try {
        await video.play();
        video.pause();
        video.currentTime = 0;
      } catch {
        /* autoplay blocked – Poster bleibt sichtbar */
      }
      onScroll();
    };

    video.addEventListener("seeked", onSeeked);
    if (video.readyState >= 2) void onReady();
    else video.addEventListener("loadeddata", () => void onReady(), { once: true });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      cancelled = true;
      video.removeEventListener("seeked", onSeeked);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafScrollRef.current != null) cancelAnimationFrame(rafScrollRef.current);
      video.pause();
    };
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="hero-heading"
      className="relative"
      style={{ height: reducedMotion ? undefined : `${SCROLL_VH}vh` }}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-aqua-950",
          reducedMotion ? "min-h-[100dvh]" : "sticky top-0 h-[100dvh]",
        )}
      >
        <div className="absolute inset-0">
          {/* Poster immer darunter – nie schwarzer Hero wenn Video noch lädt */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={POSTER_SRC}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
            aria-hidden
          />
          {!reducedMotion && (
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover object-center"
              src={VIDEO_SRC}
              poster={POSTER_SRC}
              muted
              playsInline
              preload="auto"
              autoPlay
              loop
              aria-hidden
              tabIndex={-1}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-aqua-950/35 via-aqua-900/20 to-aqua-950/45" />
        </div>

        <div
          ref={contentRef}
          className="relative z-10 mx-auto flex h-full min-h-[100dvh] max-w-7xl flex-col justify-center px-4 pb-28 pt-28 sm:px-6 lg:px-8"
          style={{ willChange: "opacity, transform" }}
        >
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex rounded-full glass-dark px-4 py-1.5 text-sm font-medium text-aqua-100">
              Unterwasser · Barntrup · Detmold · Lage · Bad Salzuflen
            </p>
            <h1
              id="hero-heading"
              className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl"
            >
              {siteConfig.name}
            </h1>
            <p className="mt-3 font-display text-2xl font-semibold text-aqua-50 sm:text-3xl">
              {siteConfig.tagline}
            </p>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-aqua-50/95 sm:text-xl">
              {siteConfig.subline}
            </p>

            <div className="mt-8 flex flex-row flex-wrap items-center gap-2 sm:gap-3">
              <Button
                asChild
                size="sm"
                className="rounded-full px-4 sm:h-13 sm:px-8 sm:text-base"
              >
                <Link href="/shootings">Shooting finden</Link>
              </Button>
              <Button
                asChild
                variant="secondary"
                size="sm"
                className="rounded-full px-4 sm:h-13 sm:px-8 sm:text-base"
              >
                <Link href="/bilder-bestellen">Bilder bestellen</Link>
              </Button>
            </div>
          </div>
        </div>

        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-sand-50 to-transparent"
          aria-hidden
        />
      </div>
    </section>
  );
}
