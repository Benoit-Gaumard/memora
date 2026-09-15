import Image from "next/image";
import Link from "next/link";
import { Download, ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { DeletePhotoButton } from "@/components/photos/delete-photo-button";
import { PhotoComments, type PhotoCommentItem } from "@/components/photos/photo-comments";
import { PhotoReactions } from "@/components/photos/photo-reactions";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getPrivatePhotoUrl } from "@/lib/private-photo";
import { formatDate } from "@/lib/utils";
import type { PhotoReactionKind } from "@/types/database";

export default async function PhotoFullScreenPage({
  params,
}: {
  params: Promise<{ slug: string; photoId: string }>;
}) {
  const { slug, photoId } = await params;
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: event } = await supabase.from("events").select("id, slug").eq("slug", slug).maybeSingle();

  if (!event) {
    notFound();
  }

  const { data: photo } = await supabase
    .from("photos")
    .select("*, profiles!user_id(display_name)")
    .eq("id", photoId)
    .eq("event_id", event.id)
    .maybeSingle();

  if (!photo) {
    notFound();
  }

  const photoUrl = getPrivatePhotoUrl(photo.storage_display_path);

  const [{ data: commentRows }, { data: viewerProfile }, { data: viewerMembership }, { data: reactionRows }] =
    await Promise.all([
      supabase
        .from("photo_comments")
        .select("id, body, created_at, user_id, profiles!user_id(display_name)")
        .eq("photo_id", photo.id)
        .order("created_at", { ascending: true }),
      supabase.from("profiles").select("display_name, global_role").eq("id", user.id).maybeSingle(),
      supabase
        .from("event_members")
        .select("role")
        .eq("event_id", event.id)
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase.from("photo_reactions").select("kind, user_id").eq("photo_id", photo.id),
    ]);

  const reactionCounts: Record<PhotoReactionKind, number> = { heart: 0, thumb: 0 };
  let viewerReaction: PhotoReactionKind | null = null;

  const reactions = (reactionRows ?? []) as { kind: PhotoReactionKind; user_id: string }[];

  for (const reaction of reactions) {
    reactionCounts[reaction.kind] += 1;
    if (reaction.user_id === user.id) {
      viewerReaction = reaction.kind;
    }
  }

  const comments: PhotoCommentItem[] = (commentRows ?? []).map((comment) => {
    const profile = Array.isArray(comment.profiles) ? comment.profiles[0] : comment.profiles;

    return {
      id: comment.id,
      body: comment.body,
      created_at: comment.created_at,
      user_id: comment.user_id,
      authorName: profile?.display_name ?? "Membre",
    };
  });

  const canModerate =
    viewerProfile?.global_role === "super_admin" || viewerMembership?.role === "organizer";

  const author = Array.isArray(photo.profiles) ? photo.profiles[0]?.display_name : photo.profiles?.display_name;
  const isOwner = photo.user_id === user.id;

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[1.5fr_0.7fr]">
        <div className="paper overflow-hidden p-0">
          <div className="flex items-center justify-between gap-3 border-b-2 border-ink px-4 py-3">
            <Link href={`/events/${slug}`} className="paper-link inline-flex items-center gap-2 text-sm">
              <ArrowLeft className="h-4 w-4" />
              Retour à la galerie
            </Link>
            <div className="flex gap-2">
              <a
                href={photoUrl}
                download={photo.original_filename}
                className="btn btn-sm btn-turquoise"
              >
                <Download className="h-3.5 w-3.5" />
                Télécharger
              </a>
              <DeletePhotoButton
                photoId={photo.id}
                storagePath={photo.storage_original_path}
                eventSlug={slug}
                isOwner={isOwner}
              />
            </div>
          </div>

          <Image
            src={photoUrl}
            alt={photo.original_filename}
            width={1200}
            height={1200}
            unoptimized
            className="w-full object-cover"
          />
        </div>

        <aside className="paper p-5">
          <h1 className="display-sm text-2xl">Photo de {author ?? "un invité"}</h1>

          <dl className="mt-5 divide-y-2 divide-dashed divide-ink/15 text-base">
            <div className="flex justify-between gap-3 py-2">
              <dt className="font-semibold text-ink-soft">Prise le</dt>
              <dd className="text-right font-display font-bold text-ink">
                {formatDate(photo.captured_at ?? photo.uploaded_at ?? photo.created_at)}
              </dd>
            </div>
            <div className="flex justify-between gap-3 py-2">
              <dt className="font-semibold text-ink-soft">Format</dt>
              <dd className="text-right font-display font-bold text-ink">{photo.mime_type}</dd>
            </div>
            <div className="flex justify-between gap-3 py-2">
              <dt className="font-semibold text-ink-soft">Taille</dt>
              <dd className="text-right font-display font-bold text-ink">
                {(photo.file_size / 1000000).toFixed(1)} Mo
              </dd>
            </div>
          </dl>

          <div className="mt-5 border-t-2 border-dashed border-ink/20 pt-5">
            <PhotoReactions
              photoId={photo.id}
              eventId={event.id}
              currentUserId={user.id}
              initialCounts={reactionCounts}
              initialReaction={viewerReaction}
            />
          </div>

          <div className="mt-5">
            <PhotoComments
              photoId={photo.id}
              eventId={event.id}
              currentUserId={user.id}
              currentUserName={viewerProfile?.display_name ?? "Membre"}
              canModerate={canModerate}
              initialComments={comments}
            />
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
