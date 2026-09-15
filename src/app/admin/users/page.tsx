import { getSupabaseServerClient } from "@/lib/supabase-server";
import { UsersTable, type AdminUserRow } from "@/components/admin/users-table";

export default async function AdminUsersPage() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const { data: users } = await supabase
    .from("profiles")
    .select("id, display_name, username, email, global_role, account_status, created_at")
    .order("created_at", { ascending: false });

  return <UsersTable rows={(users ?? []) as AdminUserRow[]} currentUserId={currentUser?.id ?? null} />;
}
