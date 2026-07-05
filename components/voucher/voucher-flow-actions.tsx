import Link from "next/link";
import { Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  active?: "bestellen" | "einloesen";
  className?: string;
  /** Hell auf Hero-Hintergrund */
  variant?: "hero" | "page";
};

export function VoucherFlowActions({ active, className, variant = "page" }: Props) {
  const isHero = variant === "hero";

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <div
        className={cn(
          "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
          isHero
            ? "border border-white/20 bg-white/10 text-aqua-100"
            : "border border-aqua-100 bg-aqua-50 text-aqua-700",
        )}
        aria-hidden
      >
        <Gift className="h-5 w-5" />
      </div>
      <Button
        asChild
        size="lg"
        variant={active === "bestellen" ? "default" : isHero ? "secondary" : "outline"}
      >
        <Link href="/gutschein#gutscheine">Bestellen</Link>
      </Button>
      <Button
        asChild
        size="lg"
        variant={active === "einloesen" ? "default" : isHero ? "secondary" : "outline"}
      >
        <Link href="/gutschein/einloesen">Einlösen</Link>
      </Button>
    </div>
  );
}
