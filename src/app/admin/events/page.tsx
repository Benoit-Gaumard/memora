import { AppShell } from "@/components/layout/app-shell";
import { demoEvents } from "@/lib/mock-data";

export default function AdminEventsPage() {
  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-[#8d6c5d]">Admin</div>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-[#201c1a]">Événements</h1>
        </div>
        <button className="rounded-full bg-[#f4b178] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#e6995b]">
          + Créer un événement
        </button>
      </div>

      <div className="overflow-hidden rounded-[32px] border border-[#f0d9bf] bg-white shadow-sm">
        <table className="min-w-full text-left text-sm text-[#4d4039]">
          <thead className="bg-[#fff5ed] text-[#786860]">
            <tr>
              {['Nom', 'Type', 'Date', 'Statut', 'Participants', 'Photos'].map((header) => (
                <th key={header} className="px-4 py-3 font-semibold">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {demoEvents.map((event) => (
              <tr key={event.id} className="border-t border-[#f4e5d3]">
                <td className="px-4 py-4 font-semibold text-[#221d1a]">{event.name}</td>
                <td className="px-4 py-4">{event.event_type}</td>
                <td className="px-4 py-4">{new Date(event.event_date).toLocaleDateString("fr-FR")}</td>
                <td className="px-4 py-4">{event.status}</td>
                <td className="px-4 py-4">12</td>
                <td className="px-4 py-4">345</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
