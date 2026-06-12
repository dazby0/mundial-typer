import { AuthPageShell } from "@/src/features/auth/components/AuthPageShell";
import { LoginForm } from "@/src/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <AuthPageShell
      title="Wbijaj z powrotem"
      description="Podaj nick i hasło. Ranking sam się nie wygra, a piwo samo się nie zdobędzie."
      footerText="Nie masz jeszcze konta?"
      footerAppLinkLabel="Załóż konto"
      footerAppLinkHref="/register"
    >
      <LoginForm />
    </AuthPageShell>
  );
}
