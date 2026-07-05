import type { ReactNode } from "react";
import Link from "next/link";
import {
  FAQ_LINKS,
  type FaqLinkKey,
} from "@/lib/shooting-info-content";

const LINK_PATTERN = /\{(\w+)\}/g;

export function FaqAnswer({ answer }: { answer: string }) {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = LINK_PATTERN.exec(answer)) !== null) {
    if (match.index > lastIndex) {
      parts.push(answer.slice(lastIndex, match.index));
    }

    const key = match[1] as FaqLinkKey;
    const link = FAQ_LINKS[key];

    if (link) {
      parts.push(
        link.external ? (
          <a
            key={`${key}-${match.index}`}
            href={link.href}
            className="font-medium text-aqua-700 underline underline-offset-2 hover:text-aqua-900"
          >
            {link.label}
          </a>
        ) : (
          <Link
            key={`${key}-${match.index}`}
            href={link.href}
            className="font-medium text-aqua-700 underline underline-offset-2 hover:text-aqua-900"
          >
            {link.label}
          </Link>
        ),
      );
    } else {
      parts.push(match[0]);
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < answer.length) {
    parts.push(answer.slice(lastIndex));
  }

  return <>{parts}</>;
}
