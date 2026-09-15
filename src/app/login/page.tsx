import { AppShell } from "@/components/layout/app-shell";
import { LoginForm } from "@/components/forms/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;

  return (
    <AppShell>
      <div className="mx-auto grid max-w-xl gap-8 py-4">
        <LoginForm redirectTo={redirect} />
      </div>
    </AppShell>
  );
}
