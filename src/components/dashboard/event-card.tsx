import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays, ImageIcon, Lock, MessageCircle, Users } from "lucide-react";
import type { EventRecord } from "@/types/database";
import { formatEventPeriod, isEventClosed } from "@/lib/events";

export function EventCard({
  event,
  memberCount,
  photoCount,
  commentCount,
  coverImageUrl,
}: {
  event: EventRecord;
  memberCount: number;
  photoCount: number;
  commentCount: number;
  coverImageUrl?: string | null;
}) {
  const isClosed = isEventClosed(event);
  const actionLabel =
    photoCount > 0
      ? "Voir les photos"
      : isClosed
        ? "Ouvrir l’album"
        : "Ajouter les premières photos";

  return (
    <Link
      href={`/events/${event.slug}`}
      aria-label={`${actionLabel} de ${event.name}`}
      className="paper paper-link group block overflow-hidden p-0"
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
            {formatEventPeriod(event.event_date, event.end_date)}
          </div>
        </div>
      </div>

      <div className="space-y-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip">{event.event_type}</span>
          {isClosed ? (
            <span className="chip bg-citron">
              <Lock className="h-3.5 w-3.5" />
              album clôturé
            </span>
          ) : (
            <span className="chip">
              <Lock className="h-3.5 w-3.5" />
              {event.registration_enabled ? "inscriptions ouvertes" : "inscriptions fermées"}
            </span>
          )}
        </div>

        <p className="text-base leading-7 text-ink-soft">{event.description}</p>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t-2 border-dashed border-ink/20 pt-3 font-display text-sm font-bold text-ink">
          <span className="inline-flex items-center gap-2">
            <Users className="h-4 w-4 text-fuchsia" />
            {memberCount} {memberCount > 1 ? "invités" : "invité"}
          </span>
          <span className="inline-flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-turquoise" />
            {photoCount} {photoCount > 1 ? "photos" : "photo"}
          </span>
          <span className="inline-flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-grape" />
            {commentCount} {commentCount > 1 ? "commentaires" : "commentaire"}
          </span>
        </div>

        <span className="btn btn-sm btn-fuchsia w-full">
          {actionLabel}
          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
