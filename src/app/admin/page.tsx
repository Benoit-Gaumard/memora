import { AppShell } from "@/components/layout/app-shell";
import { Activity, Camera, Shield, Users } from "lucide-react";

const stats = [
  { label: "Événements actifs", value: "24", icon: Camera },
  { label: "Utilisateurs", value: "612", icon: Users },
  { label: "Photos", value: "3.2k", icon: Activity },
];

export default function AdminDashboard() {
  return (
    <AppShell>
      <div className="mb-6">
        <div className="text-xs uppercase tracking-[0.2em] text-[#8d6c5d]">Back-office</div>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-[#201c1a]">Dashboard admin</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-3xl border border-[#f0d9bf] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-2xl bg-[#fff4e9] p-2 text-[#d57f45]">
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-6 text-3xl font-black text-[#201c1a]">{value}</div>
            <div className="mt-2 text-sm text-[#5a4d47]">{label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-[32px] border border-[#f0d9bf] bg-[#fff9f3] p-5 shadow-sm">
        <div className="flex items-center gap-2 text-[#d57f45]">
          <Shield className="h-5 w-5" />
          <h2 className="text-lg font-bold text-[#241e1a]">Activité récente</h2>
        </div>

        <div className="mt-4 space-y-3 text-sm text-[#5a4d47]">
          {[
            "Nouvel événement créé : Weekend à Lyon",
            "42 nouvelles photos partagées",
            "Alice a été promue organisatrice",
            "Un nouveau lien d’invitation a été généré",
          ].map((event) => (
            <div key={event} className="rounded-2xl bg-white p-3">
              {event}
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
