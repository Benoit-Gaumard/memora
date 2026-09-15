import Link from "next/link";
import {
  Briefcase,
  Cake,
  Download,
  GalleryVerticalEnd,
  Heart,
  MessageCircle,
  Mic,
  Palette,
  PartyPopper,
  Presentation,
  QrCode,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";

const DESIGN_CONTRACT = `<!--
THESIS: la fête se range toute seule. Refuse la landing SaaS sobre en cartes grises.
OWN-WORLD: cotillons en papier — aplats fuchsia/mandarine/turquoise/raisin/citron sur encre
prune, cartes découpées, bords festonnés, franges de crépon, serpentins, confettis. Les aplats
portent toujours l'encre, jamais du blanc fin.
STORY: l'organisateur comprend qu'un QR code suffit, croit que ses invités suivront sans app,
et clique sur « Créer mon album ».
FIRST VIEWPORT: panneau raisin drenché, serpentins, titre découpé à gauche, deux boutons papier,
et à droite des tirages photo éparpillés qui se rangent en album.
FORM: direction 7 (cotillons), mise en scène « le désordre qui se range », seed b90bb576.
-->`;

const steps = [
  {
    color: "bg-citron",
    title: "Créez l’album",
    body: "Un événement, un nom, une date. C’est votre album privé.",
  },
  {
    color: "bg-turquoise",
    title: "Affichez le QR code",
    body: "Sur les tables, à l’entrée. Vos invités le scannent et rejoignent la fête.",
  },
  {
    color: "bg-fuchsia",
    title: "Les photos arrivent",
    body: "Chacun dépose depuis son téléphone. Vous téléchargez tout en un clic.",
  },
];

const features = [
  { icon: GalleryVerticalEnd, label: "Album digital", color: "bg-citron" },
  { icon: Download, label: "Téléchargement en 1 clic", color: "bg-turquoise" },
  { icon: Smartphone, label: "Aucune application", color: "bg-fuchsia" },
  { icon: QrCode, label: "QR code", color: "bg-mandarine" },
  { icon: Sparkles, label: "Photos en direct", color: "bg-turquoise" },
  { icon: Palette, label: "Personnalisation", color: "bg-citron" },
  { icon: MessageCircle, label: "Commentaires", color: "bg-fuchsia" },
  { icon: ShieldCheck, label: "Privé et sécurisé", color: "bg-mandarine" },
];

const useCases = [
  { icon: Heart, label: "Mariages", color: "bg-fuchsia" },
  { icon: Cake, label: "Anniversaires", color: "bg-citron" },
  { icon: PartyPopper, label: "Fêtes", color: "bg-turquoise" },
  { icon: Presentation, label: "Séminaires", color: "bg-mandarine" },
  { icon: Mic, label: "Conférences", color: "bg-citron" },
  { icon: Briefcase, label: "Événements d’entreprise", color: "bg-turquoise" },
];

const albumShots = [
  {
    src: "https://images.pexels.com/photos/30844786/pexels-photo-30844786.jpeg?auto=compress&cs=tinysrgb&w=400",
    alt: "Des amis avec des chapeaux de fête autour d’un gâteau",
    style: { "--from-x": "-40px", "--from-rot": "-14deg", "--to-rot": "-4deg" },
    delay: "0.35s",
  },
  {
    src: "https://images.pexels.com/photos/33038796/pexels-photo-33038796.jpeg?auto=compress&cs=tinysrgb&w=400",
    alt: "Un groupe d’amis qui rit autour d’un gâteau d’anniversaire",
    style: { "--from-x": "30px", "--from-rot": "12deg", "--to-rot": "3deg" },
    delay: "0.5s",
  },
  {
    src: "https://images.pexels.com/photos/8104163/pexels-photo-8104163.jpeg?auto=compress&cs=tinysrgb&w=400",
    alt: "Un enfant qui souffle ses bougies d’anniversaire",
    style: { "--from-x": "-18px", "--from-rot": "9deg", "--to-rot": "-2deg" },
    delay: "0.65s",
  },
] as const;

export default function HomePage() {
  return (
    <AppShell>
      <div hidden dangerouslySetInnerHTML={{ __html: DESIGN_CONTRACT }} />

      <section className="relative -mx-4 overflow-hidden bg-grape px-4 pb-14 pt-12 text-white sm:-mx-6 sm:px-6 md:rounded-[40px] md:px-10 md:pb-16 md:pt-14">
        <div className="confetti pointer-events-none absolute inset-0 opacity-40" aria-hidden />
        <svg
          aria-hidden
          viewBox="0 0 800 200"
          preserveAspectRatio="none"
          className="pointer-events-none absolute -top-2 left-0 h-24 w-full opacity-70"
        >
          <path
            d="M0 60 C 90 10, 150 120, 250 60 S 420 10, 520 70 S 700 140, 800 50"
            fill="none"
            stroke="#ff2e88"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M0 120 C 120 70, 200 180, 320 110 S 520 60, 640 130 S 760 170, 800 120"
            fill="none"
            stroke="#00bfa6"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>

        <div className="relative grid gap-12 md:grid-cols-[1.05fr_0.95fr] md:items-center">
          <div>
            <h1 className="display text-[clamp(2.6rem,7vw,5rem)] text-white">
              La fête est finie. <br />
              Les photos, elles, <span className="marker">sont toutes là.</span>
            </h1>

            <p className="mt-6 max-w-[34rem] text-lg leading-8 text-[#e3d4f7]">
              Une façon simple de collecter les photos de vos invités : un QR code, aucune
              application à installer, et un album privé qui se remplit tout seul pendant la soirée.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/login" className="btn btn-citron">
                Créer mon album
              </Link>
              <Link href="/events" className="btn">
                Voir mes albums
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-2 text-sm text-[#e3d4f7]">
              <span className="chip chip-night">
                <QrCode className="h-4 w-4" />
                Scannez, c’est rejoint
              </span>
              <span className="chip chip-night">
                <ShieldCheck className="h-4 w-4" />
                Réservé aux invités
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <figure
              className="settle relative rounded-[28px] bg-white p-3 shadow-[0_28px_60px_-25px_rgba(0,0,0,0.8)]"
              style={{ "--from-y": "-46px", "--from-rot": "-8deg", "--to-rot": "-2.5deg" } as React.CSSProperties}
            >
              <span className="tape -top-3 left-1/2 -translate-x-1/2 -rotate-3" aria-hidden />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.pexels.com/photos/7180623/pexels-photo-7180623.jpeg?auto=compress&cs=tinysrgb&w=900"
                alt="Des amis qui célèbrent ensemble lors d’une fête"
                className="h-[300px] w-full rounded-[18px] object-cover md:h-[360px]"
              />
            </figure>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {albumShots.map((shot) => (
                <div
                  key={shot.src}
                  className="settle rounded-2xl bg-white p-1.5 shadow-[0_18px_34px_-22px_rgba(0,0,0,0.9)]"
                  style={{ ...(shot.style as React.CSSProperties), animationDelay: shot.delay }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={shot.src}
                    alt={shot.alt}
                    className="h-24 w-full rounded-xl object-cover sm:h-28"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="display-sm max-w-xl text-[clamp(2rem,4.5vw,3rem)]">
          Trois gestes, et l’album se remplit.
        </h2>

        <ol className="mt-8 grid gap-5 md:grid-cols-3">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className={`paper scallop-bottom relative pb-8 ${index === 1 ? "md:mt-8" : ""}`}
            >
              <div className={`flex items-center gap-3 rounded-t-[26px] ${step.color} px-5 py-4`}>
                <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink bg-white font-display text-base font-extrabold">
                  {index + 1}
                </span>
                <span className="display-sm text-xl">{step.title}</span>
              </div>
              <p className="px-5 pt-4 text-base leading-7 text-ink-soft">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16">
        <h2 className="display-sm max-w-2xl text-[clamp(2rem,4.5vw,3rem)]">
          Tout ce dont vous avez besoin pour un événement parfait.
        </h2>

        <div className="relative mt-10">
          <svg
            aria-hidden
            viewBox="0 0 1000 60"
            preserveAspectRatio="none"
            className="absolute -top-6 left-0 h-12 w-full"
          >
            <path
              d="M0 14 C 160 58, 340 6, 500 34 S 840 58, 1000 12"
              fill="none"
              stroke="#240b3b"
              strokeOpacity="0.28"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>

          <ul className="flex flex-wrap gap-3">
            {features.map(({ icon: Icon, label, color }, index) => (
              <li
                key={label}
                className={`flex items-center gap-2.5 rounded-2xl border-2 border-ink ${color} px-4 py-3 shadow-[0_4px_0_var(--ink)]`}
                style={{ transform: `rotate(${index % 2 === 0 ? -1.6 : 1.4}deg)` }}
              >
                <Icon className="h-5 w-5" />
                <span className="font-display text-base font-bold">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="display-sm max-w-xl text-[clamp(2rem,4.5vw,3rem)]">
          Une fête, quelle qu’elle soit.
        </h2>
        <p className="mt-4 max-w-xl text-lg leading-8 text-ink-soft">
          Memora rassemble les photos de tout le monde, que ce soit en famille, entre amis ou au
          bureau.
        </p>

        <ul className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-8 md:justify-start">
          {useCases.map(({ icon: Icon, label, color }, index) => (
            <li key={label} className="flex w-32 flex-col items-center text-center">
              <span
                className={`flex h-24 w-24 items-start justify-center ${color} pt-4`}
                style={{
                  clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                  filter: "drop-shadow(3px 4px 0 var(--ink))",
                  transform: `rotate(${index % 2 === 0 ? -3 : 3}deg)`,
                }}
              >
                <Icon className="h-6 w-6" />
              </span>
              <span className="mt-3 font-display text-sm font-bold leading-tight">{label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="relative mt-16 overflow-hidden rounded-[36px] bg-fuchsia px-6 py-12 text-ink md:px-12 md:py-16">
        <div className="confetti pointer-events-none absolute inset-0 opacity-50" aria-hidden />
        <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <h2 className="display max-w-xl text-[clamp(2.2rem,5vw,3.6rem)]">
            Votre prochaine fête mérite son album.
          </h2>
          <Link href="/login" className="btn btn-citron shrink-0 text-lg">
            Créer mon album
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
