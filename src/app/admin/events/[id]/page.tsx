import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getSiteUrl } from "@/lib/site-url";
import { PHOTO_SIGNED_URL_TTL_SECONDS } from "@/lib/storage";
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
    const { data: signed } = await supabase.storage
      .from("event-photos")
      .createSignedUrl(event.cover_image_path, PHOTO_SIGNED_URL_TTL_SECONDS);
    coverImageUrl = signed?.signedUrl ?? null;
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
      <div className="rounded-[32px] border border-[#f0d9bf] bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-[#8d6c5d]">Événement</div>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-[#201c1a]">{event.name}</h2>
          </div>
          <DeleteEventButton eventId={event.id} eventName={event.name} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ["Membres", String(members?.length ?? 0)],
            ["Photos", String(photoCount ?? 0)],
            ["Téléchargement", event.download_enabled ? "Oui" : "Non"],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-2xl bg-[#fff5ed] p-4">
              <div className="text-sm text-[#7d675d]">{label}</div>
              <div className="mt-2 text-lg font-bold text-[#241e1a]">{value}</div>
            </div>
          ))}
        </div>
      </div>

      <EditEventForm
        event={{
          id: event.id,
          name: event.name,
          event_type: event.event_type,
          description: event.description,
          event_date: event.event_date,
          status: event.status,
          cover_image_path: event.cover_image_path,
        }}
        coverImageUrl={coverImageUrl}
      />

      <div>
        <h3 className="mb-3 text-lg font-bold text-[#241e1a]">Lien d’invitation</h3>
        <EventInviteManager eventId={event.id} existingCode={invite?.code ?? null} siteUrl={siteUrl} />
      </div>

      <EventMembersManager eventId={event.id} candidates={candidates} />

      <div className="overflow-hidden rounded-[32px] border border-[#f0d9bf] bg-white shadow-sm">
        <div className="border-b border-[#f4e5d3] px-5 py-4 text-lg font-bold text-[#241e1a]">Membres</div>
        <table className="min-w-full text-left text-sm text-[#4d4039]">
          <thead className="bg-[#fff5ed] text-[#786860]">
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
                  <tr key={member.id} className="border-t border-[#f4e5d3]">
                    <td className="px-4 py-4 font-semibold text-[#221d1a]">
                      {profile?.display_name ?? profile?.username}
                    </td>
                    <td className="px-4 py-4">{profile?.email}</td>
                    <td className="px-4 py-4">{member.role === "organizer" ? "Organisateur" : "Invité"}</td>
                    <td className="px-4 py-4">{member.status}</td>
                    <td className="px-4 py-4">
                      {member.role === "organizer" ? null : <RemoveMemberButton memberId={member.id} />}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-[#8a7268]">
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
