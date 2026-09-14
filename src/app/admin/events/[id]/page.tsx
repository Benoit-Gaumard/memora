import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase-server";

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

  const { data: members } = await supabase
    .from("event_members")
    .select("id, role, status, joined_at, profiles(display_name, username, email)")
    .eq("event_id", id)
    .order("joined_at", { ascending: true });

  const { count: photoCount } = await supabase
    .from("photos")
    .select("id", { count: "exact", head: true })
    .eq("event_id", id);

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-[#f0d9bf] bg-white p-6 shadow-sm md:p-8">
        <div className="text-xs uppercase tracking-[0.2em] text-[#8d6c5d]">Événement</div>
        <h2 className="mt-3 text-4xl font-black tracking-tight text-[#201c1a]">{event.name}</h2>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ["Type", event.event_type],
            ["Date", new Date(event.event_date).toLocaleDateString("fr-FR")],
            ["Statut", event.status],
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

      <div className="overflow-hidden rounded-[32px] border border-[#f0d9bf] bg-white shadow-sm">
        <div className="border-b border-[#f4e5d3] px-5 py-4 text-lg font-bold text-[#241e1a]">Membres</div>
        <table className="min-w-full text-left text-sm text-[#4d4039]">
          <thead className="bg-[#fff5ed] text-[#786860]">
            <tr>
              {["Nom", "Email", "Rôle", "Statut"].map((header) => (
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
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-[#8a7268]">
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
