"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogOut, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSupabaseSession } from "@/lib/use-session";

export function UserMenu() {
  const { session, isLoading } = useSupabaseSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setIsOpen(false);
    router.push("/");
    router.refresh();
  }

  if (isLoading) {
    return <div className="h-10 w-10 rounded-full bg-white/20" />;
  }

  if (!session) {
    return (
      <Link href="/login" className="btn btn-sm btn-citron">
        Se connecter
      </Link>
    );
  }

  const displayName =
    (session.user.user_metadata?.display_name as string | undefined) ||
    session.user.email ||
    "?";
  const initial = displayName.trim().charAt(0).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink bg-fuchsia font-display text-sm font-extrabold text-ink shadow-[0_3px_0_var(--ink)] transition hover:bg-citron"
        aria-label="Mon compte"
      >
        {initial}
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-50 mt-2 w-52 rounded-2xl border-2 border-ink bg-white p-2 shadow-[0_5px_0_var(--ink)]">
          <div className="truncate px-3 py-2 font-display text-sm font-bold text-ink">
            {displayName}
          </div>
          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-ink transition hover:bg-citron"
          >
            <User className="h-4 w-4" />
            Mon profil
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-ink transition hover:bg-citron"
          >
            <LogOut className="h-4 w-4" />
            Se déconnecter
          </button>
        </div>
      ) : null}
    </div>
  );
}
