"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "ablauf", label: "Ablauf" },
  { id: "veranstaltungen", label: "Veranstaltungen" },
  { id: "preise", label: "Preise" },
  { id: "faq", label: "FAQ" },
] as const;

type Props = {
  className?: string;
};

export function ShootingInfoCategoryNav({ className }: Props) {
  return (
    <nav
      className={cn("flex flex-wrap justify-center gap-2", className)}
      aria-label="Info-Bereiche"
    >
      {SECTIONS.map((section) => (
        <Link
          key={section.id}
          href={`#${section.id}`}
          className="rounded-full border border-aqua-100 bg-white px-4 py-2 text-sm font-medium text-aqua-800 transition-colors hover:bg-aqua-50"
        >
          {section.label}
        </Link>
      ))}
    </nav>
  );
}
