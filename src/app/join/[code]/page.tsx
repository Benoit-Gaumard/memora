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
        <div className="paper p-6 md:p-8">
          <h1 className="display text-[clamp(2.2rem,5vw,3.4rem)]">{invite.event_name}</h1>
          <p className="mt-3 text-base leading-7 text-ink-soft">{invite.event_description}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="text-base text-ink-soft">
              <div className="flex items-center gap-2 font-display font-bold text-ink">
                <CalendarDays className="h-4 w-4 text-fuchsia" />
                Date
              </div>
              <div className="mt-1">{formatDate(invite.event_date)}</div>
            </div>
            <div className="text-base text-ink-soft">
              <div className="flex items-center gap-2 font-display font-bold text-ink">
                <Users className="h-4 w-4 text-turquoise" />
                Invités
              </div>
              <div className="mt-1">
                {invite.current_uses}
                {invite.max_uses ? `/${invite.max_uses}` : ""} inscrit(s)
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <JoinActionButton code={code} isLoggedIn={Boolean(user)} eventSlug={invite.event_slug} />
            <Link
              href="/events"
              className="btn btn-ghost"
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
