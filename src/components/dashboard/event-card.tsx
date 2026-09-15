import Link from "next/link";
import Image from "next/image";
import { CalendarDays, ImageIcon, Lock, Users } from "lucide-react";
import type { EventRecord } from "@/types/database";
import { formatDate } from "@/lib/utils";

export function EventCard({
  event,
  memberCount,
  photoCount,
  coverImageUrl,
}: {
  event: EventRecord;
  memberCount: number;
  photoCount: number;
  coverImageUrl?: string | null;
}) {
  return (
    <Link
      href={`/events/${event.slug}`}
      className="paper group block overflow-hidden p-0 transition hover:-translate-y-1"
    >
      <div className="relative h-44 overflow-hidden border-b-2 border-ink bg-grape">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt=""
            fill
            unoptimized
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="absolute inset-0 object-cover"
          />
        ) : (
          <div className="confetti absolute inset-0 opacity-70" />
        )}
        {coverImageUrl ? (
          <div className="absolute inset-0 bg-gradient-to-t from-[#1c0733]/80 via-[#1c0733]/10 to-transparent" />
        ) : null}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="font-display text-2xl font-extrabold leading-tight text-white drop-shadow-[0_2px_0_rgba(28,7,51,0.85)]">
            {event.name}
          </div>
          <div className="mt-1 inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-citron px-2.5 py-1 text-xs font-bold text-ink">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(event.event_date)}
          </div>
        </div>
      </div>

      <div className="space-y-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip">{event.event_type}</span>
          <span className="chip">
            <Lock className="h-3.5 w-3.5" />
            {event.registration_enabled ? "inscriptions ouvertes" : "inscriptions fermées"}
          </span>
        </div>

        <p className="text-base leading-7 text-ink-soft">{event.description}</p>

        <div className="flex items-center gap-5 border-t-2 border-dashed border-ink/20 pt-3 font-display text-sm font-bold text-ink">
          <span className="inline-flex items-center gap-2">
            <Users className="h-4 w-4 text-fuchsia" />
            {memberCount} invités
          </span>
          <span className="inline-flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-turquoise" />
            {photoCount} photos
          </span>
        </div>
      </div>
    </Link>
  );
}
