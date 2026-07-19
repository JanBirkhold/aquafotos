import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { LoginForm } from "@/components/sections/login-form";
import { createPageMetadata } from "@/lib/seo";
import { getBreadcrumbSchema } from "@/lib/schema";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = createPageMetadata({
  title: "Login – AquaFotos",
  description: "Login-Bereich für AquaFotos. Neue Anbindung folgt in Kürze.",
  path: "/login",
  noIndex: true,
});

export default function LoginPage() {
  return (
    <>
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Start", url: siteConfig.url },
          { name: "Login", url: `${siteConfig.url}/login` },
        ])}
      />
      <div className="section-padding flex min-h-[70vh] items-center justify-center pt-28">
        <LoginForm />
      </div>
    </>
  );
}
