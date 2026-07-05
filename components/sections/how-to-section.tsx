import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SHOOTING_INFO_CATEGORIES,
  type HowToBlock,
} from "@/lib/shooting-info-content";
import { FaqAnswer } from "@/components/sections/faq-answer";

type Props = {
  block: HowToBlock;
};

export function HowToSection({ block }: Props) {
  const categoryLabel =
    SHOOTING_INFO_CATEGORIES.find((c) => c.slug === block.slug)?.label ?? "Angebot";
  return (
    <section
      id={block.slug}
      className="scroll-mt-28 border-b border-aqua-100 py-12 last:border-b-0"
      aria-labelledby={`howto-${block.slug}`}
    >
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_280px]">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-aqua-600">
            Ablauf
          </p>
          <h2
            id={`howto-${block.slug}`}
            className="mt-1 font-display text-2xl font-bold text-aqua-900"
          >
            {block.title}
          </h2>
          <div className="mt-4 space-y-4 text-slate-600">
            {block.paragraphs.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>

          <ol className="mt-8 space-y-4">
            {block.steps.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-aqua-100 text-sm font-semibold text-aqua-800"
                  aria-hidden
                >
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium text-aqua-900">{step.title}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    <FaqAnswer answer={step.description} />
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="sm">
              <Link href={`/shootings?kategorie=${block.shootingFilter}`}>
                Termine ansehen
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={block.serviceHref}>
                Mehr zu {categoryLabel}
                <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>

        {block.aside && (
          <aside className="h-fit rounded-2xl border border-aqua-100 bg-aqua-50/50 p-6">
            <h3 className="font-display text-lg font-semibold text-aqua-900">
              {block.aside.title}
            </h3>
            <p className="mt-2 text-sm text-slate-600">{block.aside.text}</p>
            <Button asChild className="mt-4 w-full" size="sm" variant="outline">
              <Link href={block.aside.ctaHref}>{block.aside.ctaLabel}</Link>
            </Button>
          </aside>
        )}
      </div>
    </section>
  );
}
