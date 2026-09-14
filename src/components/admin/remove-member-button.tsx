"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function RemoveMemberButton({ memberId }: { memberId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleRemove() {
    if (!window.confirm("Retirer ce membre de l'événement ?")) return;

    setSubmitting(true);
    try {
      await supabase.from("event_members").delete().eq("id", memberId);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={submitting}
      className="rounded-full bg-[#fdeceb] px-3 py-1.5 text-xs font-semibold text-[#b3392f] transition hover:bg-[#fbdedb] disabled:opacity-60"
    >
      {submitting ? "…" : "Retirer"}
    </button>
  );
}
