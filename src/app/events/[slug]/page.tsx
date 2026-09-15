import Link from "next/link";
import { Camera, Download, ImageIcon, Lock, MessageCircle, Users } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PhotoGrid } from "@/components/gallery/photo-grid";
import { PhotoUploader } from "@/components/photos/photo-uploader";
import { LeaveEventButton } from "@/components/events/leave-event-button";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getPrivatePhotoUrl } from "@/lib/private-photo";
import { formatEventPeriod, isEventClosed } from "@/lib/events";
import { formatDate } from "@/lib/utils";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: event } = await supabase.from("events").select("*").eq("slug", slug).maybeSingle();

  if (!event) {
    notFound();
  }

  const { data: membership } = await supabase
    .from("event_members")
    .select("id, role")
    .eq("event_id", event.id)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!membership) {
    notFound();
  }

  const [{ count: memberCount }, { count: commentCount }, { count: myPhotoCount }] =
    await Promise.all([
      supabase
        .from("event_members")
        .select("id", { count: "exact", head: true })
        .eq("event_id", event.id)
        .eq("status", "active"),
      supabase
        .from("photo_comments")
        .select("id", { count: "exact", head: true })
        .eq("event_id", event.id),
      supabase
        .from("photos")
        .select("id", { count: "exact", head: true })
        .eq("event_id", event.id)
        .eq("user_id", user.id),
    ]);

  const { data: photos } = await supabase
    .from("photos")
    .select("*, profiles!user_id(display_name)")
    .eq("event_id", event.id)
    .order("uploaded_at", { ascending: false });

  const photosWithUrls = await Promise.all(
    (photos ?? []).map(async (photo) => {
      const authorName = Array.isArray(photo.profiles)
        ? photo.profiles[0]?.display_name
        : photo.profiles?.display_name;

      return {
        ...photo,
        url: getPrivatePhotoUrl(photo.storage_display_path),
        thumbnailUrl: getPrivatePhotoUrl(photo.storage_thumbnail_path),
        authorName: authorName ?? null,
      };
    }),
  );

  let coverImageUrl: string | null = null;
  if (event.cover_image_path) {
    coverImageUrl = getPrivatePhotoUrl(event.cover_image_path);
  }

  const isClosed = isEventClosed(event);
  const activeMemberCount = memberCount ?? 0;
  const totalCommentCount = commentCount ?? 0;
  // L'organisateur ne peut pas se désinscrire : l'album se retrouverait sans
  // personne pour le gérer. Le bouton lui est donc simplement masqué.
  const canLeave = membership.role !== "organizer" && event.created_by !== user.id;

  return (
    <AppShell>
      <section className="paper mb-8 overflow-hidden p-0">
        <div className="relative h-56 overflow-hidden border-b-2 border-ink bg-grape p-6 md:h-80">
          {coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="confetti absolute inset-0 opacity-70" />
          )}
          {coverImageUrl ? (
            <div className="absolute inset-0 bg-gradient-to-t from-[#1c0733]/85 via-[#1c0733]/20 to-transparent" />
          ) : null}
          <div className="relative flex h-full flex-col justify-end">
            <div className="max-w-2xl">
              <h1 className="font-display text-[clamp(2rem,4.5vw,3.2rem)] font-extrabold leading-[0.95] text-white drop-shadow-[0_3px_0_rgba(28,7,51,0.9)]">
                {event.name}
              </h1>
              <p className="mt-3 max-w-lg text-base leading-7 text-white/90 drop-shadow-[0_1px_2px_rgba(28,7,51,0.9)]">
                {event.description}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip">{event.event_type}</span>
            <span className="chip">
              <Camera className="h-3.5 w-3.5" />
              {formatEventPeriod(event.event_date, event.end_date)}
            </span>
            <span className="chip">
              <Users className="h-3.5 w-3.5" />
              {activeMemberCount} {activeMemberCount > 1 ? "invités" : "invité"}
            </span>
            <span className="chip">
              <ImageIcon className="h-3.5 w-3.5" />
              {photosWithUrls.length} {photosWithUrls.length > 1 ? "photos" : "photo"}
            </span>
            <span className="chip">
              <MessageCircle className="h-3.5 w-3.5" />
              {totalCommentCount} {totalCommentCount > 1 ? "commentaires" : "commentaire"}
            </span>
            {isClosed ? (
              <span className="chip bg-citron">
                <Lock className="h-3.5 w-3.5" />
                Album clôturé
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            {photosWithUrls.length > 0 && event.download_enabled ? (
              <a
                href={`/api/event-archive?slug=${encodeURIComponent(event.slug)}`}
                className="btn btn-sm btn-citron"
              >
                <Download className="h-4 w-4" />
                Télécharger le ZIP
              </a>
            ) : null}
            {isClosed ? (
              <p className="text-sm font-semibold text-ink-soft">
                Les photos sont figées, l’album reste consultable.
              </p>
            ) : (
              <div className="flex flex-col items-start gap-1 md:items-end">
                <PhotoUploader eventId={event.id} />
                {event.end_date ? (
                  <span className="text-xs text-ink-faint">
                    Ajout de photos possible jusqu’au {formatDate(`${event.end_date}T12:00:00`)}
                  </span>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <PhotoGrid eventSlug={event.slug} photos={photosWithUrls} />

        <div className="flex flex-wrap items-center justify-between gap-3 text-base text-ink-soft">
          <span>
            Retour à la liste de <Link href="/events" className="paper-link">mes albums</Link>.
          </span>
          {canLeave ? (
            <LeaveEventButton
              eventId={event.id}
              eventName={event.name}
              myPhotoCount={myPhotoCount ?? 0}
            />
          ) : null}
        </div>
      </section>
    </AppShell>
  );
}
