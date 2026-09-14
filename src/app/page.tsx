import Link from "next/link";
import { ArrowRight, Camera, Lock, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";

export default function HomePage() {
  return (
    <AppShell>
      <section className="mb-8 overflow-hidden rounded-[36px] border border-[#f0d7be] bg-[linear-gradient(135deg,_#fffaf4_0%,_#fdf2e7_48%,_#f8ebdf_100%)] p-6 shadow-[0_24px_80px_rgba(146,95,53,0.12)] md:p-8">
        <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#f0d6b7] bg-white/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9c6d44] shadow-sm">
              <Camera className="h-3.5 w-3.5" />
              Moments mémorables
            </div>
            <h1 className="mt-5 max-w-lg text-4xl font-black tracking-[-0.04em] text-[#1c1714] md:text-6xl">
              Les meilleurs souvenirs, réunis pour chaque événement.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-8 text-[#5f524d] md:text-lg">
              Memora transforme chaque fête en album chaleureux, pensé pour partager les instantanés
              les plus précieux entre invités.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/join/AB7KQ2"
                className="inline-flex items-center gap-2 rounded-full bg-[#d38656] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(211,134,86,0.35)] transition hover:bg-[#c9784f]"
              >
                Rejoindre un événement
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full border border-[#efceaa] bg-white/90 px-5 py-3 text-sm font-semibold text-[#433a35] transition hover:bg-[#fff5ec]"
              >
                Se connecter
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[30px] border border-[#efcfaf] bg-white shadow-[0_30px_80px_rgba(87,59,35,0.12)]">
            <div className="relative h-[440px] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80"
                alt="Des invités qui célèbrent ensemble lors d'un événement"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1d150f]/65 via-[#1d150f]/10 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      <section className="mb-10 grid gap-6 rounded-[30px] border border-[#f0d9bf] bg-[#fff7f0] p-5 md:grid-cols-3 md:p-6">
        <div className="rounded-[24px] bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-[#fff0de] p-2 text-[#d57f45]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-[#241e1a]">Album privé</div>
              <p className="mt-1 text-sm leading-6 text-[#5b4d46]">
                Une expérience pensée pour garder chaque événement intime et facilement partagé entre invités.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-[#fff0de] p-2 text-[#d57f45]">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-[#241e1a]">Invitation simple</div>
              <p className="mt-1 text-sm leading-6 text-[#5b4d46]">
                Un seul accès suffit pour rejoindre l’événement et retrouver les meilleurs clichés en quelques secondes.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-[#fff0de] p-2 text-[#d57f45]">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-[#241e1a]">Souvenirs partagés</div>
              <p className="mt-1 text-sm leading-6 text-[#5b4d46]">
                Les invités publient leurs photos, revivent les meilleurs moments et gardent un souvenir vivant.
              </p>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
