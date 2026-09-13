import { AppShell } from "@/components/layout/app-shell";
import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
  return (
    <AppShell>
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-[32px] border border-[#f0d9bf] bg-[#fff8f0] p-6 shadow-sm md:p-8">
          <div className="text-xs uppercase tracking-[0.2em] text-[#8d6c5d]">Accès sécurisé</div>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-[#211d1b]">
            Connectez-vous à votre album.
          </h1>
          <p className="mt-4 max-w-md text-base leading-7 text-[#564c47]">
            Un compte unique avec username et mot de passe, associé à un profil lié à Supabase Auth.
            Chaque événement reste isolé et accessible uniquement aux membres actifs.
          </p>

          <div className="mt-6 space-y-3 rounded-3xl bg-white p-4 text-sm text-[#4d413d] shadow-sm">
            <div>• username unique, normalisé en minuscules</div>
            <div>• rôle global user / super_admin</div>
            <div>• rôle événementiel participant / organizer</div>
            <div>• accès contrôlé côté serveur via RLS</div>
          </div>
        </div>

        <LoginForm />
      </div>
    </AppShell>
  );
}
