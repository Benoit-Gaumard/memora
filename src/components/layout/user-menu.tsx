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
    return <div className="h-10 w-10 rounded-full bg-[#fff3e6]" />;
  }

  if (!session) {
    return (
      <Link
        href="/login"
        className="rounded-full border border-[#d7b38f] bg-[#fff3e6] px-3 py-2 text-sm font-semibold text-[#3c2d26] transition hover:bg-[#fce7d3]"
      >
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
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4b178] text-sm font-bold text-white shadow-sm transition hover:bg-[#e6995b]"
        aria-label="Mon compte"
      >
        {initial}
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-50 mt-2 w-48 rounded-2xl border border-[#f0d9bf] bg-white p-2 shadow-lg">
          <div className="truncate px-3 py-2 text-sm font-semibold text-[#3c2d26]">
            {displayName}
          </div>
          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#5c4f46] transition hover:bg-[#fff3e6]"
          >
            <User className="h-4 w-4" />
            Mon profil
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-[#5c4f46] transition hover:bg-[#fff3e6]"
          >
            <LogOut className="h-4 w-4" />
            Se déconnecter
          </button>
        </div>
      ) : null}
    </div>
  );
}
