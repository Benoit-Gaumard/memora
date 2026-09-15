"use client";

import { useState } from "react";
import { Heart, ThumbsUp } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { PhotoReactionKind } from "@/types/database";

const REACTIONS: { kind: PhotoReactionKind; label: string; icon: typeof Heart; activeClass: string }[] = [
  { kind: "heart", label: "J’adore", icon: Heart, activeClass: "bg-fuchsia" },
  { kind: "thumb", label: "J’aime", icon: ThumbsUp, activeClass: "bg-turquoise" },
];

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
      <div className="flex flex-wrap gap-2">
        {REACTIONS.map(({ kind, label, icon: Icon, activeClass }) => {
          const isActive = mine === kind;

          return (
            <button
              key={kind}
              type="button"
              onClick={() => toggle(kind)}
              aria-pressed={isActive}
              className={`btn btn-sm ${isActive ? activeClass : ""}`}
            >
              <Icon className="h-4 w-4" fill={isActive ? "currentColor" : "none"} />
              {label}
              <span className="tabular-nums">{counts[kind]}</span>
            </button>
          );
        })}
      </div>

      {error ? <p className="mt-2 text-sm font-semibold text-fuchsia">{error}</p> : null}
    </section>
  );
}
