"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function DeletePhotoButton({
  photoId,
  storagePaths,
  eventSlug,
  isOwner,
}: {
  photoId: string;
  storagePaths: string[];
  eventSlug: string;
  isOwner: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOwner) {
    return null;
  }

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);

    try {
      // Original, version d'affichage et vignette partagent la même ligne :
      // les trois objets doivent partir ensemble, sinon le bucket se remplit
      // de fichiers que plus personne ne référence.
      await supabase.storage
        .from("event-photos")
        .remove(Array.from(new Set(storagePaths)));
      const { error: deleteError } = await supabase.from("photos").delete().eq("id", photoId);

      if (deleteError) {
        setError("Suppression impossible. Réessayez.");
        return;
      }

      setOpen(false);
      router.push(`/events/${eventSlug}`);
      router.refresh();
    } finally {
      setIsDeleting(false);
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
        <Trash2 className="h-3.5 w-3.5" />
        Supprimer
      </button>

      <ConfirmDialog
        open={open}
        title="Supprimer cette photo ?"
        description={
          <p>
            Elle disparaîtra de l’album pour tout le monde, avec ses commentaires et ses réactions.
            Cette action est définitive.
          </p>
        }
        confirmLabel="Supprimer la photo"
        pendingLabel="Suppression…"
        error={error}
        submitting={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => {
          if (isDeleting) return;
          setOpen(false);
          setError(null);
        }}
      />
    </>
  );
}
