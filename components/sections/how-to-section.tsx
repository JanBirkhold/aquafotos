import Link from "next/link";
import { FaqAnswer } from "@/components/sections/faq-answer";
import type { HowToBlock } from "@/lib/shooting-info-content";

type Props = {
  block: HowToBlock;
};

export function HowToSection({ block }: Props) {
  return (
    <section
      id={block.id}
      className="scroll-mt-28"
      aria-labelledby={`howto-${block.id}`}
    >
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-wide text-aqua-600">Ablauf</p>
        <h2
          id={`howto-${block.id}`}
          className="mt-1 font-display text-2xl font-bold text-aqua-900 sm:text-3xl"
        >
          {block.title}
        </h2>
        <div className="mt-4 space-y-4 text-slate-600">
          {block.paragraphs.map((p) => (
            <p key={p.slice(0, 48)}>{p}</p>
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

        <p className="mt-6 text-sm text-slate-500">
          Mehr Details und Termine unter{" "}
          <Link href="/shootings" className="text-aqua-700 underline underline-offset-2">
            Shootings
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
