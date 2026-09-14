"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Candidate = {
  id: string;
  displayName: string;
  username: string;
  email: string | null;
};

export function EventMembersManager({
  eventId,
  candidates,
}: {
  eventId: string;
  candidates: Candidate[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return candidates;
    return candidates.filter(
      (candidate) =>
        candidate.displayName.toLowerCase().includes(query) ||
        candidate.username.toLowerCase().includes(query) ||
        (candidate.email ?? "").toLowerCase().includes(query),
    );
  }, [candidates, search]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleAdd() {
    if (selected.size === 0) return;
    setSubmitting(true);
    setMessage(null);

    try {
      const rows = Array.from(selected).map((userId) => ({
        event_id: eventId,
        user_id: userId,
        role: "participant" as const,
        status: "active" as const,
        joined_via: "admin" as const,
      }));

      const { error } = await supabase.from("event_members").insert(rows);

      if (error) {
        setMessage({ type: "error", text: error.message });
        return;
      }

      setMessage({
        type: "success",
        text: `${rows.length} membre${rows.length > 1 ? "s" : ""} ajouté${rows.length > 1 ? "s" : ""}.`,
      });
      setSelected(new Set());
      router.refresh();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Une erreur est survenue.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-[32px] border border-[#f0d9bf] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-lg font-bold text-[#241e1a]">Ajouter des membres</div>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Rechercher un utilisateur…"
          className="w-full max-w-xs rounded-2xl border border-[#eed8bd] bg-[#fffdfb] px-3 py-2 text-sm outline-none transition focus:border-[#e38a52]"
        />
      </div>

      {message ? (
        <div
          className={`mt-4 rounded-2xl border px-3 py-2 text-sm font-medium ${
            message.type === "error"
              ? "border-red-300 bg-red-50 text-red-700"
              : "border-green-300 bg-green-50 text-green-700"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <div className="mt-4 max-h-80 overflow-y-auto rounded-2xl border border-[#f4e5d3]">
        {filtered.length ? (
          <ul className="divide-y divide-[#f4e5d3]">
            {filtered.map((candidate) => (
              <li key={candidate.id} className="flex items-center gap-3 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selected.has(candidate.id)}
                  onChange={() => toggle(candidate.id)}
                  className="h-4 w-4 rounded border-[#eed8bd] text-[#d38656] focus:ring-[#e38a52]"
                />
                <div>
                  <div className="text-sm font-semibold text-[#221d1a]">{candidate.displayName}</div>
                  <div className="text-xs text-[#8a7268]">
                    {candidate.username}
                    {candidate.email ? ` · ${candidate.email}` : ""}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-4 py-6 text-center text-sm text-[#8a7268]">
            {candidates.length === 0
              ? "Tous les utilisateurs sont déjà membres de cet événement."
              : "Aucun utilisateur ne correspond à cette recherche."}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={submitting || selected.size === 0}
        className="mt-4 rounded-full bg-[#f4b178] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#e6995b] disabled:opacity-60"
      >
        {submitting
          ? "Ajout en cours…"
          : `Ajouter ${selected.size > 0 ? `(${selected.size})` : ""}`.trim()}
      </button>
    </div>
  );
}
