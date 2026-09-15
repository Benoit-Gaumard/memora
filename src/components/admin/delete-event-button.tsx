"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { deleteEventStorageFolder } from "@/lib/storage";

export function DeleteEventButton({ eventId, eventName }: { eventId: string; eventName: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleDelete() {
    if (
      !window.confirm(
        `Supprimer définitivement l'événement "${eventName}" ? Toutes ses photos et membres seront aussi supprimés. Cette action est irréversible.`,
      )
    ) {
      return;
    }

    setSubmitting(true);
    try {
      await deleteEventStorageFolder(eventId);

      const { error } = await supabase.from("events").delete().eq("id", eventId);

      if (error) {
        window.alert(`Suppression impossible : ${error.message}`);
        return;
      }

      router.push("/admin/events");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={submitting}
      className="btn btn-sm btn-ghost disabled:opacity-60"
    >
      {submitting ? "Suppression…" : "Supprimer l'événement"}
    </button>
  );
}
