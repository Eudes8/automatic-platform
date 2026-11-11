import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata = { title: "Créer un compte" };

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Nouveau compte"
      title="Créer un compte"
      subtitle="Un espace personnel pour suivre vos projets et valider vos livrables."
      footer={
        <p>
          Vous avez déjà un compte ?{" "}
          <Link href="/login" className="font-medium text-accent hover:underline">
            Se connecter
          </Link>
          .
        </p>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
