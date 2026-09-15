"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function JoinActionButton({
  code,
  isLoggedIn,
  eventSlug,
}: {
  code: string;
  isLoggedIn: boolean;
  eventSlug: string;
}) {
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isLoggedIn) {
    return (
      <a
        href={`/login?redirect=${encodeURIComponent(`/join/${code}`)}`}
        className="btn btn-fuchsia"
      >
        Connexion / création de compte
        <ArrowRight className="h-4 w-4" />
      </a>
    );
  }

  async function handleJoin() {
    setIsJoining(true);
    setError(null);

    const { error: rpcError } = await supabase.rpc("redeem_event_invite", { p_code: code });

    if (rpcError) {
      setError(rpcError.message ?? "Impossible de rejoindre cet événement.");
      setIsJoining(false);
      return;
    }

    router.push(`/events/${eventSlug}`);
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleJoin}
        disabled={isJoining}
        className="btn btn-fuchsia disabled:opacity-60"
      >
        {isJoining ? "Inscription…" : "Rejoindre cet événement"}
        <ArrowRight className="h-4 w-4" />
      </button>
      {error ? <div className="mt-2 text-xs text-fuchsia">{error}</div> : null}
    </div>
  );
}
