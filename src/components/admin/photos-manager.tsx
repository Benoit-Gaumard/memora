"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Trash2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatShortDate } from "@/lib/utils";
import {
  PlainHeader,
  SortableHeader,
  useSortedRows,
  type SortValue,
} from "@/components/admin/sortable-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

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
  thumbnailUrl: string | null;
}

export interface AdminEventOption {
  id: string;
  name: string;
}

const SORT_ACCESSORS = {
  filename: (photo: AdminPhotoItem) => photo.original_filename,
  event: (photo: AdminPhotoItem) => photo.eventName,
  author: (photo: AdminPhotoItem) => photo.authorName,
  date: (photo: AdminPhotoItem) => photo.uploaded_at,
} satisfies Record<string, (photo: AdminPhotoItem) => SortValue>;

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
  const [confirmingBulk, setConfirmingBulk] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<AdminPhotoItem | null>(null);

  const { sorted, sort, toggleSort } = useSortedRows({
    rows: photos,
    accessors: SORT_ACCESSORS,
    initialKey: "date",
    initialDirection: "desc",
  });

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

    setIsDeleting(true);
    setDeleteError(null);

    const ids = Array.from(selectedIds);
    const allPaths = ids.flatMap((id) => storagePathsById.get(id) ?? []);

    if (allPaths.length) {
      await supabase.storage.from("event-photos").remove(allPaths);
    }
    const { error } = await supabase.from("photos").delete().in("id", ids);

    setIsDeleting(false);

    if (error) {
      setDeleteError("Suppression impossible. Réessayez.");
      return;
    }

    setConfirmingBulk(false);
    setSelectedIds(new Set());
    router.refresh();
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="event-filter" className="text-sm font-medium text-ink-soft">
            Filtrer par événement
          </label>
          <select
            id="event-filter"
            value={selectedEventId ?? ""}
            onChange={(event) => handleFilterChange(event.target.value)}
            className="field w-auto"
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
            <button
              type="button"
              onClick={() => {
                setDeleteError(null);
                setConfirmingBulk(true);
              }}
              disabled={!selectedIds.size || isDeleting}
              className="btn btn-sm btn-mandarine disabled:opacity-50"
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
        <div className="overflow-x-auto paper p-0">
          <table className="min-w-full text-left text-sm text-ink-soft">
            <thead className="bg-paper text-ink-soft">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Tout sélectionner"
                  />
                </th>
                <PlainHeader srLabel="Aperçu" />
                <SortableHeader label="Fichier" sortKey="filename" sort={sort} onSort={toggleSort} />
                <SortableHeader label="Événement" sortKey="event" sort={sort} onSort={toggleSort} />
                <SortableHeader label="Auteur" sortKey="author" sort={sort} onSort={toggleSort} />
                <SortableHeader label="Date" sortKey="date" sort={sort} onSort={toggleSort} />
              </tr>
            </thead>
            <tbody>
              {sorted.map((photo) => {
                const thumbnailUrl = photo.thumbnailUrl ?? photo.url;

                return (
                  <tr key={photo.id} className="border-t border-ink/15">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(photo.id)}
                        onChange={() => toggleOne(photo.id)}
                        aria-label={`Sélectionner ${photo.original_filename}`}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => setPreviewPhoto(photo)}
                        className="block h-12 w-16 overflow-hidden rounded-xl border border-ink/15 bg-paper transition hover:opacity-80"
                        aria-label={`Agrandir ${photo.original_filename}`}
                      >
                        {thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={thumbnailUrl}
                            alt={photo.original_filename}
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </button>
                    </td>
                    <td className="max-w-xs truncate px-4 py-4 font-semibold text-ink">
                      {photo.original_filename}
                    </td>
                    <td className="px-4 py-4">{photo.eventName}</td>
                    <td className="px-4 py-4">{photo.authorName}</td>
                    <td className="px-4 py-4">
                      {photo.uploaded_at ? formatShortDate(photo.uploaded_at) : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="paper p-8 text-center text-ink-soft">
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
              className="absolute right-3 top-3 z-10 rounded-full border-2 border-ink bg-white p-2 text-ink"
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
                <div className="text-sm font-semibold text-ink">{previewPhoto.original_filename}</div>
                <div className="text-xs text-ink-soft">
                  {previewPhoto.eventName} · {previewPhoto.authorName} ·{" "}
                  {previewPhoto.uploaded_at ? formatShortDate(previewPhoto.uploaded_at) : ""}
                </div>
              </div>
              {previewPhoto.url ? (
                <a
                  href={previewPhoto.url}
                  download={previewPhoto.original_filename}
                  className="btn btn-fuchsia"
                >
                  <Download className="h-3.5 w-3.5" />
                  Télécharger
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmingBulk}
        title={
          selectedIds.size > 1
            ? `Supprimer ces ${selectedIds.size} photos ?`
            : "Supprimer cette photo ?"
        }
        description={
          <p>
            {selectedIds.size > 1
              ? "Elles disparaîtront des albums pour tout le monde, avec leurs commentaires et leurs réactions."
              : "Elle disparaîtra de l’album pour tout le monde, avec ses commentaires et ses réactions."}{" "}
            Les fichiers quittent aussi le stockage : rien ne pourra être récupéré.
          </p>
        }
        confirmLabel={
          selectedIds.size > 1 ? `Supprimer les ${selectedIds.size} photos` : "Supprimer la photo"
        }
        pendingLabel="Suppression…"
        error={deleteError}
        submitting={isDeleting}
        onConfirm={handleBulkDelete}
        onCancel={() => {
          if (isDeleting) return;
          setConfirmingBulk(false);
          setDeleteError(null);
        }}
      />
    </div>
  );
}
