import { AppShell } from "@/components/layout/app-shell";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireSuperAdmin } from "@/lib/admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireSuperAdmin();

  return (
    <AppShell>
      <div className="mb-6">
        <div className="text-xs uppercase tracking-[0.2em] text-[#8d6c5d]">Back-office</div>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-[#201c1a]">Administration</h1>
      </div>

      <AdminNav />

      {children}
    </AppShell>
  );
}
