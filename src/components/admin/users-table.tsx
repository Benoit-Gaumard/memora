"use client";

import { formatShortDate } from "@/lib/utils";
import { UserStatusToggle } from "@/components/admin/user-status-toggle";
import { DeleteUserButton } from "@/components/admin/delete-user-button";
import {
  PlainHeader,
  SortableHeader,
  useSortedRows,
  type SortValue,
} from "@/components/admin/sortable-table";
import type { AccountStatus } from "@/types/database";

export interface AdminUserRow {
  id: string;
  display_name: string;
  username: string;
  email: string;
  global_role: string;
  account_status: AccountStatus;
  created_at: string;
}

const SORT_ACCESSORS = {
  name: (row: AdminUserRow) => row.display_name,
  username: (row: AdminUserRow) => row.username,
  email: (row: AdminUserRow) => row.email,
  created: (row: AdminUserRow) => row.created_at,
  status: (row: AdminUserRow) => (row.account_status === "blocked" ? "Bloqué" : "Actif"),
} satisfies Record<string, (row: AdminUserRow) => SortValue>;

export function UsersTable({
  rows,
  currentUserId,
}: {
  rows: AdminUserRow[];
  currentUserId: string | null;
}) {
  const { sorted, sort, toggleSort } = useSortedRows({
    rows,
    accessors: SORT_ACCESSORS,
    initialKey: "created",
    initialDirection: "desc",
  });

  return (
    <div className="overflow-x-auto paper p-0">
      <table className="min-w-full text-left text-sm text-ink-soft">
        <thead className="bg-paper text-ink-soft">
          <tr>
            <SortableHeader label="Nom" sortKey="name" sort={sort} onSort={toggleSort} />
            <SortableHeader
              label="Nom d’utilisateur"
              sortKey="username"
              sort={sort}
              onSort={toggleSort}
            />
            <SortableHeader label="Adresse e-mail" sortKey="email" sort={sort} onSort={toggleSort} />
            <SortableHeader label="Inscrit le" sortKey="created" sort={sort} onSort={toggleSort} />
            <SortableHeader label="Statut" sortKey="status" sort={sort} onSort={toggleSort} />
            <PlainHeader srLabel="Actions" />
          </tr>
        </thead>
        <tbody>
          {sorted.length ? (
            sorted.map((user) => (
              <tr key={user.id} className="border-t border-ink/15">
                <td className="px-4 py-4 font-semibold text-ink">
                  {user.display_name}
                  {user.global_role === "super_admin" ? <span className="chip ml-2">Admin</span> : null}
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
                  {user.global_role === "super_admin" || user.id === currentUserId ? null : (
                    <div className="flex flex-wrap items-center gap-2">
                      <UserStatusToggle userId={user.id} status={user.account_status} />
                      <DeleteUserButton
                        userId={user.id}
                        displayName={user.display_name}
                        username={user.username}
                      />
                    </div>
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
