import { getSupabaseServerClient } from "@/lib/supabase-server";
import { formatShortDate } from "@/lib/utils";
import { UserStatusToggle } from "@/components/admin/user-status-toggle";

export default async function AdminUsersPage() {
  const supabase = await getSupabaseServerClient();

  const { data: users } = await supabase
    .from("profiles")
    .select("id, display_name, username, email, global_role, account_status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="overflow-hidden paper p-0">
      <table className="min-w-full text-left text-sm text-ink-soft">
        <thead className="bg-paper text-ink-soft">
          <tr>
            {["Nom", "Nom d’utilisateur", "Adresse e-mail", "Inscrit le", "Statut", ""].map((header) => (
              <th key={header} className="px-4 py-3 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users?.length ? (
            users.map((user) => (
              <tr key={user.id} className="border-t border-ink/15">
                <td className="px-4 py-4 font-semibold text-ink">
                  {user.display_name}
                  {user.global_role === "super_admin" ? (
                    <span className="chip ml-2">Admin</span>
                  ) : null}
                </td>
                <td className="px-4 py-4">{user.username}</td>
                <td className="px-4 py-4">{user.email}</td>
                <td className="px-4 py-4">{formatShortDate(user.created_at)}</td>
                <td className="px-4 py-4">
                  {user.account_status === "blocked" ? (
                    <span className="chip bg-mandarine">Bloqué</span>
                  ) : (
                    <span className="chip bg-turquoise">Actif</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  {user.global_role === "super_admin" ? null : (
                    <UserStatusToggle userId={user.id} status={user.account_status} />
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-ink-faint">
                Aucun utilisateur inscrit pour le moment.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
