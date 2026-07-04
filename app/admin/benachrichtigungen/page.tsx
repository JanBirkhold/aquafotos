import { EmailTemplateAdminPanel } from "@/components/admin/email-template-admin-panel";
import { getEmailTemplatesForAdmin } from "@/lib/actions/email-templates";

export default async function AdminNotificationsPage() {
  const templates = await getEmailTemplatesForAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-aqua-900">Benachrichtigungen</h1>
        <p className="mt-2 text-slate-600">
          E-Mail-Vorlagen nach Kategorie (Termin, Galerie, Bestellung). Rechts finden Sie die
          Abläufe mit Links – inkl. Galerie-Zugang (E-Mail + Code), QR-Codes und Shop-Flow.
        </p>
      </div>

      <EmailTemplateAdminPanel templates={templates} />
    </div>
  );
}
