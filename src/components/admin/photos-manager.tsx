"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Trash2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatShortDate } from "@/lib/utils";

export interface AdminPhotoItem {
  id: string;
  original_filename: string;
  uploaded_at: string | null;
  storage_original_path: string;
  storage_display_path: string;
  storage_thumbnail_path: string;
  eventName: string;
  authorName: string;
  url: string | null;
}

export interface AdminEventOption {
  id: string;
  name: string;
}

export function PhotosManager({
  photos,
  events,
  selectedEventId,
}: {
  photos: AdminPhotoItem[];
  events: AdminEventOption[];
  selectedEventId: string | null;
}) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<AdminPhotoItem | null>(null);

  const allSelected = photos.length > 0 && selectedIds.size === photos.length;

  const storagePathsById = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const photo of photos) {
      map.set(
        photo.id,
        Array.from(
          new Set([photo.storage_original_path, photo.storage_display_path, photo.storage_thumbnail_path]),
        ),
      );
    }
    return map;
  }, [photos]);

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleAll() {
    setSelectedIds((prev) => (prev.size === photos.length ? new Set() : new Set(photos.map((p) => p.id))));
  }

  function handleFilterChange(eventId: string) {
    const params = new URLSearchParams();
    if (eventId) params.set("event", eventId);
    router.push(`/admin/photos${params.toString() ? `?${params.toString()}` : ""}`);
  }

  async function handleBulkDelete() {
    if (!selectedIds.size) return;
    if (!window.confirm(`Supprimer ${selectedIds.size} photo(s) ? Cette action est irréversible.`)) return;

    setIsDeleting(true);

    const ids = Array.from(selectedIds);
    const allPaths = ids.flatMap((id) => storagePathsById.get(id) ?? []);

    if (allPaths.length) {
      await supabase.storage.from("event-photos").remove(allPaths);
    }
    await supabase.from("photos").delete().in("id", ids);

    setIsDeleting(false);
    setSelectedIds(new Set());
    router.refresh();
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="event-filter" className="text-sm font-medium text-[#5a4d47]">
            Filtrer par événement
          </label>
          <select
            id="event-filter"
            value={selectedEventId ?? ""}
            onChange={(event) => handleFilterChange(event.target.value)}
            className="rounded-full border border-[#f0d9bf] bg-white px-3 py-2 text-sm text-[#2f2825]"
          >
            <option value="">Tous les événements</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </div>

        {photos.length ? (
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-[#5a4d47]">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} />
              Tout sélectionner
            </label>
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={!selectedIds.size || isDeleting}
              className="inline-flex items-center gap-2 rounded-full bg-[#e6614a] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#d4503a] disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {isDeleting
                ? "Suppression…"
                : `Supprimer${selectedIds.size ? ` (${selectedIds.size})` : ""}`}
            </button>
          </div>
        ) : null}
      </div>

      {photos.length ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="overflow-hidden rounded-3xl border border-[#f0d9bf] bg-white shadow-sm"
            >
              <div className="relative aspect-square overflow-hidden bg-[#f2ebdf]">
                <label className="absolute left-2 top-2 z-10 rounded-full bg-white/90 p-1.5 shadow-sm">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(photo.id)}
                    onChange={() => toggleOne(photo.id)}
                  />
                </label>
                {photo.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo.url}
                    alt={photo.original_filename}
                    onClick={() => setPreviewPhoto(photo)}
                    className="h-full w-full cursor-pointer object-cover transition hover:opacity-90"
                  />
                ) : null}
              </div>
              <div className="space-y-1 p-3">
                <div className="truncate text-sm font-medium text-[#2f2825]">{photo.original_filename}</div>
                <div className="truncate text-xs text-[#7c675d]">
                  {photo.eventName} · {photo.authorName}
                </div>
                <div className="text-xs text-[#8a7268]">
                  {photo.uploaded_at ? formatShortDate(photo.uploaded_at) : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-[#f0d9bf] bg-[#fffaf3] p-8 text-center text-[#544a44]">
          Aucune photo ne correspond à ce filtre.
        </div>
      )}

      {previewPhoto ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            className="relative max-h-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewPhoto(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 text-[#2f2825] shadow-sm"
            >
              <X className="h-4 w-4" />
            </button>
            {previewPhoto.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewPhoto.url}
                alt={previewPhoto.original_filename}
                className="max-h-[80vh] w-full object-contain"
              />
            ) : null}
            <div className="flex items-center justify-between gap-3 p-4">
              <div>
                <div className="text-sm font-semibold text-[#241e1a]">{previewPhoto.original_filename}</div>
                <div className="text-xs text-[#7c675d]">
                  {previewPhoto.eventName} · {previewPhoto.authorName} ·{" "}
                  {previewPhoto.uploaded_at ? formatShortDate(previewPhoto.uploaded_at) : ""}
                </div>
              </div>
              {previewPhoto.url ? (
                <a
                  href={previewPhoto.url}
                  download={previewPhoto.original_filename}
                  className="inline-flex items-center gap-2 rounded-full bg-[#f4b178] px-3 py-2 text-xs font-semibold text-white"
                >
                  <Download className="h-3.5 w-3.5" />
                  Télécharger
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
