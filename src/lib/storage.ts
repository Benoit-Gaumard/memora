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
