import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { CreateEventForm } from "@/components/admin/create-event-form";
import { DeleteEventButton } from "@/components/admin/delete-event-button";

export default async function AdminEventsPage() {
  const supabase = await getSupabaseServerClient();

  const { data: events } = await supabase
    .from("events")
    .select("id, name, event_type, event_date, status, cover_image_path, event_members(count), photos(count)")
    .order("created_at", { ascending: false });

  const coverUrls = new Map<string, string>();
  for (const event of events ?? []) {
    if (!event.cover_image_path) continue;
    const { data: signed } = await supabase.storage
      .from("event-photos")
      .createSignedUrl(event.cover_image_path, 3600);
    if (signed?.signedUrl) coverUrls.set(event.id, signed.signedUrl);
  }

  return (
    <>
      <CreateEventForm />

      <div className="overflow-hidden rounded-[32px] border border-[#f0d9bf] bg-white shadow-sm">
        <table className="min-w-full text-left text-sm text-[#4d4039]">
          <thead className="bg-[#fff5ed] text-[#786860]">
            <tr>
              {["", "Nom", "Type", "Date", "Statut", "Membres", "Photos", ""].map((header) => (
                <th key={header} className="px-4 py-3 font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {events?.length ? (
              events.map((event) => {
                const memberCount = Array.isArray(event.event_members)
                  ? (event.event_members[0]?.count ?? 0)
                  : 0;
                const photoCount = Array.isArray(event.photos) ? (event.photos[0]?.count ?? 0) : 0;
                const coverUrl = coverUrls.get(event.id);

                return (
                  <tr key={event.id} className="border-t border-[#f4e5d3]">
                    <td className="px-4 py-4">
                      <div className="h-12 w-16 overflow-hidden rounded-xl border border-[#eed8bd] bg-[#fff5ed]">
                        {coverUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={coverUrl} alt="" className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-4 font-semibold text-[#221d1a]">
                      <Link href={`/admin/events/${event.id}`} className="hover:underline">
                        {event.name}
                      </Link>
                    </td>
                    <td className="px-4 py-4">{event.event_type}</td>
                    <td className="px-4 py-4">{new Date(event.event_date).toLocaleDateString("fr-FR")}</td>
                    <td className="px-4 py-4">{event.status}</td>
                    <td className="px-4 py-4">{memberCount}</td>
                    <td className="px-4 py-4">{photoCount}</td>
                    <td className="px-4 py-4">
                      <DeleteEventButton eventId={event.id} eventName={event.name} />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-[#8a7268]">
                  Aucun événement créé pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
