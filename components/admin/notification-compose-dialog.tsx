"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Eye, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { previewNotificationEmail } from "@/lib/actions/email-templates";
import { renderEmailTemplate } from "@/lib/email-template-definitions";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateKey: string;
  variables: Record<string, string>;
  title: string;
  description?: string;
  recipientLabel: string;
  onConfirm: (draft: { subject: string; bodyHtml: string }) => Promise<void>;
};

export function NotificationComposeDialog({
  open,
  onOpenChange,
  templateKey,
  variables,
  title,
  description,
  recipientLabel,
  onConfirm,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [placeholders, setPlaceholders] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    previewNotificationEmail(templateKey, variables)
      .then((result) => {
        setSubject(result.rawSubject);
        setBodyHtml(result.rawBodyHtml);
        setPlaceholders(result.placeholders);
      })
      .finally(() => setLoading(false));
  }, [open, templateKey, variables]);

  const previewSubject = renderEmailTemplate(subject, variables);
  const previewHtml = renderEmailTemplate(bodyHtml, variables);

  function handleSend() {
    startTransition(async () => {
      await onConfirm({ subject, bodyHtml });
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-slate-200 bg-white p-6 text-slate-900 sm:rounded-2xl">
        <div className="space-y-1 pr-8">
          <h2 className="font-display text-xl font-semibold text-aqua-900">{title}</h2>
          <p className="text-sm text-slate-600">
            {description ?? `Empfänger: ${recipientLabel}`}
          </p>
        </div>

        {loading ? (
          <p className="flex items-center gap-2 py-8 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Vorlage wird geladen…
          </p>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <span>
                Platzhalter:{" "}
                {placeholders.map((p) => (
                  <code key={p} className="mr-1 rounded bg-white px-1">
                    {`{{${p}}}`}
                  </code>
                ))}
              </span>
              <Link
                href="/admin/benachrichtigungen"
                className="text-aqua-700 hover:underline"
              >
                Vorlagen verwalten
              </Link>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notify-subject">Betreff</Label>
              <Input
                id="notify-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={pending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notify-body">E-Mail-Text (HTML)</Label>
              <Textarea
                id="notify-body"
                value={bodyHtml}
                onChange={(e) => setBodyHtml(e.target.value)}
                rows={10}
                className="font-mono text-xs"
                disabled={pending}
              />
            </div>

            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                aria-expanded={showPreview}
              >
                <Eye className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                {showPreview ? "Vorschau ausblenden" : "Vorschau anzeigen"}
              </Button>
              {showPreview && (
                <div className="mt-3 rounded-xl border bg-white p-4">
                  <p className="text-xs font-medium text-slate-500">Vorschau (Beispiel)</p>
                  <p className="mt-1 text-sm font-semibold text-aqua-900">{previewSubject}</p>
                  <div
                    className="prose prose-sm mt-3 max-w-none text-slate-700"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Abbrechen
          </Button>
          <Button type="button" onClick={handleSend} disabled={pending || loading}>
            {pending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Send className="mr-2 h-4 w-4" aria-hidden />
            )}
            Senden
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
