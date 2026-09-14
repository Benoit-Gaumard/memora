import Link from "next/link";
import { Camera, Sparkles } from "lucide-react";
import { SiteNav } from "@/components/layout/site-nav";
import { UserMenu } from "@/components/layout/user-menu";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fffaf3] text-[#1f1b18]">
      <header className="border-b border-[#efd9bf] bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4b178] text-white shadow-sm">
              <Camera className="h-5 w-5" />
            </div>
            <div className="text-lg font-bold">Memora</div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-[#5c4f46] md:flex">
            <SiteNav />
          </nav>

          <div className="flex items-center gap-2">
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>

      <footer className="border-t border-[#efd9bf] bg-[#fff5e8]">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-6 text-sm text-[#655750] sm:px-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#d57f45]" />
            Conçu pour rassembler et célébrer vos plus beaux souvenirs.
          </div>
        </div>
      </footer>
    </div>
  );
}
