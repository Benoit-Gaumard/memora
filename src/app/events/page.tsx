import { AppShell } from "@/components/layout/app-shell";
import { EventCard } from "@/components/dashboard/event-card";
import { countPhotosForEvent, demoUser, getMemberEvents } from "@/lib/mock-data";

export default function EventsPage() {
  const events = getMemberEvents(demoUser.id);

  return (
    <AppShell>
      <div className="mb-6">
        <div className="text-xs uppercase tracking-[0.2em] text-[#8d6c5d]">Mes événements</div>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-[#201c1a]">Toutes mes galeries</h1>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} memberCount={2} photoCount={countPhotosForEvent(event.id)} />
        ))}
      </div>
    </AppShell>
  );
}
