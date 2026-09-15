"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { listUserPhotoPaths, removeStoragePaths } from "@/lib/storage";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

/** Traduit les exceptions de `admin_delete_user` en phrases actionnables. */
function readableError(message: string): string {
  if (message.includes("OWNS_EVENTS")) {
    const count = Number(message.split("OWNS_EVENTS:")[1]?.match(/\d+/)?.[0] ?? 0);
    return count > 1
      ? `Cette personne organise encore ${count} albums. Supprimez-les depuis Événements avant de supprimer son compte.`
      : "Cette personne organise encore un album. Supprimez-le depuis Événements avant de supprimer son compte.";
  }
  if (message.includes("SELF_DELETE")) {
    return "Vous ne pouvez pas supprimer votre propre compte ici : passez par votre profil.";
  }
  if (message.includes("SUPER_ADMIN_PROTECTED")) {
    return "Un compte administrateur ne peut pas être supprimé depuis cette liste.";
  }
  if (message.includes("USER_NOT_FOUND")) {
    return "Ce compte n’existe plus.";
  }
  if (message.includes("FORBIDDEN")) {
    return "Action réservée aux administrateurs.";
  }
  return message;
}

export function DeleteUserButton({
  userId,
  displayName,
  username,
}: {
  userId: string;
  displayName: string;
  username: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setSubmitting(true);
    setError(null);

    try {
      // Les chemins ne vivent que sur les lignes `photos` : on les relève avant
      // la purge, mais on ne touche au stockage qu'une fois la suppression
      // acceptée. Sinon un refus du serveur laisserait des photos sans fichier.
      const paths = await listUserPhotoPaths(userId);

      const { error: rpcError } = await supabase.rpc("admin_delete_user", {
        p_user_id: userId,
      });

      if (rpcError) {
        setError(readableError(rpcError.message ?? "Suppression impossible."));
        return;
      }

      await removeStoragePaths(paths);

      setOpen(false);
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
        className="btn btn-sm btn-ghost btn-danger"
      >
        Supprimer
      </button>

      <ConfirmDialog
        open={open}
        title="Supprimer définitivement ce compte ?"
        description={
          <>
            <p>
              Le profil de <span className="font-semibold text-ink">{displayName}</span>, ses
              photos, ses commentaires et ses réactions seront effacés partout, y compris dans les
              albums des autres. Les fichiers quittent aussi le stockage.
            </p>
            <p>
              Pour une mesure réversible, préférez <span className="font-semibold">Bloquer</span> :
              le compte perd l’accès mais ses photos restent en place.
            </p>
            <p className="font-semibold text-rouge">Rien ne pourra être récupéré.</p>
          </>
        }
        confirmationText={username}
        confirmationHint={
          <>
            Tapez le nom d’utilisateur,{" "}
            <span className="font-display font-extrabold">{username}</span>, pour confirmer
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
