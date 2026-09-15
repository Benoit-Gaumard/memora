import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getSiteUrl } from "@/lib/site-url";
import { getPrivatePhotoUrl } from "@/lib/private-photo";
import { EventMembersManager } from "@/components/admin/event-members-manager";
import { RemoveMemberButton } from "@/components/admin/remove-member-button";
import { EditEventForm } from "@/components/admin/edit-event-form";
import { DeleteEventButton } from "@/components/admin/delete-event-button";
import { EventInviteManager } from "@/components/admin/event-invite-manager";

export default async function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();

  const { data: event } = await supabase.from("events").select("*").eq("id", id).maybeSingle();

  if (!event) {
    notFound();
  }

  let coverImageUrl: string | null = null;
  if (event.cover_image_path) {
    coverImageUrl = getPrivatePhotoUrl(event.cover_image_path);
  }

  const { data: members } = await supabase
    .from("event_members")
    .select("id, user_id, role, status, joined_at, profiles(display_name, username, email)")
    .eq("event_id", id)
    .order("joined_at", { ascending: true });

  const { count: photoCount } = await supabase
    .from("photos")
    .select("id", { count: "exact", head: true })
    .eq("event_id", id);

  const memberUserIds = new Set((members ?? []).map((member) => member.user_id));

  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("id, display_name, username, email")
    .order("display_name", { ascending: true });

  const candidates = (allProfiles ?? [])
    .filter((profile) => !memberUserIds.has(profile.id))
    .map((profile) => ({
      id: profile.id,
      displayName: profile.display_name,
      username: profile.username,
      email: profile.email,
    }));

  const { data: invite } = await supabase
    .from("event_invites")
    .select("code")
    .eq("event_id", id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const siteUrl = await getSiteUrl();

  return (
    <div className="space-y-6">
      <div className="paper p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="display text-[clamp(2.2rem,5vw,3.4rem)]">{event.name}</h2>
          </div>
          <DeleteEventButton eventId={event.id} eventName={event.name} />
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            ["Membres", String(members?.length ?? 0)],
            ["Photos", String(photoCount ?? 0)],
            ["Téléchargement", event.download_enabled ? "Oui" : "Non"],
          ].map(([label, value]) => (
            <div key={String(label)}>
              <dt className="text-base font-semibold text-ink-soft">{label}</dt>
              <dd className="mt-1 font-display text-2xl font-extrabold text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <EditEventForm
        event={{
          id: event.id,
          name: event.name,
          event_type: event.event_type,
          description: event.description,
          event_date: event.event_date,
          end_date: event.end_date ?? null,
          status: event.status,
          cover_image_path: event.cover_image_path,
        }}
        coverImageUrl={coverImageUrl}
      />

      <div>
        <h3 className="mb-3 font-display text-lg font-extrabold text-ink">Lien d’invitation</h3>
        <EventInviteManager eventId={event.id} existingCode={invite?.code ?? null} siteUrl={siteUrl} />
      </div>

      <EventMembersManager eventId={event.id} candidates={candidates} />

      <div className="overflow-hidden paper p-0">
        <div className="border-b border-ink/15 px-5 py-4 font-display text-lg font-extrabold text-ink">Membres</div>
        <table className="min-w-full text-left text-sm text-ink-soft">
          <thead className="bg-paper text-ink-soft">
            <tr>
              {["Nom", "Adresse e-mail", "Rôle", "Statut", ""].map((header) => (
                <th key={header} className="px-4 py-3 font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members?.length ? (
              members.map((member) => {
                const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles;

                return (
                  <tr key={member.id} className="border-t border-ink/15">
                    <td className="px-4 py-4 font-semibold text-ink">
                      {profile?.display_name ?? profile?.username}
                    </td>
                    <td className="px-4 py-4">{profile?.email}</td>
                    <td className="px-4 py-4">{member.role === "organizer" ? "Organisateur" : "Invité"}</td>
                    <td className="px-4 py-4">{member.status}</td>
                    <td className="px-4 py-4">
                      {member.role === "organizer" ? null : (
                        <RemoveMemberButton
                          memberId={member.id}
                          memberName={profile?.display_name ?? profile?.username ?? null}
                        />
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ink-faint">
                  Aucun membre pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
