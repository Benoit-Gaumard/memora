"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function DeletePhotoButton({
  photoId,
  storagePath,
  eventSlug,
}: {
  photoId: string;
  storagePath: string;
  eventSlug: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

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
      className="inline-flex items-center gap-2 rounded-full border border-[#efceaa] bg-white px-3 py-2 text-xs font-semibold text-[#433a35] transition hover:bg-[#fff5ec] disabled:opacity-60"
    >
      <Trash2 className="h-3.5 w-3.5" />
      {isDeleting ? "Suppression…" : "Supprimer"}
    </button>
  );
}
