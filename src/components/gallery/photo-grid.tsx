import Image from "next/image";
import Link from "next/link";
import type { PhotoRecord } from "@/types/database";
import { formatShortDate } from "@/lib/utils";

export function PhotoGrid({
  eventSlug,
  photos,
}: {
  eventSlug: string;
  photos: (PhotoRecord & {
    url?: string | null;
    thumbnailUrl?: string | null;
    authorName?: string | null;
  })[];
}) {
  if (!photos.length) {
    return (
      <div className="paper p-8 text-center">
        <div className="display-sm text-2xl">L’album est encore vide.</div>
        <p className="mt-3 text-base leading-7 text-ink-soft">
          Les photos déposées par les invités apparaîtront ici, de la plus récente à la plus ancienne.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {photos.map((photo, index) => {
        const thumbnailUrl = photo.thumbnailUrl ?? photo.url;

        return (
          <Link
            key={photo.id}
            href={`/events/${eventSlug}/photos/${photo.id}`}
            className="paper group block p-2 transition hover:-translate-y-1"
            style={{ rotate: `${(index % 4) - 1.5}deg` }}
          >
            <div className="skeleton relative aspect-square overflow-hidden rounded-xl border-2 border-ink bg-grape">
              {thumbnailUrl ? (
                <Image
                  src={thumbnailUrl}
                  alt={photo.original_filename}
                  width={640}
                  height={640}
                  unoptimized
                  loading={index < 8 ? "eager" : "lazy"}
                  decoding="async"
                  className="relative h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              ) : null}
            </div>
            <div className="space-y-0.5 px-1 pb-1 pt-3">
              <div className="font-display text-sm font-bold text-ink">
                Ajoutée par {photo.authorName ?? "un invité"}
              </div>
              <div className="text-sm text-ink-soft">
                {formatShortDate(photo.captured_at ?? photo.uploaded_at ?? photo.created_at)}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
