import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = { title: "Connexion" };

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Espace client"
      title="Se connecter"
      subtitle="Accédez au suivi de vos projets, vos livrables et vos factures."
      footer={
        <p>
          Pas encore de compte ?{" "}
          <Link href="/register" className="font-medium text-accent hover:underline">
            Créer un compte
          </Link>{" "}
          ou{" "}
          <Link href="/onboarding" className="font-medium text-accent hover:underline">
            démarrer un projet
          </Link>
          .
        </p>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
