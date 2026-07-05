"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Loader2 } from "lucide-react";
import { openGallerySession } from "@/lib/gallery-open-session";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

type Props = {
  email: string;
  accessCode: string;
  children: React.ReactNode;
  className?: string;
  size?: ComponentProps<typeof Button>["size"];
  variant?: ComponentProps<typeof Button>["variant"];
  showIcon?: boolean;
};

export function OpenGalleryButton({
  email,
  accessCode,
  children,
  className,
  size = "sm",
  variant = "default",
  showIcon = true,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleOpen() {
    setLoading(true);
    setError("");

    const result = await openGallerySession(email, accessCode);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push(`/galerie/${result.accessCode}`);
  }

  return (
    <div className={cn("inline-flex flex-col items-start gap-1", className)}>
      <Button type="button" size={size} variant={variant} disabled={loading} onClick={handleOpen} className="gap-2">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Galerie wird geöffnet…
          </>
        ) : (
          <>
            {showIcon && <ExternalLink className="h-4 w-4" aria-hidden />}
            {children}
          </>
        )}
      </Button>
      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
