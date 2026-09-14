import { getSupabaseServerClient } from "@/lib/supabase-server";
import { formatShortDate } from "@/lib/utils";

interface PhotoWithRelations {
  id: string;
  original_filename: string;
  uploaded_at: string | null;
  storage_display_path: string;
  events: { name: string } | { name: string }[] | null;
  profiles: { display_name: string } | { display_name: string }[] | null;
}

export default async function AdminPhotosPage() {
  const supabase = await getSupabaseServerClient();

  const { data } = await supabase
    .from("photos")
    .select("id, original_filename, uploaded_at, storage_display_path, events(name), profiles(display_name)")
    .order("uploaded_at", { ascending: false })
    .limit(60);

  const photos = (data ?? []) as unknown as PhotoWithRelations[];

  const photosWithUrls = await Promise.all(
    (photos ?? []).map(async (photo) => {
      const { data: signed } = await supabase.storage
        .from("event-photos")
        .createSignedUrl(photo.storage_display_path, 3600);

      return { ...photo, url: signed?.signedUrl ?? null };
    }),
  );

  if (!photosWithUrls.length) {
    return (
      <div className="rounded-3xl border border-dashed border-[#f0d9bf] bg-[#fffaf3] p-8 text-center text-[#544a44]">
        Aucune photo n’a encore été partagée.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {photosWithUrls.map((photo) => {
        const eventName = Array.isArray(photo.events) ? photo.events[0]?.name : photo.events?.name;
        const authorName = Array.isArray(photo.profiles)
          ? photo.profiles[0]?.display_name
          : photo.profiles?.display_name;

        return (
          <div key={photo.id} className="overflow-hidden rounded-3xl border border-[#f0d9bf] bg-white shadow-sm">
            <div className="aspect-square overflow-hidden bg-[#f2ebdf]">
              {photo.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo.url} alt={photo.original_filename} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="space-y-1 p-3">
              <div className="truncate text-sm font-medium text-[#2f2825]">{photo.original_filename}</div>
              <div className="truncate text-xs text-[#7c675d]">
                {eventName ?? "Événement"} · {authorName ?? "Membre"}
              </div>
              <div className="text-xs text-[#8a7268]">
                {photo.uploaded_at ? formatShortDate(photo.uploaded_at) : ""}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
