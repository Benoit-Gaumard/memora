"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Share2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { JoinInviteCard } from "@/components/qr/join-invite-card";

function generateCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars (0/O, 1/I)
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

export function EventInviteManager({
  eventId,
  existingCode,
  siteUrl,
}: {
  eventId: string;
  existingCode: string | null;
  siteUrl: string;
}) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setIsCreating(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Vous devez être connecté.");
      setIsCreating(false);
      return;
    }

    const { error: insertError } = await supabase.from("event_invites").insert({
      event_id: eventId,
      code: generateCode(),
      is_active: true,
      created_by: user.id,
    });

    setIsCreating(false);

    if (insertError) {
      setError("Impossible de générer le lien. Vérifiez que les migrations SQL sont bien à jour.");
      return;
    }

    router.refresh();
  }

  if (!existingCode) {
    return (
      <div className="rounded-[32px] border border-dashed border-[#f0d9bf] bg-[#fffaf3] p-6 text-center shadow-sm">
        <div className="text-sm text-[#5a4d47]">
          Aucun lien d’invitation n’a encore été créé pour cet événement.
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isCreating}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#f4b178] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#e6995b] disabled:opacity-60"
        >
          <Share2 className="h-4 w-4" />
          {isCreating ? "Création…" : "Générer un lien d’invitation"}
        </button>
        {error ? <div className="mt-3 text-xs text-[#c0523c]">{error}</div> : null}
      </div>
    );
  }

  return <JoinInviteCard code={existingCode} link={`${siteUrl}/join/${existingCode}`} />;
}
