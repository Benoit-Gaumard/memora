import { supabase } from "@/lib/supabase";

export const PHOTOS_BUCKET = "event-photos";

async function computeChecksum(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function readImageSize(file: File): Promise<{ width: number; height: number } | null> {
  if (!file.type.startsWith("image/")) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    image.src = url;
  });
}

/**
 * Uploads a photo file to the shared "event-photos" storage bucket (under a
 * per-event folder) and records its metadata in the `photos` table. Both
 * steps are enforced server-side by RLS: the caller must be an active member
 * of the event.
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
  const storedFilename = `${crypto.randomUUID()}${extension ? `.${extension}` : ""}`;
  const storagePath = `${eventId}/${storedFilename}`;

  const [checksum, dimensions] = await Promise.all([
    computeChecksum(file),
    readImageSize(file),
  ]);

  const { error: uploadError } = await supabase.storage
    .from("event-photos")
    .upload(storagePath, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return { error: uploadError };
  }

  const { error: insertError } = await supabase.from("photos").insert({
    event_id: eventId,
    user_id: userId,
    original_filename: file.name,
    stored_filename: storedFilename,
    storage_original_path: storagePath,
    storage_display_path: storagePath,
    storage_thumbnail_path: storagePath,
    mime_type: file.type || "application/octet-stream",
    file_size: file.size,
    width: dimensions?.width ?? null,
    height: dimensions?.height ?? null,
    checksum,
    status: "ready",
  });

  if (insertError) {
    // Best-effort cleanup so we don't leave an orphaned file behind.
    await supabase.storage.from("event-photos").remove([storagePath]);
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
 * Removes every stored file uploaded by a given user, across all events.
 * Best-effort, and it must run *before* the matching `photos` rows disappear,
 * since the storage paths only live on those rows.
 */
export async function deleteUserPhotoFiles(userId: string) {
  const { data } = await supabase
    .from("photos")
    .select("storage_original_path, storage_display_path, storage_thumbnail_path")
    .eq("user_id", userId);

  const rows = (data ?? []) as Array<{
    storage_original_path: string | null;
    storage_display_path: string | null;
    storage_thumbnail_path: string | null;
  }>;

  const paths = Array.from(
    new Set(
      rows.flatMap((row) => [
        row.storage_original_path,
        row.storage_display_path,
        row.storage_thumbnail_path,
      ]),
    ),
  ).filter((path): path is string => Boolean(path));

  if (paths.length > 0) {
    await supabase.storage.from(PHOTOS_BUCKET).remove(paths);
  }
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
