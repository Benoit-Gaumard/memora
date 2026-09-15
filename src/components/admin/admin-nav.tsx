"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/events", label: "Événements" },
  { href: "/admin/users", label: "Utilisateurs" },
  { href: "/admin/photos", label: "Photos" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const isActive = tab.href === "/admin" ? pathname === "/admin" : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "rounded-full border-2 border-ink px-4 py-2 font-display text-sm font-bold transition",
              isActive
                ? "bg-fuchsia text-ink shadow-[0_3px_0_var(--ink)]"
                : "bg-white text-ink hover:bg-citron",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
