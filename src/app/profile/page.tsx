import { AppShell } from "@/components/layout/app-shell";
import { demoUser } from "@/lib/mock-data";

export default function ProfilePage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl rounded-[32px] border border-[#f0d9bf] bg-white p-6 shadow-sm md:p-8">
        <div className="text-xs uppercase tracking-[0.2em] text-[#8d6c5d]">Profil</div>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-[#201c1a]">{demoUser.display_name}</h1>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-[#fff5ed] p-4">
            <div className="text-sm text-[#806d60]">Username</div>
            <div className="mt-2 text-xl font-bold text-[#1f1b18]">{demoUser.username}</div>
          </div>
          <div className="rounded-2xl bg-[#fff5ed] p-4">
            <div className="text-sm text-[#806d60]">Email</div>
            <div className="mt-2 text-xl font-bold text-[#1f1b18]">{demoUser.email}</div>
          </div>
          <div className="rounded-2xl bg-[#fff5ed] p-4">
            <div className="text-sm text-[#806d60]">Rôle global</div>
            <div className="mt-2 text-xl font-bold text-[#1f1b18]">{demoUser.global_role}</div>
          </div>
          <div className="rounded-2xl bg-[#fff5ed] p-4">
            <div className="text-sm text-[#806d60]">Statut</div>
            <div className="mt-2 text-xl font-bold text-[#1f1b18]">{demoUser.account_status}</div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
