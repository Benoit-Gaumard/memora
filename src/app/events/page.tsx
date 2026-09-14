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
    .select("events(*, event_members(count), photos(count))")
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
      <div className="mb-6">
        <div className="text-xs uppercase tracking-[0.2em] text-[#8d6c5d]">Mes événements</div>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-[#201c1a]">Toutes mes galeries</h1>
      </div>

      {events.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => {
            const memberCount = Array.isArray(event.event_members)
              ? (event.event_members[0]?.count ?? 0)
              : 0;
            const photoCount = Array.isArray(event.photos) ? (event.photos[0]?.count ?? 0) : 0;

            return (
              <EventCard
                key={event.id}
                event={event}
                memberCount={memberCount}
                photoCount={photoCount}
                coverImageUrl={coverUrls.get(event.id)}
              />
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-[#f0d9bf] bg-[#fffaf3] p-8 text-center text-[#544a44]">
          Vous ne faites encore partie d’aucun événement. Utilisez un lien d’invitation pour en rejoindre un.
        </div>
      )}
    </AppShell>
  );
}
