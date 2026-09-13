import Link from "next/link";
import { Camera, Download, ImageIcon, Upload } from "lucide-react";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PhotoGrid } from "@/components/gallery/photo-grid";
import { getEventBySlug, getEventPhotos } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const photos = getEventPhotos(event.id);

  return (
    <AppShell>
      <section className="mb-6 overflow-hidden rounded-[32px] border border-[#f0d9bf] bg-white shadow-sm">
        <div className="h-52 bg-[radial-gradient(circle_at_top,_rgba(244,177,120,0.7),_rgba(255,250,243,0.9)_55%,_rgba(255,250,243,1))] p-6 md:h-72">
          <div className="flex h-full flex-col justify-between">
            <div className="flex items-center justify-between gap-3">
              <div className="rounded-full bg-[#fff9f2] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7d6052]">
                {event.event_type}
              </div>
              <div className="rounded-full bg-[#fff9f2] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7d6052]">
                {event.status}
              </div>
            </div>

            <div className="max-w-xl rounded-3xl bg-[#1f1b18]/65 p-4 text-white backdrop-blur-sm">
              <div className="text-xs uppercase tracking-[0.2em] text-[#f3d3b0]">Événement</div>
              <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">{event.name}</h1>
              <p className="mt-2 text-sm text-[#f4e9df]">{event.description}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-sm text-[#5f514b]">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#fff4e9] px-3 py-1.5">
              <Camera className="h-4 w-4 text-[#d57f45]" />
              {formatDate(event.event_date)}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#fff4e9] px-3 py-1.5">
              <ImageIcon className="h-4 w-4 text-[#d57f45]" />
              {photos.length} photos
            </span>
          </div>

          <div className="flex gap-2">
            <button className="inline-flex items-center gap-2 rounded-full bg-[#f4b178] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#e6995b]">
              <Upload className="h-4 w-4" />
              Ajouter des photos
            </button>
            <button className="inline-flex items-center gap-2 rounded-full border border-[#efceaa] bg-white px-4 py-2 text-sm font-semibold text-[#433a35] transition hover:bg-[#fff5ec]">
              <Download className="h-4 w-4" />
              Télécharger
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-[0.2em] text-[#8d6c5d]">Galerie</div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#fff5ed] px-3 py-1.5 text-sm text-[#5b483e]">
            12 nouvelles photos
          </div>
        </div>

        <PhotoGrid eventSlug={event.slug} photos={photos} />

        <div className="text-sm text-[#655a54]">
          Retour à la liste des <Link href="/events" className="font-semibold text-[#c47242]">événements</Link>.
        </div>
      </section>
    </AppShell>
  );
}
