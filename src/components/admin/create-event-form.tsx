"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") || "evenement"
  );
}

function defaultEventDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

export function CreateEventForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [eventType, setEventType] = useState("Mariage");
  const [eventDate, setEventDate] = useState(defaultEventDate);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage({ type: "error", text: "Vous devez être connecté pour créer un événement." });
        return;
      }

      const slug = `${slugify(name)}-${Math.random().toString(36).slice(2, 7)}`;

      const { data: createdEvent, error: eventError } = await supabase
        .from("events")
        .insert({
          name,
          slug,
          event_type: eventType,
          description,
          event_date: new Date(eventDate).toISOString(),
          bucket_name: slug,
          status: "ACTIVE",
          created_by: user.id,
        })
        .select("id")
        .single();

      if (eventError || !createdEvent) {
        console.error("Erreur création événement:", eventError);
        setMessage({
          type: "error",
          text: eventError?.message ?? "Impossible de créer l'événement.",
        });
        return;
      }

      const { error: memberError } = await supabase.from("event_members").insert({
        event_id: createdEvent.id,
        user_id: user.id,
        role: "organizer",
        status: "active",
        joined_via: "admin",
      });

      if (memberError) {
        console.error("Erreur ajout organisateur:", memberError);
        // Ne pas laisser un événement orphelin sans organisateur : on annule.
        await supabase.from("events").delete().eq("id", createdEvent.id);
        setMessage({
          type: "error",
          text: `L'événement n'a pas pu être créé (${memberError.message}). Vérifiez que les scripts de base de données ont bien été exécutés dans Supabase.`,
        });
        return;
      }

      setName("");
      setEventType("Mariage");
      setEventDate(defaultEventDate());
      setDescription("");
      setMessage({ type: "success", text: "Événement créé avec succès." });
      router.refresh();
    } catch (error) {
      console.error("Erreur inattendue lors de la création de l'événement:", error);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Une erreur est survenue.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 grid gap-4 paper p-5 md:grid-cols-2"
    >
      <label className="block text-sm font-medium text-ink-soft">
        Nom de l’événement
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="field mt-2"
        />
      </label>

      <label className="block text-sm font-medium text-ink-soft">
        Type
        <select
          value={eventType}
          onChange={(event) => setEventType(event.target.value)}
          className="field mt-2"
        >
          <option>Mariage</option>
          <option>Anniversaire</option>
          <option>Séminaire</option>
          <option>Autre</option>
        </select>
      </label>

      <label className="block text-sm font-medium text-ink-soft">
        Date
        <input
          required
          type="date"
          value={eventDate}
          onChange={(event) => setEventDate(event.target.value)}
          className="field mt-2"
        />
      </label>

      <label className="block text-sm font-medium text-ink-soft md:col-span-2">
        Description
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={2}
          className="field mt-2"
        />
      </label>

      {message ? (
        <div
          className={`rounded-2xl border px-3 py-2 text-sm font-medium md:col-span-2 ${
            message.type === "error"
              ? "border-red-300 bg-red-50 text-red-700"
              : "border-green-300 bg-green-50 text-green-700"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={submitting}
          className="btn btn-fuchsia disabled:opacity-60"
        >
          {submitting ? "Création…" : "+ Créer un événement"}
        </button>
      </div>
    </form>
  );
}
