import Image from "next/image";
import Link from "next/link";
import { Download, ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { DeletePhotoButton } from "@/components/photos/delete-photo-button";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { formatDate } from "@/lib/utils";

export default async function PhotoFullScreenPage({
  params,
}: {
  params: Promise<{ slug: string; photoId: string }>;
}) {
  const { slug, photoId } = await params;
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: event } = await supabase.from("events").select("id, slug").eq("slug", slug).maybeSingle();

  if (!event) {
    notFound();
  }

  const { data: photo } = await supabase
    .from("photos")
    .select("*, profiles(display_name)")
    .eq("id", photoId)
    .eq("event_id", event.id)
    .maybeSingle();

  if (!photo) {
    notFound();
  }

  const { data: signed } = await supabase.storage
    .from("event-photos")
    .createSignedUrl(photo.storage_display_path, 3600);

  const author = Array.isArray(photo.profiles) ? photo.profiles[0]?.display_name : photo.profiles?.display_name;

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[1.5fr_0.7fr]">
        <div className="overflow-hidden rounded-[32px] border border-[#f0d9bf] bg-[#fffaf5] shadow-sm">
          <div className="flex items-center justify-between border-b border-[#f3e3d3] px-4 py-3">
            <Link href={`/events/${slug}`} className="inline-flex items-center gap-2 text-sm font-medium text-[#51453f]">
              <ArrowLeft className="h-4 w-4" />
              Retour à la galerie
            </Link>
            <div className="flex gap-2">
              {signed?.signedUrl ? (
                <a
                  href={signed.signedUrl}
                  download={photo.original_filename}
                  className="inline-flex items-center gap-2 rounded-full bg-[#f4b178] px-3 py-2 text-xs font-semibold text-white"
                >
                  <Download className="h-3.5 w-3.5" />
                  Télécharger
                </a>
              ) : null}
              <DeletePhotoButton
                photoId={photo.id}
                storagePath={photo.storage_original_path}
                eventSlug={slug}
              />
            </div>
          </div>

          {signed?.signedUrl ? (
            <Image
              src={signed.signedUrl}
              alt={photo.original_filename}
              width={1200}
              height={1200}
              unoptimized
              className="w-full object-cover"
            />
          ) : null}
        </div>

        <aside className="rounded-[32px] border border-[#f0d9bf] bg-white p-5 shadow-sm">
          <div className="text-xs uppercase tracking-[0.2em] text-[#8d6c5d]">Photo</div>
          <h1 className="mt-3 text-2xl font-black text-[#231d1a]">{photo.original_filename}</h1>

          <div className="mt-5 space-y-3 text-sm text-[#4f4340]">
            <div className="rounded-2xl bg-[#fff5ed] p-3">
              <span className="font-semibold text-[#7d5e45]">Auteur :</span> {author ?? "Membre"}
            </div>
            <div className="rounded-2xl bg-[#fff5ed] p-3">
              <span className="font-semibold text-[#7d5e45]">Date :</span>{" "}
              {formatDate(photo.captured_at ?? photo.uploaded_at ?? photo.created_at)}
            </div>
            <div className="rounded-2xl bg-[#fff5ed] p-3">
              <span className="font-semibold text-[#7d5e45]">Format :</span> {photo.mime_type}
            </div>
            <div className="rounded-2xl bg-[#fff5ed] p-3">
              <span className="font-semibold text-[#7d5e45]">Taille :</span>{" "}
              {(photo.file_size / 1000000).toFixed(1)} Mo
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
