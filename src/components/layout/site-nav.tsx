"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const baseNavItems = [
  { href: "/", label: "Accueil" },
  { href: "/events", label: "Événements" },
];

export function SiteNav() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsAuthenticated(Boolean(data.session));
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session));
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  const navItems = isAuthenticated
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
