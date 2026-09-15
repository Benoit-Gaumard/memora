"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const USERNAME_PATTERN = "[A-Za-z0-9._-]{3,30}";

const ERROR_MESSAGES: Record<string, string> = {
  USERNAME_TAKEN: "Ce nom d’utilisateur est déjà pris.",
  INVALID_USERNAME:
    "Le nom d’utilisateur doit faire 3 à 30 caractères, sans espace ni accent (lettres, chiffres, . _ -).",
  INVALID_DISPLAY_NAME: "Le nom affiché doit faire entre 1 et 60 caractères.",
  AUTH_REQUIRED: "Votre session a expiré. Reconnectez-vous.",
};

function translateError(message: string | undefined) {
  if (!message) return "Impossible d’enregistrer ces changements.";

  for (const [code, label] of Object.entries(ERROR_MESSAGES)) {
    if (message.includes(code)) return label;
  }

  return "Impossible d’enregistrer ces changements.";
}

export function ProfileIdentityForm({
  username,
  displayName,
}: {
  username: string;
  displayName: string;
}) {
  const router = useRouter();
  const [nextUsername, setNextUsername] = useState(username);
  const [nextDisplayName, setNextDisplayName] = useState(displayName);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isUnchanged =
    nextUsername.trim() === username && nextDisplayName.trim() === displayName;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    const { error: updateError } = await supabase.rpc("update_my_profile", {
      p_username: nextUsername.trim(),
      p_display_name: nextDisplayName.trim(),
    });

    setSubmitting(false);

    if (updateError) {
      setError(translateError(updateError.message));
      return;
    }

    // profiles fait foi, mais l'en-tête lit le nom affiché dans les métadonnées
    // de la session : on les resynchronise pour éviter un avatar périmé.
    await supabase.auth.updateUser({
      data: { username: nextUsername.trim(), display_name: nextDisplayName.trim() },
    });

    setSuccess("Profil mis à jour.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-ink">
          Nom affiché
          <input
            type="text"
            value={nextDisplayName}
            onChange={(event) => setNextDisplayName(event.target.value)}
            className="field mt-2"
            maxLength={60}
            required
          />
        </label>

        <label className="block text-sm font-semibold text-ink">
          Nom d’utilisateur
          <input
            type="text"
            value={nextUsername}
            onChange={(event) => setNextUsername(event.target.value)}
            className="field mt-2"
            pattern={USERNAME_PATTERN}
            autoComplete="username"
            required
          />
        </label>
      </div>

      <p className="text-sm text-ink-soft">
        Le nom affiché est celui que vos invités voient sur vos photos. Le nom
        d’utilisateur sert de raccourci pour vous connecter : votre adresse
        e-mail, elle, reste l’identifiant du compte et ne change pas.
      </p>

      {error ? (
        <div
          role="alert"
          className="rounded-2xl border-2 border-ink bg-citron px-3 py-2 text-sm font-semibold text-ink"
        >
          {error}
        </div>
      ) : null}

      {success ? (
        <div
          role="status"
          className="rounded-2xl border-2 border-ink bg-turquoise px-3 py-2 text-sm font-semibold text-ink"
        >
          {success}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={submitting || isUnchanged}
        className="btn btn-fuchsia"
      >
        {submitting ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
