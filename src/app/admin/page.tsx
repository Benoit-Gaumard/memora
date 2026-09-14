import Link from "next/link";
import { Camera, Image as ImageIcon, Shield, Users } from "lucide-react";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { formatShortDate } from "@/lib/utils";

export default async function AdminDashboard() {
  const supabase = await getSupabaseServerClient();

  const [usersCount, eventsCount, photosCount, recentUsers, recentPhotos] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("events").select("id", { count: "exact", head: true }),
    supabase.from("photos").select("id", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("id, display_name, username, email, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("photos")
      .select("id, original_filename, uploaded_at, events(name), profiles(display_name)")
      .order("uploaded_at", { ascending: false })
      .limit(5),
  ]);

  const stats = [
    { label: "Utilisateurs inscrits", value: usersCount.count ?? 0, icon: Users },
    { label: "Événements créés", value: eventsCount.count ?? 0, icon: Camera },
    { label: "Photos partagées", value: photosCount.count ?? 0, icon: ImageIcon },
  ];

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-3xl border border-[#f0d9bf] bg-white p-5 shadow-sm">
            <div className="w-fit rounded-2xl bg-[#fff4e9] p-2 text-[#d57f45]">
              <Icon className="h-5 w-5" />
            </div>
            <div className="mt-6 text-3xl font-black text-[#201c1a]">{value}</div>
            <div className="mt-2 text-sm text-[#5a4d47]">{label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[32px] border border-[#f0d9bf] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[#d57f45]">
              <Shield className="h-5 w-5" />
              <h2 className="text-lg font-bold text-[#241e1a]">Derniers inscrits</h2>
            </div>
            <Link href="/admin/users" className="text-sm font-semibold text-[#c47242]">
              Voir tout
            </Link>
          </div>

          <div className="mt-4 space-y-3 text-sm text-[#5a4d47]">
            {recentUsers.data?.length ? (
              recentUsers.data.map((user) => (
                <div key={user.id} className="flex items-center justify-between rounded-2xl bg-[#fff9f3] p-3">
                  <div>
                    <div className="font-semibold text-[#241e1a]">{user.display_name}</div>
                    <div className="text-xs text-[#8a7268]">{user.email ?? user.username}</div>
                  </div>
                  <div className="text-xs text-[#8a7268]">{formatShortDate(user.created_at)}</div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl bg-[#fff9f3] p-3 text-[#8a7268]">Aucun inscrit pour le moment.</div>
            )}
          </div>
        </div>

        <div className="rounded-[32px] border border-[#f0d9bf] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[#d57f45]">
              <ImageIcon className="h-5 w-5" />
              <h2 className="text-lg font-bold text-[#241e1a]">Dernières photos</h2>
            </div>
            <Link href="/admin/photos" className="text-sm font-semibold text-[#c47242]">
              Voir tout
            </Link>
          </div>

          <div className="mt-4 space-y-3 text-sm text-[#5a4d47]">
            {recentPhotos.data?.length ? (
              recentPhotos.data.map((photo) => {
                const eventName = Array.isArray(photo.events)
                  ? photo.events[0]?.name
                  : (photo.events as { name?: string } | null)?.name;
                const authorName = Array.isArray(photo.profiles)
                  ? photo.profiles[0]?.display_name
                  : (photo.profiles as { display_name?: string } | null)?.display_name;

                return (
                  <div key={photo.id} className="flex items-center justify-between rounded-2xl bg-[#fff9f3] p-3">
                    <div>
                      <div className="font-semibold text-[#241e1a]">{photo.original_filename}</div>
                      <div className="text-xs text-[#8a7268]">
                        {eventName ?? "Événement"} · {authorName ?? "Membre"}
                      </div>
                    </div>
                    <div className="text-xs text-[#8a7268]">
                      {photo.uploaded_at ? formatShortDate(photo.uploaded_at) : ""}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl bg-[#fff9f3] p-3 text-[#8a7268]">Aucune photo pour le moment.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
