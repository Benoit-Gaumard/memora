import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { EventCard } from "@/components/dashboard/event-card";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getPrivatePhotoUrl } from "@/lib/private-photo";

export default async function EventsPage() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: memberships } = await supabase
    .from("event_members")
    .select("events(*, event_members(count), photos(count), photo_comments(count))")
    .eq("user_id", user.id)
    .eq("status", "active");

  const events = (memberships ?? [])
    .map((membership) => (Array.isArray(membership.events) ? membership.events[0] : membership.events))
    .filter((event): event is NonNullable<typeof event> => Boolean(event));

  const coverUrls = new Map<string, string>();
  for (const event of events) {
    if (!event.cover_image_path) continue;
    coverUrls.set(event.id, getPrivatePhotoUrl(event.cover_image_path));
  }

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="display text-[clamp(2.2rem,5vw,3.4rem)]">Mes albums de fête</h1>
        {events.length ? (
          <p className="mt-3 max-w-[38rem] text-base leading-7 text-ink-soft">
            Ouvrez un album pour voir toutes ses photos et y ajouter les vôtres.
          </p>
        ) : null}
      </div>

      {events.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => {
            const memberCount = Array.isArray(event.event_members)
              ? (event.event_members[0]?.count ?? 0)
              : 0;
            const photoCount = Array.isArray(event.photos) ? (event.photos[0]?.count ?? 0) : 0;
            const commentCount = Array.isArray(event.photo_comments)
              ? (event.photo_comments[0]?.count ?? 0)
              : 0;

            return (
              <EventCard
                key={event.id}
                event={event}
                memberCount={memberCount}
                photoCount={photoCount}
                commentCount={commentCount}
                coverImageUrl={coverUrls.get(event.id)}
              />
            );
          })}
        </div>
      ) : (
        <div className="paper p-8 text-center">
          <div className="display-sm text-2xl">Pas encore d’album à votre nom.</div>
          <p className="mt-3 text-base leading-7 text-ink-soft">
            Ouvrez le lien ou scannez le QR code d’invitation que l’organisateur vous a envoyé pour
            rejoindre sa fête.
          </p>
        </div>
      )}
    </AppShell>
  );
}
