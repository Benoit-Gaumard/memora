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
      <div className="mx-auto max-w-3xl paper p-6 md:p-8">
        <h1 className="display text-[clamp(2.2rem,5vw,3.4rem)]">{profile.display_name}</h1>

        <dl className="mt-6 divide-y-2 divide-dashed divide-ink/15 text-base">
          <div className="flex justify-between gap-4 py-3">
            <dt className="font-semibold text-ink-soft">Nom d’utilisateur</dt>
            <dd className="text-right font-display text-lg font-extrabold text-ink">
              {profile.username}
            </dd>
          </div>
          <div className="flex justify-between gap-4 py-3">
            <dt className="font-semibold text-ink-soft">Adresse e-mail</dt>
            <dd className="text-right font-display text-lg font-extrabold text-ink">
              {profile.email}
            </dd>
          </div>
        </dl>
      </div>
    </AppShell>
  );
}
