"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAccount, signInWithPassword } from "@/lib/auth";

export function LoginForm({ redirectTo }: { redirectTo?: string } = {}) {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [identifier, setIdentifier] = useState("paulmartin");
  const [username, setUsername] = useState("paulmartin");
  const [password, setPassword] = useState("Demo123!");
  const [displayName, setDisplayName] = useState("Paul Martin");
  const [email, setEmail] = useState("paul@memora.app");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const result =
        mode === "signin"
          ? await signInWithPassword({ identifier, password })
          : await createAccount({
              username,
              password,
              displayName,
              email,
            });

      if (result.error) {
        setMessage(result.error.message ?? "Une erreur est survenue.");
        return;
      }

      const hasLiveSupabase = Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      );
      const session = "session" in result.data ? result.data.session : undefined;

      if (hasLiveSupabase && mode === "signup" && !session) {
        setMessage(
          "Compte créé. Vérifiez votre boîte mail pour confirmer votre adresse avant de vous connecter.",
        );
        return;
      }

      setMessage(
        mode === "signin"
          ? "Connexion réussie. Redirection…"
          : "Compte créé. Redirection…",
      );

      const target = redirectTo && redirectTo.startsWith("/") ? redirectTo : "/events";
      router.push(target);
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Impossible de traiter la demande pour l’instant.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="paper space-y-5 p-6">
      <h1 className="display-sm text-3xl">
        {mode === "signin" ? "Content de vous revoir." : "Bienvenue dans la fête."}
      </h1>

      <div className="flex gap-2 rounded-full border-2 border-ink bg-white p-1">
        <button
          type="button"
          className={`flex-1 rounded-full px-3 py-2 font-display text-sm font-bold transition ${
            mode === "signin" ? "bg-fuchsia text-ink" : "text-ink-soft hover:bg-paper"
          }`}
          onClick={() => setMode("signin")}
        >
          Connexion
        </button>
        <button
          type="button"
          className={`flex-1 rounded-full px-3 py-2 font-display text-sm font-bold transition ${
            mode === "signup" ? "bg-fuchsia text-ink" : "text-ink-soft hover:bg-paper"
          }`}
          onClick={() => setMode("signup")}
        >
          Créer un compte
        </button>
      </div>

      <div className="space-y-4">
        {mode === "signup" ? (
          <label className="block text-sm font-semibold text-ink">
            Nom affiché
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="field mt-2"
            />
          </label>
        ) : null}

        {mode === "signup" ? (
          <label className="block text-sm font-semibold text-ink">
            Adresse e-mail
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              className="field mt-2"
            />
          </label>
        ) : null}

        {mode === "signup" ? (
          <label className="block text-sm font-semibold text-ink">
            Identifiant
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="field mt-2"
            />
          </label>
        ) : (
          <label className="block text-sm font-semibold text-ink">
            Identifiant ou e-mail
            <input
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              className="field mt-2"
            />
          </label>
        )}

        <label className="block text-sm font-semibold text-ink">
          Mot de passe
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="field mt-2"
          />
        </label>
      </div>

      {message ? (
        <div
          role="status"
          className="rounded-2xl border-2 border-ink bg-citron px-3 py-2 text-sm font-semibold text-ink"
        >
          {message}
        </div>
      ) : null}

      <button type="submit" disabled={submitting} className="btn btn-turquoise w-full">
        {submitting
          ? "Traitement…"
          : mode === "signin"
            ? "Se connecter"
            : "Créer mon compte"}
      </button>
    </form>
  );
}
