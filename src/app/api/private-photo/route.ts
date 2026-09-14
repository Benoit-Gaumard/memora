import { getSupabaseServerClient } from "@/lib/supabase-server";

const BUCKET = "event-photos";

export const dynamic = "force-dynamic";

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

  const { data, error } = await supabase.storage.from(BUCKET).download(storagePath);

  if (error || !data) {
    return new Response("Photo not found", { status: 404 });
  }

  return new Response(data, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": "inline",
      "Content-Type": data.type || "application/octet-stream",
      Vary: "Cookie",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
