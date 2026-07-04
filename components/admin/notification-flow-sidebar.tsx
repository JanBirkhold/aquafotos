"use client";

import Link from "next/link";
import { ArrowUpRight, BookOpen, QrCode, ShoppingBag, CalendarDays } from "lucide-react";
import {
  guidesForTemplate,
  type FlowGuideSection,
} from "@/lib/notification-guide";
import { cn } from "@/lib/utils";

const GUIDE_ICONS: Record<FlowGuideSection["id"], typeof CalendarDays> = {
  termin: CalendarDays,
  galerie: BookOpen,
  bestellung: ShoppingBag,
  qr: QrCode,
};

type Props = {
  templateKey: string;
};

export function NotificationFlowSidebar({ templateKey }: Props) {
  const guides = guidesForTemplate(templateKey);

  return (
    <aside className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Abläufe & Links
      </p>

      {guides.map((guide) => {
        const Icon = GUIDE_ICONS[guide.id];
        return (
          <section
            key={guide.id}
            className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start gap-2">
              <span className="rounded-lg bg-aqua-50 p-2 text-aqua-700">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-aqua-900">{guide.title}</h3>
                <p className="mt-1 text-xs text-slate-500">{guide.summary}</p>
              </div>
            </div>

            <ol className="mt-3 space-y-1.5 text-xs text-slate-600">
              {guide.steps.map((step, i) => (
                <li key={step} className="flex gap-2">
                  <span className="font-mono text-aqua-600">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            <ul className="mt-3 space-y-1 border-t border-slate-100 pt-3">
              {guide.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "inline-flex items-center gap-1 text-xs font-medium text-aqua-700 hover:underline",
                    )}
                    {...(link.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {link.label}
                    <ArrowUpRight className="h-3 w-3" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>

            {guide.tips && guide.tips.length > 0 && (
              <ul className="mt-2 space-y-1 rounded-lg bg-amber-50/80 px-2 py-2 text-[11px] text-amber-900">
                {guide.tips.map((tip) => (
                  <li key={tip}>💡 {tip}</li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </aside>
  );
}
