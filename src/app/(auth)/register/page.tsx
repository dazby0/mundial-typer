import { AuthPageShell } from "@/src/features/auth/components/AuthPageShell";
import { RegisterForm } from "@/src/features/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthPageShell
      title="Zakładamy konto"
      description="Wymyśl nick, ustaw hasło i zaczynamy walkę o najbardziej prestiżową nagrodę sezonu."
      footerText="Masz już konto?"
      footerLinkLabel="Zaloguj się"
      footerLinkHref="/login"
    >
      <RegisterForm />
    </AuthPageShell>
  );
}
