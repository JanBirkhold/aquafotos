"use client";

import { siteConfig } from "@/lib/site-config";

export function ObfuscatedEmailLink({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const encoded = btoa(`${siteConfig.emailUser}@${siteConfig.emailDomain}`);

  return (
    <a
      href="#"
      className={className}
      data-email={encoded}
      onClick={(e) => {
        e.preventDefault();
        const email = atob(
          (e.currentTarget as HTMLAnchorElement).dataset.email ?? "",
        );
        window.location.href = `mailto:${email}`;
      }}
    >
      {children ?? "E-Mail schreiben"}
    </a>
  );
}
