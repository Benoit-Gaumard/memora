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

export function CreateEventForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [eventType, setEventType] = useState("Mariage");
  const [eventDate, setEventDate] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Vous devez être connecté pour créer un événement.");
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
        setMessage(eventError?.message ?? "Impossible de créer l'événement.");
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
        setMessage(memberError.message);
        return;
      }

      setName("");
      setEventType("Mariage");
      setEventDate("");
      setDescription("");
      setMessage("Événement créé avec succès.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 grid gap-4 rounded-[32px] border border-[#f0d9bf] bg-white p-5 shadow-sm md:grid-cols-2"
    >
      <label className="block text-sm font-medium text-[#493d36]">
        Nom de l’événement
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-[#eed8bd] bg-[#fffdfb] px-3 py-2.5 outline-none transition focus:border-[#e38a52]"
        />
      </label>

      <label className="block text-sm font-medium text-[#493d36]">
        Type
        <select
          value={eventType}
          onChange={(event) => setEventType(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-[#eed8bd] bg-[#fffdfb] px-3 py-2.5 outline-none transition focus:border-[#e38a52]"
        >
          <option>Mariage</option>
          <option>Anniversaire</option>
          <option>Séminaire</option>
          <option>Autre</option>
        </select>
      </label>

      <label className="block text-sm font-medium text-[#493d36]">
        Date
        <input
          required
          type="date"
          value={eventDate}
          onChange={(event) => setEventDate(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-[#eed8bd] bg-[#fffdfb] px-3 py-2.5 outline-none transition focus:border-[#e38a52]"
        />
      </label>

      <label className="block text-sm font-medium text-[#493d36] md:col-span-2">
        Description
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={2}
          className="mt-2 w-full rounded-2xl border border-[#eed8bd] bg-[#fffdfb] px-3 py-2.5 outline-none transition focus:border-[#e38a52]"
        />
      </label>

      {message ? (
        <div className="rounded-2xl border border-[#f2d7c2] bg-[#fff7f1] px-3 py-2 text-sm text-[#5c4337] md:col-span-2">
          {message}
        </div>
      ) : null}

      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-[#f4b178] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#e6995b] disabled:opacity-60"
        >
          {submitting ? "Création…" : "+ Créer un événement"}
        </button>
      </div>
    </form>
  );
}
