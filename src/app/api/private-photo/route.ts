import { getSupabaseServerClient } from "@/lib/supabase-server";

const BUCKET = "event-photos";

export const dynamic = "force-dynamic";

/**
 * Un objet du bucket n'est jamais réécrit : son nom contient un UUID tiré au
 * dépôt, et une modification produit un nouveau chemin. Le chemin est donc à
 * lui seul un validateur fort, ce qui permet de répondre 304 sans même aller
 * chercher le fichier.
 */
function etagFor(storagePath: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < storagePath.length; index += 1) {
    hash ^= storagePath.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `"${(hash >>> 0).toString(36)}-${storagePath.length.toString(36)}"`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const storagePath = url.searchParams.get("path");

  if (!storagePath || storagePath.startsWith("/") || storagePath.includes("..")) {
    return new Response("Invalid photo path", { status: 400 });
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Authentication required", { status: 401 });
  }

  const etag = etagFor(storagePath);

  // `private` garde la photo hors des caches partagés : seul le navigateur de
  // l'invité la conserve. Sans cela, chaque défilement de la galerie et chaque
  // retour en arrière retéléchargeait l'intégralité des fichiers.
  const cacheHeaders = {
    "Cache-Control": "private, max-age=31536000, immutable",
    ETag: etag,
    Vary: "Cookie",
    "X-Content-Type-Options": "nosniff",
  };

  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers: cacheHeaders });
  }

  const { data, error } = await supabase.storage.from(BUCKET).download(storagePath);

  if (error || !data) {
    return new Response("Photo not found", { status: 404 });
  }

  return new Response(data, {
    headers: {
      ...cacheHeaders,
      "Content-Disposition": "inline",
      "Content-Type": data.type || "application/octet-stream",
    },
  });
}
