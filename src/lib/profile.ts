import { getSupabaseServerClient } from "@/lib/supabase-server";
import type { Profile } from "@/types/database";

/**
 * Reads the currently authenticated user's profile row from Supabase.
 * Returns null when there is no session, no configured Supabase project,
 * or the profile row does not exist yet.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profile) {
    return profile as Profile;
  }

  // Fallback: the profile row hasn't been created yet (e.g. trigger not
  // applied). Surface what we know from the auth user so the page still works.
  return {
    id: user.id,
    username: (user.user_metadata?.username as string) ?? user.email?.split("@")[0] ?? "membre",
    display_name:
      (user.user_metadata?.display_name as string) ?? user.email?.split("@")[0] ?? "Membre Memora",
    email: user.email ?? null,
    global_role: "user",
    account_status: "active",
    created_at: user.created_at,
    updated_at: user.updated_at ?? user.created_at,
  };
}
