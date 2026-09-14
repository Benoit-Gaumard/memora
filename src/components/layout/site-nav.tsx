"use client";

import Link from "next/link";
import { useSupabaseSession } from "@/lib/use-session";

const baseNavItems = [
  { href: "/", label: "Accueil" },
  { href: "/events", label: "Événements" },
];

export function SiteNav() {
  const { session } = useSupabaseSession();

  const navItems = session
    ? [...baseNavItems, { href: "/profile", label: "Profil" }]
    : baseNavItems;

  return (
    <>
      {navItems.map((item) => (
        <Link key={item.href} href={item.href} className="transition hover:text-[#1f1b18]">
          {item.label}
        </Link>
      ))}
    </>
  );
}
