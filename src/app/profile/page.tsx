import { AppShell } from "@/components/layout/app-shell";
import { getCurrentProfile } from "@/lib/profile";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl rounded-[32px] border border-[#f0d9bf] bg-white p-6 shadow-sm md:p-8">
        <div className="text-xs uppercase tracking-[0.2em] text-[#8d6c5d]">Profil</div>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-[#201c1a]">{profile.display_name}</h1>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-[#fff5ed] p-4">
            <div className="text-sm text-[#806d60]">Nom d’utilisateur</div>
            <div className="mt-2 text-xl font-bold text-[#1f1b18]">{profile.username}</div>
          </div>
          <div className="rounded-2xl bg-[#fff5ed] p-4">
            <div className="text-sm text-[#806d60]">Adresse e-mail</div>
            <div className="mt-2 text-xl font-bold text-[#1f1b18]">{profile.email}</div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
