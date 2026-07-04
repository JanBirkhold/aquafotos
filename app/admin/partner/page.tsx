import { PartnerAdminPanel } from "@/components/admin/partner-admin-panel";
import { prisma } from "@/lib/prisma";
import { partnerTypes } from "@/lib/shooting-types";

export default async function AdminPartnerPage() {
  let partners: Parameters<typeof PartnerAdminPanel>[0]["partners"] = [];

  try {
    partners = await prisma.partner.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  } catch {
    partners = [];
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-aqua-900">Partner</h1>
        <p className="text-sm text-slate-500">
          Partner mit Logo und Beschreibung – werden auf der Website angezeigt
        </p>
      </div>

      <PartnerAdminPanel partners={partners} />

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold text-aqua-900">Partnertypen (Info)</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {partnerTypes.map((pt) => (
            <div key={pt.type} className="rounded-2xl bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-aqua-900">{pt.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{pt.message}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
