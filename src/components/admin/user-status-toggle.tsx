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
      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${
        isBlocked
          ? "bg-[#edf9ee] text-[#2c6c3f] hover:bg-[#dff2e1]"
          : "bg-[#fff1de] text-[#a2662d] hover:bg-[#ffe6c6]"
      }`}
    >
      {submitting ? "…" : isBlocked ? "Réactiver" : "Bloquer"}
    </button>
  );
}
