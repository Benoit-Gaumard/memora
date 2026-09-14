import Image from "next/image";
import Link from "next/link";
import type { PhotoRecord } from "@/types/database";
import { formatShortDate } from "@/lib/utils";

export function PhotoGrid({
  eventSlug,
  photos,
}: {
  eventSlug: string;
  photos: (PhotoRecord & { url?: string | null })[];
}) {
  if (!photos.length) {
    return (
      <div className="rounded-3xl border border-dashed border-[#f0d9bf] bg-[#fffaf3] p-8 text-center text-[#544a44]">
        Aucune photo n’a encore été partagée dans cet événement.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {photos.map((photo) => (
        <Link
          key={photo.id}
          href={`/events/${eventSlug}/photos/${photo.id}`}
          className="group overflow-hidden rounded-3xl border border-[#f0d9bf] bg-white shadow-sm"
        >
          <div className="relative aspect-square overflow-hidden bg-[#f2ebdf]">
            {photo.url ? (
              <Image
                src={photo.url}
                alt={photo.original_filename}
                width={900}
                height={900}
                unoptimized
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
            ) : null}
          </div>
          <div className="space-y-1 p-3">
            <div className="text-sm font-medium text-[#2f2825]">{photo.original_filename}</div>
            <div className="text-xs text-[#7c675d]">
              {formatShortDate(photo.captured_at ?? photo.uploaded_at ?? photo.created_at)}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
