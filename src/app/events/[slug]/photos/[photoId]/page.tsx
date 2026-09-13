import Image from "next/image";
import Link from "next/link";
import { Download, ArrowLeft, Trash2 } from "lucide-react";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getEventBySlug, getPhotoById } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

export default async function PhotoFullScreenPage({
  params,
}: {
  params: Promise<{ slug: string; photoId: string }>;
}) {
  const { slug, photoId } = await params;
  const event = getEventBySlug(slug);
  const photo = getPhotoById(photoId);

  if (!event || !photo) {
    notFound();
  }

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
              <button className="inline-flex items-center gap-2 rounded-full bg-[#f4b178] px-3 py-2 text-xs font-semibold text-white">
                <Download className="h-3.5 w-3.5" />
                Télécharger
              </button>
              <button className="inline-flex items-center gap-2 rounded-full border border-[#efceaa] bg-white px-3 py-2 text-xs font-semibold text-[#433a35]">
                <Trash2 className="h-3.5 w-3.5" />
                Supprimer
              </button>
            </div>
          </div>

          <Image
            src="https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80"
            alt={photo.original_filename}
            width={1200}
            height={1200}
            unoptimized
            className="w-full object-cover"
          />
        </div>

        <aside className="rounded-[32px] border border-[#f0d9bf] bg-white p-5 shadow-sm">
          <div className="text-xs uppercase tracking-[0.2em] text-[#8d6c5d]">Photo</div>
          <h1 className="mt-3 text-2xl font-black text-[#231d1a]">{photo.original_filename}</h1>

          <div className="mt-5 space-y-3 text-sm text-[#4f4340]">
            <div className="rounded-2xl bg-[#fff5ed] p-3">
              <span className="font-semibold text-[#7d5e45]">Auteur :</span> Paul Martin
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
