import Link from "next/link";
import { CalendarDays, Users } from "lucide-react";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { JoinInviteCard } from "@/components/qr/join-invite-card";
import { JoinActionButton } from "@/components/qr/join-action-button";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getSiteUrl } from "@/lib/site-url";
import { formatDate } from "@/lib/utils";

interface InviteDetails {
  invite_id: string;
  event_id: string;
  event_name: string;
  event_slug: string;
  event_description: string;
  event_date: string;
  cover_image_path: string | null;
  is_active: boolean;
  expires_at: string | null;
  max_uses: number | null;
  current_uses: number;
}

export default async function JoinCodePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const supabase = await getSupabaseServerClient();

  const { data: invite } = await supabase
    .rpc("get_invite_details", { p_code: code })
    .maybeSingle<InviteDetails>();

  if (!invite || !invite.is_active) {
    notFound();
  }

  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const siteUrl = await getSiteUrl();
  const link = `${siteUrl}/join/${code}`;

  return (
    <AppShell>
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[32px] border border-[#f0d9bf] bg-white p-6 shadow-sm md:p-8">
          <div className="text-xs uppercase tracking-[0.2em] text-[#8d6c5d]">Invitation valide</div>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-[#211d1b]">{invite.event_name}</h1>
          <p className="mt-3 text-base leading-7 text-[#5f514b]">{invite.event_description}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#fff6ee] p-4 text-sm text-[#4a3c35]">
              <div className="flex items-center gap-2 text-[#8a5d38]">
                <CalendarDays className="h-4 w-4" />
                Date
              </div>
              <div className="mt-2 font-semibold">{formatDate(invite.event_date)}</div>
            </div>
            <div className="rounded-2xl bg-[#fff6ee] p-4 text-sm text-[#4a3c35]">
              <div className="flex items-center gap-2 text-[#8a5d38]">
                <Users className="h-4 w-4" />
                Invités
              </div>
              <div className="mt-2 font-semibold">
                {invite.current_uses}
                {invite.max_uses ? `/${invite.max_uses}` : ""} inscrit(s)
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <JoinActionButton code={code} isLoggedIn={Boolean(user)} eventSlug={invite.event_slug} />
            <Link
              href="/events"
              className="rounded-full border border-[#efceaa] bg-white px-5 py-3 text-sm font-semibold text-[#433a35] transition hover:bg-[#fff5ec]"
            >
              Voir mes événements
            </Link>
          </div>
        </div>

        <JoinInviteCard code={code} link={link} />
      </div>
    </AppShell>
  );
}
