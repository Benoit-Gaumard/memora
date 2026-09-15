"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

const MIN_LENGTH = 8;

export function ChangePasswordForm({ email }: { email: string | null }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (nextPassword.length < MIN_LENGTH) {
      setError(`Le nouveau mot de passe doit faire au moins ${MIN_LENGTH} caractères.`);
      return;
    }

    if (nextPassword !== confirmation) {
      setError("Les deux nouveaux mots de passe ne correspondent pas.");
      return;
    }

    if (nextPassword === currentPassword) {
      setError("Le nouveau mot de passe doit être différent de l’actuel.");
      return;
    }

    setSubmitting(true);

    try {
      // Supabase ne revérifie pas le mot de passe actuel lors d'un updateUser :
      // on le fait nous-mêmes, pour qu'une session laissée ouverte ne suffise
      // pas à changer les identifiants du compte.
      if (email) {
        const { error: reauthError } = await supabase.auth.signInWithPassword({
          email,
          password: currentPassword,
        });

        if (reauthError) {
          setError("Mot de passe actuel incorrect.");
          return;
        }
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: nextPassword,
      });

      if (updateError) {
        setError(updateError.message ?? "Impossible de mettre à jour le mot de passe.");
        return;
      }

      setCurrentPassword("");
      setNextPassword("");
      setConfirmation("");
      setSuccess("Mot de passe mis à jour.");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Impossible de mettre à jour le mot de passe pour l’instant.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block text-sm font-semibold text-ink">
        Mot de passe actuel
        <input
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          className="field mt-2"
          required
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-ink">
          Nouveau mot de passe
          <input
            type="password"
            autoComplete="new-password"
            value={nextPassword}
            onChange={(event) => setNextPassword(event.target.value)}
            className="field mt-2"
            minLength={MIN_LENGTH}
            required
          />
        </label>

        <label className="block text-sm font-semibold text-ink">
          Confirmation
          <input
            type="password"
            autoComplete="new-password"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            className="field mt-2"
            minLength={MIN_LENGTH}
            required
          />
        </label>
      </div>

      <p className="text-sm text-ink-soft">
        {MIN_LENGTH} caractères minimum. Vous resterez connecté sur cet appareil.
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

      <button type="submit" disabled={submitting} className="btn btn-turquoise">
        {submitting ? "Mise à jour…" : "Changer mon mot de passe"}
      </button>
    </form>
  );
}
