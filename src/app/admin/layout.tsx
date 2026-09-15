import { AppShell } from "@/components/layout/app-shell";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireSuperAdmin } from "@/lib/admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireSuperAdmin();

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="display text-[clamp(2.2rem,5vw,3.4rem)]">Administration</h1>
      </div>

      <AdminNav />

      {children}
    </AppShell>
  );
}
