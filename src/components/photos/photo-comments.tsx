"use client";

import { useState } from "react";
import { MessageCircle, Send, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";

export type PhotoCommentItem = {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  authorName: string;
};

const MAX_LENGTH = 2000;

export function PhotoComments({
  photoId,
  eventId,
  currentUserId,
  currentUserName,
  canModerate,
  initialComments,
}: {
  photoId: string;
  eventId: string;
  currentUserId: string;
  currentUserName: string;
  canModerate: boolean;
  initialComments: PhotoCommentItem[];
}) {
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();

    const trimmed = body.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    setError(null);

    const { data, error: insertError } = await supabase
      .from("photo_comments")
      .insert({
        photo_id: photoId,
        event_id: eventId,
        user_id: currentUserId,
        body: trimmed,
      })
      .select("id, body, created_at, user_id")
      .single();

    setIsSending(false);

    if (insertError || !data) {
      setError("Impossible d’envoyer le commentaire. Réessayez.");
      return;
    }

    setComments((previous) => [
      ...previous,
      {
        id: data.id,
        body: data.body,
        created_at: data.created_at,
        user_id: data.user_id,
        authorName: currentUserName,
      },
    ]);
    setBody("");
  }

  async function handleDelete(commentId: string) {
    if (!window.confirm("Supprimer ce commentaire ?")) return;

    const previous = comments;
    setComments((current) => current.filter((comment) => comment.id !== commentId));

    const { error: deleteError } = await supabase
      .from("photo_comments")
      .delete()
      .eq("id", commentId);

    if (deleteError) {
      setComments(previous);
      setError("Impossible de supprimer le commentaire.");
    }
  }

  return (
    <section className="border-t-2 border-dashed border-ink/20 pt-5">
      <div className="flex items-center gap-2 font-display text-lg font-extrabold text-ink">
        <MessageCircle className="h-5 w-5 text-fuchsia" />
        Commentaires ({comments.length})
      </div>

      <ul className="mt-4 divide-y-2 divide-dashed divide-ink/15">
        {comments.length === 0 ? (
          <li className="pt-4 text-base leading-7 text-ink-soft">
            Personne n’a encore réagi. Lancez la discussion !
          </li>
        ) : (
          comments.map((comment) => (
            <li key={comment.id} className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-display text-base font-bold text-ink">{comment.authorName}</div>
                  <div className="text-sm text-ink-faint">
                    {formatDate(comment.created_at, {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                {comment.user_id === currentUserId || canModerate ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(comment.id)}
                    aria-label="Supprimer ce commentaire"
                    className="rounded-full border-2 border-ink bg-white p-1.5 text-ink transition hover:bg-citron"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
              <p className="mt-1.5 whitespace-pre-wrap text-base leading-7 text-ink-soft">
                {comment.body}
              </p>
            </li>
          ))
        )}
      </ul>

      <form onSubmit={handleSubmit} className="mt-5">
        <label htmlFor="photo-comment" className="sr-only">
          Ajouter un commentaire
        </label>
        <textarea
          id="photo-comment"
          value={body}
          onChange={(inputEvent) => setBody(inputEvent.target.value)}
          maxLength={MAX_LENGTH}
          rows={3}
          placeholder="Écrivez un commentaire…"
          className="field resize-none leading-7"
        />

        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-ink-faint">
            {body.length}/{MAX_LENGTH}
          </span>
          <button
            type="submit"
            disabled={isSending || body.trim().length === 0}
            className="btn btn-sm btn-fuchsia"
          >
            <Send className="h-3.5 w-3.5" />
            {isSending ? "Envoi…" : "Commenter"}
          </button>
        </div>
      </form>

      {error ? <p className="mt-2 text-base font-semibold text-fuchsia">{error}</p> : null}
    </section>
  );
}
