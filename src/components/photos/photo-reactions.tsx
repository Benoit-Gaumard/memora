"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { PhotoReactionKind } from "@/types/database";

// Le schéma garde plusieurs types de réaction, mais l'interface n'en propose
// qu'un seul : un coup de cœur, ou rien.
const KIND: PhotoReactionKind = "heart";

export function PhotoReactions({
  photoId,
  eventId,
  currentUserId,
  initialCounts,
  initialReaction,
}: {
  photoId: string;
  eventId: string;
  currentUserId: string;
  initialCounts: Record<PhotoReactionKind, number>;
  initialReaction: PhotoReactionKind | null;
}) {
  const [counts, setCounts] = useState(initialCounts);
  const [mine, setMine] = useState(initialReaction);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle(kind: PhotoReactionKind) {
    if (isSaving) return;

    const previousCounts = counts;
    const previousMine = mine;
    const nextMine = mine === kind ? null : kind;

    const nextCounts = { ...counts };
    if (previousMine) nextCounts[previousMine] = Math.max(0, nextCounts[previousMine] - 1);
    if (nextMine) nextCounts[nextMine] += 1;

    setCounts(nextCounts);
    setMine(nextMine);
    setIsSaving(true);
    setError(null);

    const { error: writeError } = nextMine
      ? await supabase.from("photo_reactions").upsert(
          {
            photo_id: photoId,
            event_id: eventId,
            user_id: currentUserId,
            kind: nextMine,
          },
          { onConflict: "photo_id,user_id" },
        )
      : await supabase
          .from("photo_reactions")
          .delete()
          .eq("photo_id", photoId)
          .eq("user_id", currentUserId);

    setIsSaving(false);

    if (writeError) {
      setCounts(previousCounts);
      setMine(previousMine);
      setError("Impossible d’enregistrer votre réaction.");
    }
  }

  return (
    <section>
      <button
        type="button"
        onClick={() => toggle(KIND)}
        aria-pressed={mine === KIND}
        className={`btn btn-sm ${mine === KIND ? "bg-fuchsia" : ""}`}
      >
        <Heart className="h-4 w-4" fill={mine === KIND ? "currentColor" : "none"} />
        J’adore
        <span className="tabular-nums">{counts[KIND]}</span>
      </button>

      {error ? <p className="mt-2 text-sm font-semibold text-fuchsia">{error}</p> : null}
    </section>
  );
}
