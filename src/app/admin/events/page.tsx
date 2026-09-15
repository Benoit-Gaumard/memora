import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getPrivatePhotoUrl } from "@/lib/private-photo";
import { CreateEventForm } from "@/components/admin/create-event-form";
import { EventsTable, type AdminEventRow } from "@/components/admin/events-table";

export default async function AdminEventsPage() {
  const supabase = await getSupabaseServerClient();

  const { data: events } = await supabase
    .from("events")
    .select("id, name, event_type, event_date, end_date, status, cover_image_path, event_members(count), photos(count)")
    .order("created_at", { ascending: false });

  const rows: AdminEventRow[] = (events ?? []).map((event) => ({
    id: event.id,
    name: event.name,
    event_type: event.event_type,
    event_date: event.event_date,
    end_date: event.end_date ?? null,
    status: event.status,
    memberCount: Array.isArray(event.event_members) ? (event.event_members[0]?.count ?? 0) : 0,
    photoCount: Array.isArray(event.photos) ? (event.photos[0]?.count ?? 0) : 0,
    coverUrl: event.cover_image_path ? getPrivatePhotoUrl(event.cover_image_path) : null,
  }));

  return (
    <>
      <CreateEventForm />
      <EventsTable rows={rows} />
    </>
  );
}
