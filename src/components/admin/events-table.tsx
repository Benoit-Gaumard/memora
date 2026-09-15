"use client";

import Link from "next/link";
import { isEventClosed } from "@/lib/events";
import { DeleteEventButton } from "@/components/admin/delete-event-button";
import {
  PlainHeader,
  SortableHeader,
  useSortedRows,
  type SortValue,
} from "@/components/admin/sortable-table";
import type { EventStatus } from "@/types/database";

export interface AdminEventRow {
  id: string;
  name: string;
  event_type: string;
  event_date: string;
  end_date: string | null;
  status: EventStatus;
  memberCount: number;
  photoCount: number;
  coverUrl: string | null;
}

function closedLabel(row: AdminEventRow) {
  return isEventClosed(row) ? "Clôturé" : "Actif";
}

const SORT_ACCESSORS = {
  name: (row: AdminEventRow) => row.name,
  type: (row: AdminEventRow) => row.event_type,
  date: (row: AdminEventRow) => row.event_date,
  status: (row: AdminEventRow) => closedLabel(row),
  members: (row: AdminEventRow) => row.memberCount,
  photos: (row: AdminEventRow) => row.photoCount,
} satisfies Record<string, (row: AdminEventRow) => SortValue>;

export function EventsTable({ rows }: { rows: AdminEventRow[] }) {
  const { sorted, sort, toggleSort } = useSortedRows({
    rows,
    accessors: SORT_ACCESSORS,
    initialKey: "date",
    initialDirection: "desc",
  });

  return (
    <div className="overflow-x-auto paper p-0">
      <table className="min-w-full text-left text-sm text-ink-soft">
        <thead className="bg-paper text-ink-soft">
          <tr>
            <PlainHeader srLabel="Photo de couverture" />
            <SortableHeader label="Nom" sortKey="name" sort={sort} onSort={toggleSort} />
            <SortableHeader label="Type" sortKey="type" sort={sort} onSort={toggleSort} />
            <SortableHeader label="Date" sortKey="date" sort={sort} onSort={toggleSort} />
            <SortableHeader label="Statut" sortKey="status" sort={sort} onSort={toggleSort} />
            <SortableHeader label="Membres" sortKey="members" sort={sort} onSort={toggleSort} />
            <SortableHeader label="Photos" sortKey="photos" sort={sort} onSort={toggleSort} />
            <PlainHeader srLabel="Actions" />
          </tr>
        </thead>
        <tbody>
          {sorted.length ? (
            sorted.map((event) => (
              <tr key={event.id} className="border-t border-ink/15">
                <td className="px-4 py-4">
                  <div className="h-12 w-16 overflow-hidden rounded-xl border border-ink/15 bg-paper">
                    {event.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={event.coverUrl} alt="" className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-4 font-semibold text-ink">
                  <Link href={`/admin/events/${event.id}`} className="hover:underline">
                    {event.name}
                  </Link>
                </td>
                <td className="px-4 py-4">{event.event_type}</td>
                <td className="px-4 py-4">
                  {new Date(event.event_date).toLocaleDateString("fr-FR")}
                  {event.end_date ? (
                    <span className="block text-xs text-ink-faint">
                      fin le {new Date(`${event.end_date}T12:00:00`).toLocaleDateString("fr-FR")}
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-4">
                  {event.status === "CLOSED" ? (
                    "Clôturé"
                  ) : isEventClosed(event) ? (
                    <span>
                      Clôturé
                      <span className="block text-xs text-ink-faint">date de fin atteinte</span>
                    </span>
                  ) : (
                    "Actif"
                  )}
                </td>
                <td className="px-4 py-4">{event.memberCount}</td>
                <td className="px-4 py-4">{event.photoCount}</td>
                <td className="px-4 py-4">
                  <DeleteEventButton eventId={event.id} eventName={event.name} />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="px-4 py-6 text-center text-ink-faint">
                Aucun événement créé pour le moment.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
