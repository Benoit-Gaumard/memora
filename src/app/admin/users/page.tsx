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
    <div className="overflow-hidden rounded-[32px] border border-[#f0d9bf] bg-white shadow-sm">
      <table className="min-w-full text-left text-sm text-[#4d4039]">
        <thead className="bg-[#fff5ed] text-[#786860]">
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
              <tr key={user.id} className="border-t border-[#f4e5d3]">
                <td className="px-4 py-4 font-semibold text-[#221d1a]">
                  {user.display_name}
                  {user.global_role === "super_admin" ? (
                    <span className="ml-2 rounded-full bg-[#fff0de] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#a2662d]">
                      Admin
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-4">{user.username}</td>
                <td className="px-4 py-4">{user.email}</td>
                <td className="px-4 py-4">{formatShortDate(user.created_at)}</td>
                <td className="px-4 py-4">
                  {user.account_status === "blocked" ? (
                    <span className="rounded-full bg-[#fdeceb] px-2 py-1 text-xs font-semibold text-[#b3392e]">
                      Bloqué
                    </span>
                  ) : (
                    <span className="rounded-full bg-[#edf9ee] px-2 py-1 text-xs font-semibold text-[#2c6c3f]">
                      Actif
                    </span>
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
              <td colSpan={6} className="px-4 py-6 text-center text-[#8a7268]">
                Aucun utilisateur inscrit pour le moment.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
