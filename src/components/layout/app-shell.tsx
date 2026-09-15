import Link from "next/link";
import { SiteNav } from "@/components/layout/site-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { UserMenu } from "@/components/layout/user-menu";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <header className="relative z-50 bg-grape text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link href="/" className="group flex items-center gap-3">
            <span
              aria-hidden
              className="flex h-10 w-10 rotate-[-6deg] items-center justify-center rounded-2xl bg-citron text-lg font-black text-ink shadow-[0_3px_0_rgba(0,0,0,0.25)] transition group-hover:rotate-3"
            >
              M
            </span>
            <span className="display-sm text-xl text-white">Memora</span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-[#e3d4f7] md:flex">
            <SiteNav />
          </nav>

          <div className="flex items-center gap-2">
            <MobileNav />
            <UserMenu />
          </div>
        </div>
        <div className="fringe" aria-hidden />
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">{children}</main>

      <footer className="bg-grape text-[#e3d4f7]">
        <div className="fringe rotate-180" aria-hidden />
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-8 text-center sm:px-6">
          <div className="display-sm text-2xl text-white">
            Toutes les photos de la fête, au même endroit.
          </div>
          <p className="text-sm">Memora — albums privés pour vos événements.</p>
        </div>
      </footer>
    </div>
  );
}
