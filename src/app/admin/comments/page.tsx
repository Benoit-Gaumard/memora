import { getSupabaseServerClient } from "@/lib/supabase-server";
import {
  CommentsManager,
  type AdminCommentItem,
  type AdminEventOption,
} from "@/components/admin/comments-manager";
import { getPrivatePhotoUrl } from "@/lib/private-photo";

interface CommentWithRelations {
  id: string;
  body: string;
  created_at: string;
  photo_id: string;
  events: { name: string; slug: string } | { name: string; slug: string }[] | null;
  profiles: { display_name: string } | { display_name: string }[] | null;
  photos:
    | { original_filename: string; storage_thumbnail_path: string }
    | { original_filename: string; storage_thumbnail_path: string }[]
    | null;
}

function firstOf<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

export default async function AdminCommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>;
}) {
  const { event: selectedEventId } = await searchParams;
  const supabase = await getSupabaseServerClient();

  const { data: eventsData } = await supabase
    .from("events")
    .select("id, name")
    .order("name", { ascending: true });

  const events: AdminEventOption[] = eventsData ?? [];

  let query = supabase
    .from("photo_comments")
    .select(
      "id, body, created_at, photo_id, events(name, slug), profiles!user_id(display_name), photos!photo_id(original_filename, storage_thumbnail_path)",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (selectedEventId) {
    query = query.eq("event_id", selectedEventId);
  }

  const { data } = await query;

  const rows = (data ?? []) as unknown as CommentWithRelations[];

  const comments: AdminCommentItem[] = rows.map((row) => {
    const event = firstOf(row.events);
    const author = firstOf(row.profiles);
    const photo = firstOf(row.photos);

    return {
      id: row.id,
      body: row.body,
      created_at: row.created_at,
      eventName: event?.name ?? "Événement",
      eventSlug: event?.slug ?? null,
      photoId: row.photo_id,
      photoFilename: photo?.original_filename ?? "Photo",
      authorName: author?.display_name ?? "Membre",
      thumbnailUrl: photo?.storage_thumbnail_path
        ? getPrivatePhotoUrl(photo.storage_thumbnail_path)
        : null,
    };
  });

  return (
    <CommentsManager
      comments={comments}
      events={events}
      selectedEventId={selectedEventId ?? null}
    />
  );
}
