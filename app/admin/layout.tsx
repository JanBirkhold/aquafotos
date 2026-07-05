import { AdminToastProvider } from "@/components/admin/admin-toast-provider";
import Link from "next/link";
import {
  LayoutDashboard,
  Camera,
  CalendarClock,
  ShoppingBag,
  Euro,
  Users,
  Bell,
  Gift,
} from "lucide-react";
import { auth, isStaffRole } from "@/lib/auth";
import { redirect } from "next/navigation";

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/shootings", label: "Shootings", icon: Camera },
  { href: "/admin/terminanfragen", label: "Terminanfragen", icon: CalendarClock },
  { href: "/admin/bestellungen", label: "Bestellungen", icon: ShoppingBag },
  { href: "/admin/gutscheine", label: "Gutscheine", icon: Gift },
  { href: "/admin/preise", label: "Preise", icon: Euro },
  { href: "/admin/benachrichtigungen", label: "Benachrichtigungen", icon: Bell },
  { href: "/admin/partner", label: "Partner", icon: Users },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || !isStaffRole(session.user.role)) {
    redirect("/login");
  }

  return (
    <AdminToastProvider>
      <div className="min-h-screen bg-slate-100 pt-20">
        <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8 lg:px-8">
          <aside className="hidden w-56 shrink-0 lg:block">
            <nav className="sticky top-24 space-y-1 rounded-2xl bg-white p-4 shadow-sm">
              <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Admin
              </p>
              {adminNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-aqua-50 hover:text-aqua-800"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </AdminToastProvider>
  );
}
