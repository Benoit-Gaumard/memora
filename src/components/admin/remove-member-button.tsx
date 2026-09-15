"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function RemoveMemberButton({
  memberId,
  memberName,
}: {
  memberId: string;
  memberName?: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRemove() {
    setSubmitting(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from("event_members")
        .delete()
        .eq("id", memberId);

      if (deleteError) {
        setError("Retrait impossible. Réessayez.");
        return;
      }

      setOpen(false);
      router.refresh();
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
        Retirer
      </button>

      <ConfirmDialog
        open={open}
        title="Retirer cette personne de l’album ?"
        description={
          <>
            <p>
              {memberName ? (
                <>
                  <span className="font-semibold text-ink">{memberName}</span> perdra l’accès à
                  l’album et ne pourra plus y ajouter de photos.
                </>
              ) : (
                "Cette personne perdra l’accès à l’album et ne pourra plus y ajouter de photos."
              )}
            </p>
            <p>
              Les photos qu’elle a déjà partagées restent en place. Elle pourra revenir avec une
              nouvelle invitation.
            </p>
          </>
        }
        confirmLabel="Retirer de l’album"
        pendingLabel="Retrait…"
        error={error}
        submitting={submitting}
        onConfirm={handleRemove}
        onCancel={() => {
          if (submitting) return;
          setOpen(false);
          setError(null);
        }}
      />
    </>
  );
}
