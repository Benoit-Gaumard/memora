"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { uploadEventCoverImage } from "@/lib/storage";

export function EditEventForm({
  event,
  coverImageUrl,
}: {
  event: {
    id: string;
    name: string;
    event_type: string;
    description: string;
    event_date: string;
    status: string;
    cover_image_path: string | null;
  };
  coverImageUrl: string | null;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(event.name);
  const [eventType, setEventType] = useState(event.event_type);
  const [eventDate, setEventDate] = useState(event.event_date.slice(0, 10));
  const [description, setDescription] = useState(event.description);
  const [status, setStatus] = useState(event.status);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from("events")
        .update({
          name,
          event_type: eventType,
          description,
          event_date: new Date(eventDate).toISOString(),
          status,
        })
        .eq("id", event.id);

      if (error) {
        setMessage({ type: "error", text: error.message });
        return;
      }

      setMessage({ type: "success", text: "Événement mis à jour." });
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

  async function handleCoverChange(fileEvent: React.ChangeEvent<HTMLInputElement>) {
    const file = fileEvent.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    setMessage(null);

    try {
      const { error } = await uploadEventCoverImage({
        eventId: event.id,
        file,
        previousPath: event.cover_image_path,
      });

      if (error) {
        setMessage({ type: "error", text: error.message });
        return;
      }

      setMessage({ type: "success", text: "Photo de couverture mise à jour." });
      router.refresh();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Une erreur est survenue.",
      });
    } finally {
      setUploadingCover(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-[32px] border border-[#f0d9bf] bg-white p-5 shadow-sm md:grid-cols-2"
    >
      <div className="md:col-span-2">
        <div className="text-sm font-medium text-[#493d36]">Photo de couverture</div>
        <div className="mt-2 flex items-center gap-4">
          <div className="h-24 w-36 overflow-hidden rounded-2xl border border-[#eed8bd] bg-[#fff5ed]">
            {coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverImageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-[#a48d80]">
                Aucune photo
              </div>
            )}
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              disabled={uploadingCover}
              className="hidden"
              id="cover-image-input"
            />
            <label
              htmlFor="cover-image-input"
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#f4b178] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#e6995b]"
            >
              {uploadingCover ? "Envoi…" : "Changer la photo"}
            </label>
          </div>
        </div>
      </div>

      <label className="block text-sm font-medium text-[#493d36]">
        Nom de l’événement
        <input
          required
          value={name}
          onChange={(fieldEvent) => setName(fieldEvent.target.value)}
          className="mt-2 w-full rounded-2xl border border-[#eed8bd] bg-[#fffdfb] px-3 py-2.5 outline-none transition focus:border-[#e38a52]"
        />
      </label>

      <label className="block text-sm font-medium text-[#493d36]">
        Type
        <select
          value={eventType}
          onChange={(fieldEvent) => setEventType(fieldEvent.target.value)}
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
          onChange={(fieldEvent) => setEventDate(fieldEvent.target.value)}
          className="mt-2 w-full rounded-2xl border border-[#eed8bd] bg-[#fffdfb] px-3 py-2.5 outline-none transition focus:border-[#e38a52]"
        />
      </label>

      <label className="block text-sm font-medium text-[#493d36]">
        Statut
        <select
          value={status}
          onChange={(fieldEvent) => setStatus(fieldEvent.target.value)}
          className="mt-2 w-full rounded-2xl border border-[#eed8bd] bg-[#fffdfb] px-3 py-2.5 outline-none transition focus:border-[#e38a52]"
        >
          <option value="DRAFT">Brouillon</option>
          <option value="ACTIVE">Actif</option>
          <option value="CLOSED">Clôturé</option>
          <option value="ARCHIVED">Archivé</option>
        </select>
      </label>

      <label className="block text-sm font-medium text-[#493d36] md:col-span-2">
        Description
        <textarea
          value={description}
          onChange={(fieldEvent) => setDescription(fieldEvent.target.value)}
          rows={2}
          className="mt-2 w-full rounded-2xl border border-[#eed8bd] bg-[#fffdfb] px-3 py-2.5 outline-none transition focus:border-[#e38a52]"
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
          className="rounded-full bg-[#f4b178] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#e6995b] disabled:opacity-60"
        >
          {submitting ? "Enregistrement…" : "Enregistrer les modifications"}
        </button>
      </div>
    </form>
  );
}
