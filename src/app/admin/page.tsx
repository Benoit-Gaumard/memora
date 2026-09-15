import Link from "next/link";
import { Camera, Image as ImageIcon, MessageCircle, Shield, Users } from "lucide-react";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getPrivatePhotoUrl } from "@/lib/private-photo";
import { formatShortDate } from "@/lib/utils";

export default async function AdminDashboard() {
  const supabase = await getSupabaseServerClient();

  const [usersCount, eventsCount, photosCount, commentsCount, recentUsers, recentPhotos] =
    await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("events").select("id", { count: "exact", head: true }),
      supabase.from("photos").select("id", { count: "exact", head: true }),
      supabase.from("photo_comments").select("id", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("id, display_name, username, email, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("photos")
        .select(
          "id, original_filename, uploaded_at, storage_thumbnail_path, events(name), profiles!user_id(display_name)",
        )
        .order("uploaded_at", { ascending: false })
        .limit(5),
    ]);

  const stats = [
    { label: "Utilisateurs inscrits", value: usersCount.count ?? 0, icon: Users },
    { label: "Événements créés", value: eventsCount.count ?? 0, icon: Camera },
    { label: "Photos partagées", value: photosCount.count ?? 0, icon: ImageIcon },
    { label: "Commentaires laissés", value: commentsCount.count ?? 0, icon: MessageCircle },
  ];

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="paper p-5">
            <div className="w-fit text-fuchsia">
              <Icon className="h-5 w-5" />
            </div>
            <div className="mt-4 font-display text-4xl font-extrabold text-ink">{value}</div>
            <div className="mt-2 text-sm text-ink-soft">{label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="paper p-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-fuchsia">
              <Shield className="h-5 w-5" />
              <h2 className="font-display text-lg font-extrabold text-ink">Derniers inscrits</h2>
            </div>
            <Link href="/admin/users" className="text-sm font-semibold text-fuchsia">
              Voir tout
            </Link>
          </div>

          <div className="mt-4 divide-y-2 divide-dashed divide-ink/15 text-sm text-ink-soft">
            {recentUsers.data?.length ? (
              recentUsers.data.map((user) => (
                <div key={user.id} className="flex items-center justify-between gap-3 py-2">
                  <div>
                    <div className="font-semibold text-ink">{user.display_name}</div>
                    <div className="text-xs text-ink-faint">{user.email ?? user.username}</div>
                  </div>
                  <div className="text-xs text-ink-faint">{formatShortDate(user.created_at)}</div>
                </div>
              ))
            ) : (
              <div className="py-2 text-ink-faint">Aucun inscrit pour le moment.</div>
            )}
          </div>
        </div>

        <div className="paper p-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-fuchsia">
              <ImageIcon className="h-5 w-5" />
              <h2 className="font-display text-lg font-extrabold text-ink">Dernières photos</h2>
            </div>
            <Link href="/admin/photos" className="text-sm font-semibold text-fuchsia">
              Voir tout
            </Link>
          </div>

          <div className="mt-4 divide-y-2 divide-dashed divide-ink/15 text-sm text-ink-soft">
            {recentPhotos.data?.length ? (
              recentPhotos.data.map((photo) => {
                const eventName = Array.isArray(photo.events)
                  ? photo.events[0]?.name
                  : (photo.events as { name?: string } | null)?.name;
                const authorName = Array.isArray(photo.profiles)
                  ? photo.profiles[0]?.display_name
                  : (photo.profiles as { display_name?: string } | null)?.display_name;
                const thumbnailUrl = photo.storage_thumbnail_path
                  ? getPrivatePhotoUrl(photo.storage_thumbnail_path)
                  : null;

                return (
                  <div key={photo.id} className="flex items-center justify-between gap-3 py-2">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="h-10 w-12 shrink-0 overflow-hidden rounded-xl border border-ink/15 bg-paper">
                        {thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={thumbnailUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-ink">
                          {photo.original_filename}
                        </div>
                        <div className="truncate text-xs text-ink-faint">
                          {eventName ?? "Événement"} · {authorName ?? "Membre"}
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 text-xs text-ink-faint">
                      {photo.uploaded_at ? formatShortDate(photo.uploaded_at) : ""}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-2 text-ink-faint">Aucune photo pour le moment.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
