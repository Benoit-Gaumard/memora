import { formatDate } from "@/lib/utils";

const EVENT_TIME_ZONE = "Europe/Paris";

type ClosableEvent = {
  status: string;
  end_date?: string | null;
};

/** Jour courant à Paris, au format YYYY-MM-DD, comparable tel quel à `end_date`. */
export function todayInEventTimeZone() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: EVENT_TIME_ZONE }).format(new Date());
}

/**
 * Un album est clôturé soit parce que l'organisateur l'a décidé, soit parce
 * que sa date de fin est passée. La clôture par date n'est jamais écrite en
 * base : elle se recalcule à chaque affichage, comme la policy `is_event_open`
 * le fait côté serveur.
 */
export function isEventClosed(event: ClosableEvent) {
  if (event.status === "CLOSED") return true;
  if (!event.end_date) return false;

  return event.end_date < todayInEventTimeZone();
}

/** « 12 juin 2026 » ou « du 12 au 14 juin 2026 » selon qu'il y a une fin. */
export function formatEventPeriod(startDate: string, endDate?: string | null) {
  if (!endDate) return formatDate(startDate);

  const start = new Date(startDate);
  const end = new Date(`${endDate}T12:00:00`);

  if (start.toDateString() === end.toDateString()) return formatDate(start);

  return `du ${formatDate(start, { day: "2-digit", month: "long" })} au ${formatDate(end)}`;
}
