"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { deleteUserPhotoFiles } from "@/lib/storage";

const CONFIRMATION_WORD = "SUPPRIMER";

export type OwnedEvent = { id: string; name: string; slug: string };

export function DeleteAccountForm({
  userId,
  ownedEvents,
}: {
  userId: string;
  ownedEvents: OwnedEvent[];
}) {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const blocked = ownedEvents.length > 0;
  const confirmed = confirmation.trim().toUpperCase() === CONFIRMATION_WORD;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (blocked || !confirmed) {
      return;
    }

    setSubmitting(true);

    try {
      // Les fichiers du stockage ne suivent pas la cascade SQL : on les retire
      // tant que les lignes `photos` existent encore.
      await deleteUserPhotoFiles(userId);

      const { error: rpcError } = await supabase.rpc("delete_own_account");

      if (rpcError) {
        setError(
          rpcError.message?.includes("OWNS_EVENTS")
            ? "Vous organisez encore des albums. Supprimez-les d’abord."
            : (rpcError.message ?? "Impossible de supprimer le compte."),
        );
        return;
      }

      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Impossible de supprimer le compte pour l’instant.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (blocked) {
    return (
      <div className="space-y-4">
        <p className="text-base text-ink-soft">
          Vous organisez encore {ownedEvents.length}{" "}
          {ownedEvents.length > 1 ? "albums" : "album"}. Supprimez ces albums ou
          confiez-en l’organisation à quelqu’un d’autre : sans cela, leurs invités
          perdraient l’accès aux photos du jour au lendemain.
        </p>

        <ul className="flex flex-wrap gap-2">
          {ownedEvents.map((event) => (
            <li key={event.id}>
              <Link href={`/events/${event.slug}`} className="chip hover:bg-citron">
                {event.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-base text-ink-soft">
        Votre profil, vos photos, vos commentaires et vos réactions seront effacés
        définitivement. Les albums auxquels vous avez participé restent en place.
      </p>

      <label className="block text-sm font-semibold text-ink">
        Tapez <span className="font-display font-extrabold">{CONFIRMATION_WORD}</span>{" "}
        pour confirmer
        <input
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          className="field mt-2 sm:max-w-xs"
          autoComplete="off"
          placeholder={CONFIRMATION_WORD}
        />
      </label>

      {error ? (
        <div
          role="alert"
          className="rounded-2xl border-2 border-ink bg-citron px-3 py-2 text-sm font-semibold text-ink"
        >
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={!confirmed || submitting}
        className="btn btn-ghost"
      >
        {submitting ? "Suppression…" : "Supprimer définitivement mon compte"}
      </button>
    </form>
  );
}
