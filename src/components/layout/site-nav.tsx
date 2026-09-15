"use client";

import Link from "next/link";

const navItems = [
  { href: "/", label: "Accueil" },
  { href: "/events", label: "Événements" },
];

export function SiteNav() {
  return (
    <>
      {navItems.map((item) => (
        <Link key={item.href} href={item.href} className="transition hover:text-citron">
          {item.label}
        </Link>
      ))}
    </>
  );
}
