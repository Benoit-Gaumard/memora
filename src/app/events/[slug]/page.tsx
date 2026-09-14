import Link from "next/link";
import { Camera, ImageIcon } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PhotoGrid } from "@/components/gallery/photo-grid";
import { PhotoUploader } from "@/components/photos/photo-uploader";
import { getSupabaseServerClient } from "@/lib/supabase-server";
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
    .select("id")
    .eq("event_id", event.id)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!membership) {
    notFound();
  }

  const { data: photos } = await supabase
    .from("photos")
    .select("*, profiles(display_name)")
    .eq("event_id", event.id)
    .order("uploaded_at", { ascending: false });

  const photosWithUrls = await Promise.all(
    (photos ?? []).map(async (photo) => {
      const { data: signed } = await supabase.storage
        .from("event-photos")
        .createSignedUrl(photo.storage_display_path, 3600);

      const authorName = Array.isArray(photo.profiles)
        ? photo.profiles[0]?.display_name
        : photo.profiles?.display_name;

      return { ...photo, url: signed?.signedUrl ?? null, authorName: authorName ?? null };
    }),
  );

  let coverImageUrl: string | null = null;
  if (event.cover_image_path) {
    const { data: signed } = await supabase.storage
      .from("event-photos")
      .createSignedUrl(event.cover_image_path, 3600);
    coverImageUrl = signed?.signedUrl ?? null;
  }

  return (
    <AppShell>
      <section className="mb-6 overflow-hidden rounded-[32px] border border-[#f0d9bf] bg-white shadow-sm">
        <div className="relative h-52 overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(244,177,120,0.7),_rgba(255,250,243,0.9)_55%,_rgba(255,250,243,1))] p-6 md:h-72">
          {coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : null}
          {coverImageUrl ? (
            <div className="absolute inset-0 bg-gradient-to-t from-[#1d150f]/70 via-[#1d150f]/10 to-transparent" />
          ) : null}
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-center justify-between gap-3">
              <div className="rounded-full bg-[#fff9f2] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7d6052]">
                {event.event_type}
              </div>
              <div className="rounded-full bg-[#fff9f2] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7d6052]">
                {event.status}
              </div>
            </div>

            <div className="max-w-xl rounded-3xl bg-[#1f1b18]/65 p-4 text-white backdrop-blur-sm">
              <div className="text-xs uppercase tracking-[0.2em] text-[#f3d3b0]">Événement</div>
              <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">{event.name}</h1>
              <p className="mt-2 text-sm text-[#f4e9df]">{event.description}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-sm text-[#5f514b]">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#fff4e9] px-3 py-1.5">
              <Camera className="h-4 w-4 text-[#d57f45]" />
              {formatDate(event.event_date)}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#fff4e9] px-3 py-1.5">
              <ImageIcon className="h-4 w-4 text-[#d57f45]" />
              {photosWithUrls.length} photos
            </span>
          </div>

          <PhotoUploader eventId={event.id} />
        </div>
      </section>

      <section className="space-y-6">
        <div className="text-xs uppercase tracking-[0.2em] text-[#8d6c5d]">Galerie</div>

        <PhotoGrid eventSlug={event.slug} photos={photosWithUrls} />

        <div className="text-sm text-[#655a54]">
          Retour à la liste des <Link href="/events" className="font-semibold text-[#c47242]">événements</Link>.
        </div>
      </section>
    </AppShell>
  );
}
