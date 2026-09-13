import Link from "next/link";
import { CalendarDays, ImageIcon, Lock, Users } from "lucide-react";
import type { EventRecord } from "@/types/database";
import { formatDate } from "@/lib/utils";

export function EventCard({ event, memberCount, photoCount }: {
  event: EventRecord;
  memberCount: number;
  photoCount: number;
}) {
  return (
    <Link
      href={`/events/${event.slug}`}
      className="overflow-hidden rounded-3xl border border-[#f0d9bf] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative h-36 bg-gradient-to-br from-[#f7d5a7] via-[#f7f0e8] to-[#f1cdb4] p-4">
        <div className="absolute right-4 top-4 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5d473d]">
          {event.status}
        </div>
        <div className="absolute bottom-4 left-4 rounded-2xl bg-[#1f1b18]/65 px-3 py-2 text-white shadow-sm">
          <div className="text-lg font-bold">{event.name}</div>
          <div className="mt-1 flex items-center gap-2 text-[11px] opacity-90">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(event.event_date)}
          </div>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.16em] text-[#836d62]">
          <span>{event.event_type}</span>
          {event.registration_enabled ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#edf9ee] px-2 py-1 text-[10px] text-[#2c6c3f]">
              <Lock className="h-3 w-3" />
              ouvert
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#fff1de] px-2 py-1 text-[10px] text-[#a2662d]">
              <Lock className="h-3 w-3" />
              fermé
            </span>
          )}
        </div>

        <p className="text-sm text-[#5f534d]">{event.description}</p>

        <div className="grid grid-cols-2 gap-2 pt-2 text-sm text-[#4a3d36]">
          <div className="rounded-2xl bg-[#fff4e9] p-3">
            <div className="flex items-center gap-2 text-[#8d5e3d]">
              <Users className="h-4 w-4" />
              Membres
            </div>
            <div className="mt-2 text-lg font-semibold">{memberCount}</div>
          </div>
          <div className="rounded-2xl bg-[#fff4e9] p-3">
            <div className="flex items-center gap-2 text-[#8d5e3d]">
              <ImageIcon className="h-4 w-4" />
              Photos
            </div>
            <div className="mt-2 text-lg font-semibold">{photoCount}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
