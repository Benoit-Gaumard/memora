"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function DeletePhotoButton({
  photoId,
  storagePath,
  eventSlug,
  isOwner,
}: {
  photoId: string;
  storagePath: string;
  eventSlug: string;
  isOwner: boolean;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOwner) {
    return null;
  }

  async function handleDelete() {
    if (!window.confirm("Supprimer cette photo ?")) return;

    setIsDeleting(true);

    await supabase.storage.from("event-photos").remove([storagePath]);
    await supabase.from("photos").delete().eq("id", photoId);

    router.push(`/events/${eventSlug}`);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="btn btn-sm btn-ghost disabled:opacity-60"
    >
      <Trash2 className="h-3.5 w-3.5" />
      {isDeleting ? "Suppression…" : "Supprimer"}
    </button>
  );
}
