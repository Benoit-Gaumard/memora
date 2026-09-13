import Link from "next/link";
import { ArrowRight, CalendarDays, Users } from "lucide-react";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { JoinInviteCard } from "@/components/qr/join-invite-card";
import { demoEvents, getInvitationByCode } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

export default async function JoinCodePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const invite = getInvitationByCode(code);

  if (!invite) {
    notFound();
  }

  const event = demoEvents.find((item) => item.id === invite.event_id);

  if (!event) {
    notFound();
  }

  const link = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/join/${invite.code}`;

  return (
    <AppShell>
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[32px] border border-[#f0d9bf] bg-white p-6 shadow-sm md:p-8">
          <div className="text-xs uppercase tracking-[0.2em] text-[#8d6c5d]">Invitation valide</div>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-[#211d1b]">{event.name}</h1>
          <p className="mt-3 text-base leading-7 text-[#5f514b]">{event.description}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#fff6ee] p-4 text-sm text-[#4a3c35]">
              <div className="flex items-center gap-2 text-[#8a5d38]">
                <CalendarDays className="h-4 w-4" />
                Date
              </div>
              <div className="mt-2 font-semibold">{formatDate(event.event_date)}</div>
            </div>
            <div className="rounded-2xl bg-[#fff6ee] p-4 text-sm text-[#4a3c35]">
              <div className="flex items-center gap-2 text-[#8a5d38]">
                <Users className="h-4 w-4" />
                Membre
              </div>
              <div className="mt-2 font-semibold">{invite.current_uses}/{invite.max_uses ?? "∞"} utilisations</div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full bg-[#f4b178] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#e6995b]"
            >
              Connexion / création de compte
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/events"
              className="rounded-full border border-[#efceaa] bg-white px-5 py-3 text-sm font-semibold text-[#433a35] transition hover:bg-[#fff5ec]"
            >
              Voir mes événements
            </Link>
          </div>
        </div>

        <JoinInviteCard code={invite.code} link={link} />
      </div>
    </AppShell>
  );
}
