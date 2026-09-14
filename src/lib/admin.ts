import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/profile";
import type { Profile } from "@/types/database";

/**
 * Guards a Server Component so only signed-in super_admins can render it.
 * Anyone else is redirected: unauthenticated users to /login, regular
 * members to the homepage.
 */
export async function requireSuperAdmin(): Promise<Profile> {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.global_role !== "super_admin") {
    redirect("/");
  }

  return profile;
}
