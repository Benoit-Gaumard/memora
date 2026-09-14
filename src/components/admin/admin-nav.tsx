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
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              isActive
                ? "bg-[#f4b178] text-white"
                : "border border-[#f0d9bf] bg-white text-[#5c4f46] hover:bg-[#fff3e6]",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
