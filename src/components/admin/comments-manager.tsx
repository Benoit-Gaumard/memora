"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatShortDate } from "@/lib/utils";

export interface AdminCommentItem {
  id: string;
  body: string;
  created_at: string;
  eventName: string;
  eventSlug: string | null;
  photoId: string;
  photoFilename: string;
  authorName: string;
  thumbnailUrl: string | null;
}

export interface AdminEventOption {
  id: string;
  name: string;
}

export function CommentsManager({
  comments,
  events,
  selectedEventId,
}: {
  comments: AdminCommentItem[];
  events: AdminEventOption[];
  selectedEventId: string | null;
}) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFilterChange(eventId: string) {
    const params = new URLSearchParams();
    if (eventId) params.set("event", eventId);
    router.push(`/admin/comments${params.toString() ? `?${params.toString()}` : ""}`);
  }

  async function handleDelete(comment: AdminCommentItem) {
    if (
      !window.confirm(
        `Supprimer ce commentaire de ${comment.authorName} ? Cette action est irréversible.`,
      )
    ) {
      return;
    }

    setDeletingId(comment.id);
    setError(null);

    const { error: deleteError } = await supabase
      .from("photo_comments")
      .delete()
      .eq("id", comment.id);

    setDeletingId(null);

    if (deleteError) {
      setError("Suppression impossible.");
      return;
    }

    router.refresh();
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label htmlFor="event-filter" className="text-sm font-medium text-ink-soft">
          Filtrer par événement
        </label>
        <select
          id="event-filter"
          value={selectedEventId ?? ""}
          onChange={(event) => handleFilterChange(event.target.value)}
          className="field w-auto"
        >
          <option value="">Tous les événements</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <div
          role="alert"
          className="mb-4 rounded-2xl border-2 border-ink bg-citron px-3 py-2 text-sm font-semibold text-ink"
        >
          {error}
        </div>
      ) : null}

      {comments.length ? (
        <div className="overflow-hidden paper p-0">
          <table className="min-w-full text-left text-sm text-ink-soft">
            <thead className="bg-paper text-ink-soft">
              <tr>
                {["", "Commentaire", "Auteur", "Événement", "Date", ""].map((header, index) => (
                  <th key={`${header}-${index}`} className="px-4 py-3 font-semibold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comments.map((comment) => (
                <tr key={comment.id} className="border-t border-ink/15 align-top">
                  <td className="px-4 py-4">
                    <div className="h-12 w-12 overflow-hidden rounded-xl border border-ink/15 bg-paper">
                      {comment.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={comment.thumbnailUrl}
                          alt={comment.photoFilename}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                  </td>
                  <td className="max-w-md px-4 py-4 text-ink">{comment.body}</td>
                  <td className="px-4 py-4">{comment.authorName}</td>
                  <td className="px-4 py-4">
                    {comment.eventSlug ? (
                      <Link
                        href={`/events/${comment.eventSlug}/photos/${comment.photoId}`}
                        className="font-semibold text-ink hover:underline"
                      >
                        {comment.eventName}
                      </Link>
                    ) : (
                      comment.eventName
                    )}
                  </td>
                  <td className="px-4 py-4">{formatShortDate(comment.created_at)}</td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => handleDelete(comment)}
                      disabled={deletingId === comment.id}
                      className="btn btn-sm btn-mandarine disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {deletingId === comment.id ? "Suppression…" : "Supprimer"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="paper p-8 text-center text-ink-soft">
          Aucun commentaire ne correspond à ce filtre.
        </div>
      )}
    </div>
  );
}
