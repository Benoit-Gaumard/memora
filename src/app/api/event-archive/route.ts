import { Zip, ZipPassThrough } from "fflate";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const BUCKET = "event-photos";

export const dynamic = "force-dynamic";

/** Nettoie un nom de fichier pour qu'il reste valide une fois dézippé. */
function safeFilename(name: string) {
  return name.replace(/[\\/:*?"<>|]/g, "_").slice(-120) || "photo.jpg";
}

/**
 * Renvoie toutes les photos d'un album dans une archive ZIP.
 *
 * L'archive est construite à la volée : chaque photo est téléchargée depuis le
 * stockage puis poussée dans le flux, sans jamais garder l'album entier en
 * mémoire. Les fichiers sont stockés sans compression, puisque des JPEG ne se
 * compressent plus.
 */
export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug");

  if (!slug) {
    return new Response("Missing event slug", { status: 400 });
  }

  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Authentication required", { status: 401 });
  }

  const { data: event } = await supabase
    .from("events")
    .select("id, slug, download_enabled")
    .eq("slug", slug)
    .maybeSingle();

  if (!event) {
    return new Response("Album not found", { status: 404 });
  }

  const { data: membership } = await supabase
    .from("event_members")
    .select("id")
    .eq("event_id", event.id)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!membership) {
    return new Response("Album not found", { status: 404 });
  }

  if (!event.download_enabled) {
    return new Response("Downloads are disabled for this album", { status: 403 });
  }

  const { data: photos } = await supabase
    .from("photos")
    .select("original_filename, storage_original_path, uploaded_at")
    .eq("event_id", event.id)
    .is("deleted_at", null)
    .order("uploaded_at", { ascending: true });

  const rows = (photos ?? []) as Array<{
    original_filename: string | null;
    storage_original_path: string | null;
  }>;

  if (rows.length === 0) {
    return new Response("This album has no photo yet", { status: 404 });
  }

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const zip = new Zip((error, chunk, final) => {
        if (error) {
          controller.error(error);
          return;
        }
        controller.enqueue(chunk);
        if (final) {
          controller.close();
        }
      });

      async function fill() {
        for (const [index, row] of rows.entries()) {
          if (!row.storage_original_path) continue;

          const { data } = await supabase.storage
            .from(BUCKET)
            .download(row.storage_original_path);

          if (!data) continue;

          const entry = new ZipPassThrough(
            `${String(index + 1).padStart(3, "0")}-${safeFilename(
              row.original_filename ?? "photo.jpg",
            )}`,
          );
          zip.add(entry);
          entry.push(new Uint8Array(await data.arrayBuffer()), true);
        }

        zip.end();
      }

      fill().catch((error) => controller.error(error));
    },
  });

  const archiveName = safeFilename(`${event.slug || "album"}.zip`);

  return new Response(stream, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename="${archiveName}"`,
      "Content-Type": "application/zip",
      Vary: "Cookie",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
