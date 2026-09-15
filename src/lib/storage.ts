import { supabase } from "@/lib/supabase";
import { buildImageDerivatives, type ImageDerivative } from "@/lib/image-derivatives";

export const PHOTOS_BUCKET = "event-photos";

async function computeChecksum(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Uploads a photo file to the shared "event-photos" storage bucket (under a
 * per-event folder) and records its metadata in the `photos` table. Both
 * steps are enforced server-side by RLS: the caller must be an active member
 * of the event.
 *
 * Trois objets partent dans le bucket : l'original intact, une version
 * d'affichage et une vignette (voir `image-derivatives`). Les galeries ne
 * lisent que la vignette, ce qui divise le poids d'une grille par vingt.
 */
export async function uploadEventPhoto({
  eventId,
  userId,
  file,
}: {
  eventId: string;
  userId: string;
  file: File;
}) {
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "";
  const baseName = crypto.randomUUID();
  const storedFilename = `${baseName}${extension ? `.${extension}` : ""}`;
  const storagePath = `${eventId}/${storedFilename}`;

  const [checksum, derivatives] = await Promise.all([
    computeChecksum(file),
    buildImageDerivatives(file),
  ]);

  const uploadedPaths: string[] = [];

  const { error: uploadError } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .upload(storagePath, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return { error: uploadError };
  }

  uploadedPaths.push(storagePath);

  // Les dérivées sont un accélérateur, pas une exigence : si l'une d'elles
  // échoue, on retombe sur l'original plutôt que de refuser la photo.
  async function uploadDerivative(
    derivative: ImageDerivative | null,
    suffix: string,
  ): Promise<string> {
    if (!derivative) return storagePath;

    const path = `${eventId}/${baseName}-${suffix}.${derivative.extension}`;
    const { error } = await supabase.storage
      .from(PHOTOS_BUCKET)
      .upload(path, derivative.blob, { contentType: derivative.contentType, upsert: false });

    if (error) return storagePath;

    uploadedPaths.push(path);
    return path;
  }

  const [displayPath, thumbnailPath] = await Promise.all([
    uploadDerivative(derivatives.display, "display"),
    uploadDerivative(derivatives.thumbnail, "thumb"),
  ]);

  const { error: insertError } = await supabase.from("photos").insert({
    event_id: eventId,
    user_id: userId,
    original_filename: file.name,
    stored_filename: storedFilename,
    storage_original_path: storagePath,
    storage_display_path: displayPath,
    storage_thumbnail_path: thumbnailPath,
    mime_type: file.type || "application/octet-stream",
    file_size: file.size,
    width: derivatives.width,
    height: derivatives.height,
    checksum,
    status: "ready",
  });

  if (insertError) {
    // Best-effort cleanup so we don't leave an orphaned file behind.
    await supabase.storage.from(PHOTOS_BUCKET).remove(uploadedPaths);
    return { error: insertError };
  }

  return { error: null };
}

/**
 * Uploads (or replaces) an event's cover photo. The file is stored in the
 * same shared bucket, under a dedicated "cover" sub-folder for that event,
 * and the event row's `cover_image_path` is updated to point to it. The
 * previous cover file (if any) is removed afterwards.
 */
export async function uploadEventCoverImage({
  eventId,
  file,
  previousPath,
}: {
  eventId: string;
  file: File;
  previousPath?: string | null;
}) {
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "";
  const storagePath = `${eventId}/cover/${crypto.randomUUID()}${extension ? `.${extension}` : ""}`;

  const { error: uploadError } = await supabase.storage
    .from("event-photos")
    .upload(storagePath, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return { error: uploadError };
  }

  const { error: updateError } = await supabase
    .from("events")
    .update({ cover_image_path: storagePath })
    .eq("id", eventId);

  if (updateError) {
    await supabase.storage.from("event-photos").remove([storagePath]);
    return { error: updateError };
  }

  if (previousPath) {
    await supabase.storage.from("event-photos").remove([previousPath]);
  }

  return { error: null, path: storagePath };
}

/**
 * Removes every stored object under an event's folder (photos + cover image).
 * Best-effort: storage isn't covered by the DB's ON DELETE CASCADE, so this
 * must be called explicitly before/after deleting the event row.
 */
/**
 * Chemins de stockage de toutes les photos envoyées par un utilisateur.
 * À lire tant que les lignes `photos` existent : les chemins n'existent nulle
 * part ailleurs.
 */
export async function listUserPhotoPaths(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from("photos")
    .select("storage_original_path, storage_display_path, storage_thumbnail_path")
    .eq("user_id", userId);

  const rows = (data ?? []) as Array<{
    storage_original_path: string | null;
    storage_display_path: string | null;
    storage_thumbnail_path: string | null;
  }>;

  return Array.from(
    new Set(
      rows.flatMap((row) => [
        row.storage_original_path,
        row.storage_display_path,
        row.storage_thumbnail_path,
      ]),
    ),
  ).filter((path): path is string => Boolean(path));
}

/** Retrait best-effort d'un lot d'objets du bucket photos. */
export async function removeStoragePaths(paths: string[]) {
  if (paths.length > 0) {
    await supabase.storage.from(PHOTOS_BUCKET).remove(paths);
  }
}

/**
 * Removes every stored file uploaded by a given user, across all events.
 * Best-effort, and it must run *before* the matching `photos` rows disappear,
 * since the storage paths only live on those rows.
 */
export async function deleteUserPhotoFiles(userId: string) {
  await removeStoragePaths(await listUserPhotoPaths(userId));
}

/**
 * Removes every stored object under an event's folder (photos + cover image).
 * Best-effort: storage isn't covered by the DB's ON DELETE CASCADE, so this
 * must be called explicitly before/after deleting the event row.
 */
export async function deleteEventStorageFolder(eventId: string) {
  const { data: rootFiles } = await supabase.storage.from("event-photos").list(eventId);
  const { data: coverFiles } = await supabase.storage.from("event-photos").list(`${eventId}/cover`);

  const paths = [
    ...(rootFiles ?? [])
      .filter((entry) => entry.name !== "cover")
      .map((entry) => `${eventId}/${entry.name}`),
    ...(coverFiles ?? []).map((entry) => `${eventId}/cover/${entry.name}`),
  ];

  if (paths.length > 0) {
    await supabase.storage.from("event-photos").remove(paths);
  }
}
