"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

/** Traduit les exceptions de `leave_event` en phrases actionnables. */
function readableError(message: string): string {
  if (message.includes("ORGANIZER_CANNOT_LEAVE")) {
    return "Vous organisez cet album : le quitter le laisserait sans personne pour le gérer. Confiez l’organisation à quelqu’un d’autre, ou supprimez l’événement.";
  }
  if (message.includes("NOT_A_MEMBER")) {
    return "Vous ne faites déjà plus partie de cet album.";
  }
  return message;
}

export function LeaveEventButton({
  eventId,
  eventName,
  myPhotoCount,
}: {
  eventId: string;
  eventName: string;
  myPhotoCount: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLeave() {
    setSubmitting(true);
    setError(null);

    const { error: rpcError } = await supabase.rpc("leave_event", { p_event_id: eventId });

    if (rpcError) {
      setError(readableError(rpcError.message ?? "Impossible de quitter cet album."));
      setSubmitting(false);
      return;
    }

    setOpen(false);
    router.push("/events");
    router.refresh();
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
        <LogOut className="h-3.5 w-3.5" />
        Quitter cet album
      </button>

      <ConfirmDialog
        open={open}
        title={`Quitter « ${eventName} » ?`}
        description={
          <>
            <p>L’album quitte votre liste et vous n’aurez plus accès à ses photos.</p>
            {myPhotoCount > 0 ? (
              <p>
                {myPhotoCount > 1
                  ? `Les ${myPhotoCount} photos que vous avez partagées restent dans l’album : elles appartiennent aussi aux autres invités.`
                  : "La photo que vous avez partagée reste dans l’album : elle appartient aussi aux autres invités."}
              </p>
            ) : null}
            <p>
              Vous pourrez revenir plus tard avec le lien ou le QR code d’invitation, s’il est
              toujours valide.
            </p>
          </>
        }
        confirmLabel="Quitter l’album"
        pendingLabel="En cours…"
        error={error}
        submitting={submitting}
        onConfirm={handleLeave}
        onCancel={() => {
          if (submitting) return;
          setOpen(false);
          setError(null);
        }}
      />
    </>
  );
}
