"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { AccountStatus } from "@/types/database";

export function UserStatusToggle({ userId, status }: { userId: string; status: AccountStatus }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const isBlocked = status === "blocked";

  async function handleToggle() {
    setSubmitting(true);
    try {
      await supabase
        .from("profiles")
        .update({ account_status: isBlocked ? "active" : "blocked" })
        .eq("id", userId);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={submitting}
      className={`btn btn-sm ${isBlocked ? "btn-turquoise" : "btn-ghost"}`}
    >
      {submitting ? "…" : isBlocked ? "Réactiver" : "Bloquer"}
    </button>
  );
}
