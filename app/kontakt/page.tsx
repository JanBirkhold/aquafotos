import type { Metadata } from "next";
import { KontaktContent } from "@/components/sections/kontakt-content";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Kontakt – AquaFotos Barntrup",
  description:
    "Kontaktieren Sie AquaFotos für Unterwasser-, Kita- und Familienfotografie. Terminbenachrichtigung und individuelle Shooting-Anfrage.",
  path: "/kontakt",
});

export default function KontaktPage() {
  return <KontaktContent />;
}
