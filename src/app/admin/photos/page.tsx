import { getSupabaseServerClient } from "@/lib/supabase-server";
import { PhotosManager, type AdminEventOption, type AdminPhotoItem } from "@/components/admin/photos-manager";

interface PhotoWithRelations {
  id: string;
  original_filename: string;
  uploaded_at: string | null;
  storage_original_path: string;
  storage_display_path: string;
  storage_thumbnail_path: string;
  events: { name: string } | { name: string }[] | null;
  profiles: { display_name: string } | { display_name: string }[] | null;
}

export default async function AdminPhotosPage({
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
    .from("photos")
    .select(
      "id, original_filename, uploaded_at, storage_original_path, storage_display_path, storage_thumbnail_path, events(name), profiles!user_id(display_name)",
    )
    .order("uploaded_at", { ascending: false })
    .limit(200);

  if (selectedEventId) {
    query = query.eq("event_id", selectedEventId);
  }

  const { data } = await query;

  const photos = (data ?? []) as unknown as PhotoWithRelations[];

  const photosWithUrls: AdminPhotoItem[] = await Promise.all(
    photos.map(async (photo) => {
      const { data: signed } = await supabase.storage
        .from("event-photos")
        .createSignedUrl(photo.storage_display_path, 3600);

      const eventName = Array.isArray(photo.events) ? photo.events[0]?.name : photo.events?.name;
      const authorName = Array.isArray(photo.profiles)
        ? photo.profiles[0]?.display_name
        : photo.profiles?.display_name;

      return {
        id: photo.id,
        original_filename: photo.original_filename,
        uploaded_at: photo.uploaded_at,
        storage_original_path: photo.storage_original_path,
        storage_display_path: photo.storage_display_path,
        storage_thumbnail_path: photo.storage_thumbnail_path,
        eventName: eventName ?? "Événement",
        authorName: authorName ?? "Membre",
        url: signed?.signedUrl ?? null,
      };
    }),
  );

  return (
    <PhotosManager photos={photosWithUrls} events={events} selectedEventId={selectedEventId ?? null} />
  );
}
