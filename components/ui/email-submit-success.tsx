import { Mail, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  message: string;
  emailSent?: boolean;
  emailNotice?: string;
  className?: string;
};

export function EmailSubmitSuccess({
  title,
  message,
  emailSent,
  emailNotice,
  className,
}: Props) {
  const showWarning = emailSent === false;

  return (
    <div
      className={cn(
        "rounded-2xl border p-8 text-center",
        showWarning
          ? "border-amber-200 bg-amber-50/80"
          : "border-green-200 bg-green-50/80",
        className,
      )}
      role="status"
    >
      {showWarning ? (
        <AlertTriangle className="mx-auto h-10 w-10 text-amber-700" aria-hidden />
      ) : (
        <Mail className="mx-auto h-10 w-10 text-green-700" aria-hidden />
      )}
      <h3
        className={cn(
          "mt-4 font-display text-xl font-semibold",
          showWarning ? "text-amber-900" : "text-green-900",
        )}
      >
        {title}
      </h3>
      {emailSent !== false && (
        <p className={cn("mt-2 text-sm", showWarning ? "text-amber-800" : "text-green-800")}>
          {message}
        </p>
      )}
      {emailNotice && (
        <p className="mt-2 text-sm text-amber-800" role="note">
          {emailNotice}
        </p>
      )}
    </div>
  );
}
