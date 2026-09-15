"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

/**
 * Confirmation d'une action irréversible.
 *
 * On s'appuie sur `<dialog>` natif : Échap, le piège de focus et l'inertie de
 * l'arrière-plan sont gérés par le navigateur. `confirmationText` ajoute le
 * garde-fou du « tapez le nom exact » pour les suppressions définitives.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  pendingLabel,
  confirmationText,
  confirmationHint,
  error,
  submitting = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  pendingLabel: string;
  confirmationText?: string;
  confirmationHint?: React.ReactNode;
  error?: string | null;
  submitting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [typed, setTyped] = useState("");
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      setTyped("");
      dialog.showModal();
      // Sans cela le focus atterrit sur la croix de fermeture : on l'amène là
      // où l'on attend une action de la personne.
      inputRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const matches =
    !confirmationText || typed.trim().toLowerCase() === confirmationText.trim().toLowerCase();
  const canConfirm = matches && !submitting;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canConfirm) return;
    onConfirm();
  }

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      // Échap et le clic sur le fond passent par le même chemin que « Annuler ».
      onCancel={(event) => {
        event.preventDefault();
        if (!submitting) onCancel();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current && !submitting) onCancel();
      }}
    >
      <form onSubmit={handleSubmit} className="paper paper-danger relative p-6 sm:p-7">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          aria-label="Fermer"
          className="absolute right-4 top-4 rounded-full border-2 border-ink bg-white p-1.5 text-ink transition-colors hover:bg-paper disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3 pr-10">
          <span
            aria-hidden="true"
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-rouge text-rouge"
          >
            <AlertTriangle className="h-4 w-4" />
          </span>
          <h2 id={titleId} className="font-display text-xl font-extrabold leading-tight text-ink">
            {title}
          </h2>
        </div>

        <div id={descriptionId} className="mt-4 space-y-2 text-sm text-ink-soft">
          {description}
        </div>

        {confirmationText ? (
          <label className="mt-5 block text-sm font-semibold text-ink">
            <span className="block">
              {confirmationHint ?? (
                <>
                  Tapez <span className="font-display font-extrabold">{confirmationText}</span> pour
                  confirmer
                </>
              )}
            </span>
            <input
              ref={inputRef}
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              className="field field-danger mt-2 block"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              disabled={submitting}
            />
          </label>
        ) : null}

        {error ? (
          <div
            role="alert"
            className="mt-4 rounded-2xl border-2 border-rouge bg-white px-3 py-2 text-sm font-semibold text-rouge"
          >
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="btn btn-sm btn-ghost"
          >
            Annuler
          </button>
          <button type="submit" disabled={!canConfirm} className="btn btn-sm btn-ghost btn-danger">
            {submitting ? pendingLabel : confirmLabel}
          </button>
        </div>
      </form>
    </dialog>
  );
}
