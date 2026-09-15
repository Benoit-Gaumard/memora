"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { deleteEventStorageFolder } from "@/lib/storage";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function DeleteEventButton({ eventId, eventName }: { eventId: string; eventName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setSubmitting(true);
    setError(null);

    try {
      await deleteEventStorageFolder(eventId);

      const { error: deleteError } = await supabase.from("events").delete().eq("id", eventId);

      if (deleteError) {
        setError(`Suppression impossible : ${deleteError.message}`);
        return;
      }

      setOpen(false);
      router.push("/admin/events");
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Suppression impossible pour l’instant. Réessayez.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className="btn btn-sm btn-ghost"
      >
        Supprimer l’événement
      </button>

      <ConfirmDialog
        open={open}
        title="Supprimer définitivement cet album ?"
        description={
          <>
            <p>
              Toutes les photos de <span className="font-semibold text-ink">{eventName}</span>, ses
              commentaires, ses réactions et la liste de ses invités seront effacés. Les fichiers
              quittent aussi le stockage.
            </p>
            <p className="font-semibold text-rouge">Rien ne pourra être récupéré.</p>
          </>
        }
        confirmationText={eventName}
        confirmationHint={
          <>
            Tapez le nom de l’album,{" "}
            <span className="font-display font-extrabold">{eventName}</span>, pour confirmer
          </>
        }
        confirmLabel="Supprimer définitivement"
        pendingLabel="Suppression…"
        error={error}
        submitting={submitting}
        onConfirm={handleDelete}
        onCancel={() => {
          if (submitting) return;
          setOpen(false);
          setError(null);
        }}
      />
    </>
  );
}
