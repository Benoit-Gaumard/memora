"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAccount, signInWithPassword } from "@/lib/auth";

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
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
          ? await signInWithPassword({ username, password })
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

      setMessage(
        mode === "signin"
          ? "Connexion réussie. Redirection…"
          : "Compte créé. Vérification de votre accès…",
      );

      router.push("/events");
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
    <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-[#f0d9bf] bg-white p-6 shadow-sm">
      <div className="flex gap-2 rounded-full bg-[#fff5ed] p-1">
        <button
          type="button"
          className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold transition ${
            mode === "signin" ? "bg-[#f4b178] text-white" : "text-[#685a52]"
          }`}
          onClick={() => setMode("signin")}
        >
          Connexion
        </button>
        <button
          type="button"
          className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold transition ${
            mode === "signup" ? "bg-[#f4b178] text-white" : "text-[#685a52]"
          }`}
          onClick={() => setMode("signup")}
        >
          Créer un compte
        </button>
      </div>

      <div className="space-y-4">
        {mode === "signup" ? (
          <label className="block text-sm font-medium text-[#493d36]">
            Nom affiché
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-[#eed8bd] bg-[#fffdfb] px-3 py-2.5 outline-none ring-0 transition focus:border-[#e38a52]"
            />
          </label>
        ) : null}

        {mode === "signup" ? (
          <label className="block text-sm font-medium text-[#493d36]">
            Email
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              className="mt-2 w-full rounded-2xl border border-[#eed8bd] bg-[#fffdfb] px-3 py-2.5 outline-none ring-0 transition focus:border-[#e38a52]"
            />
          </label>
        ) : null}

        <label className="block text-sm font-medium text-[#493d36]">
          Username
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-[#eed8bd] bg-[#fffdfb] px-3 py-2.5 outline-none ring-0 transition focus:border-[#e38a52]"
          />
        </label>

        <label className="block text-sm font-medium text-[#493d36]">
          Mot de passe
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-[#eed8bd] bg-[#fffdfb] px-3 py-2.5 outline-none ring-0 transition focus:border-[#e38a52]"
          />
        </label>
      </div>

      {message ? (
        <div className="rounded-2xl border border-[#f2d7c2] bg-[#fff7f1] px-3 py-2 text-sm text-[#5c4337]">
          {message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-2xl bg-[#f4b178] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#e6995b] disabled:opacity-60"
      >
        {submitting
          ? "Traitement…"
          : mode === "signin"
            ? "Se connecter"
            : "Créer mon compte"}
      </button>
    </form>
  );
}
