import { ChevronDown } from "lucide-react";
import { FaqAnswer } from "@/components/sections/faq-answer";
import {
  FAQ_ITEMS,
  getFaqGroups,
  type FaqItem,
} from "@/lib/shooting-info-content";
import { cn } from "@/lib/utils";

type Props = {
  title?: string;
  description?: string;
  items?: FaqItem[];
  grouped?: boolean;
  className?: string;
};

export function FaqSection({
  title = "Häufige Fragen",
  description = "Antworten zu Anmeldung, Ablauf, Preisen und Bestellung.",
  items,
  grouped = false,
  className,
}: Props) {
  const groups = grouped ? getFaqGroups() : null;
  const flatItems = items ?? FAQ_ITEMS;

  return (
    <section className={cn("scroll-mt-28", className)} aria-labelledby="faq-heading">
      <div className="mx-auto max-w-3xl">
        <h2
          id="faq-heading"
          className="font-display text-2xl font-bold text-aqua-900 sm:text-3xl"
        >
          {title}
        </h2>
        {description && <p className="mt-3 text-slate-600">{description}</p>}

        {groups ? (
          <div className="mt-8 space-y-10">
            {groups.map((group) => (
              <div key={group.slug}>
                <h3 className="font-display text-lg font-semibold text-aqua-800">
                  {group.label}
                </h3>
                <div className="mt-4 space-y-3">
                  {group.items.map((item) => (
                    <FaqDetails key={item.id} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {flatItems.map((item) => (
              <FaqDetails key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function FaqDetails({ item }: { item: FaqItem }) {
  return (
    <details
      id={item.id}
      className="group scroll-mt-28 rounded-2xl border border-aqua-100 bg-white shadow-sm open:shadow-md open:shadow-aqua-900/5"
    >
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-4 text-left font-medium text-aqua-900 marker:content-none [&::-webkit-details-marker]:hidden">
        <span>{item.question}</span>
        <ChevronDown
          className="mt-0.5 h-5 w-5 shrink-0 text-aqua-500 transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="border-t border-aqua-50 px-5 pb-5 pt-3 text-sm leading-relaxed text-slate-600">
        <FaqAnswer answer={item.answer} />
      </div>
    </details>
  );
}
