import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { demoEvents } from "@/lib/mock-data";

export default async function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = demoEvents.find((item) => item.id === id);

  if (!event) {
    notFound();
  }

  return (
    <AppShell>
      <div className="rounded-[32px] border border-[#f0d9bf] bg-white p-6 shadow-sm md:p-8">
        <div className="text-xs uppercase tracking-[0.2em] text-[#8d6c5d]">Événement</div>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-[#201c1a]">{event.name}</h1>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ["Type", event.event_type],
            ["Date", new Date(event.event_date).toLocaleDateString("fr-FR")],
            ["Statut", event.status],
            ["Photos maximum par envoi", String(event.max_files_per_upload)],
            ["Téléchargement", event.download_enabled ? "Oui" : "Non"],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-2xl bg-[#fff5ed] p-4">
              <div className="text-sm text-[#7d675d]">{label}</div>
              <div className="mt-2 text-lg font-bold text-[#241e1a]">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
