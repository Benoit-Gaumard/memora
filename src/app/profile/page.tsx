import { AppShell } from "@/components/layout/app-shell";
import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { ProfileIdentityForm } from "@/components/profile/profile-identity-form";
import {
  DeleteAccountForm,
  type OwnedEvent,
} from "@/components/profile/delete-account-form";
import { getCurrentProfile } from "@/lib/profile";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  const supabase = await getSupabaseServerClient();
  const { data: ownedEventRows } = await supabase
    .from("events")
    .select("id, name, slug")
    .eq("created_by", profile.id)
    .is("deleted_at", null)
    .order("event_date", { ascending: false });

  const ownedEvents = (ownedEventRows ?? []) as OwnedEvent[];

  return (
    <AppShell>
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <section className="paper p-6 md:p-8">
          <h1 className="display text-[clamp(2.2rem,5vw,3.4rem)]">
            {profile.display_name}
          </h1>

          <dl className="mt-6 divide-y-2 divide-dashed divide-ink/15 text-base">
            <div className="flex justify-between gap-4 py-3">
              <dt className="font-semibold text-ink-soft">Adresse e-mail</dt>
              <dd className="text-right font-display text-lg font-extrabold text-ink">
                {profile.email}
              </dd>
            </div>
          </dl>

          <div className="mt-6 border-t-2 border-dashed border-ink/15 pt-6">
            <ProfileIdentityForm
              username={profile.username}
              displayName={profile.display_name}
            />
          </div>
        </section>

        <section className="paper p-6 md:p-8">
          <h2 className="display-sm text-2xl">Mot de passe</h2>
          <div className="mt-5">
            <ChangePasswordForm email={profile.email ?? null} />
          </div>
        </section>

        <section className="paper paper-danger p-6 md:p-8">
          <h2 className="display-sm text-2xl text-rouge">Supprimer mon compte</h2>
          <p className="mt-2 text-sm font-semibold text-rouge">
            Zone de danger : cette action est définitive.
          </p>
          <div className="mt-5">
            <DeleteAccountForm userId={profile.id} ownedEvents={ownedEvents} />
          </div>
        </section>
      </div>
    </AppShell>
  );
}
