import ProjectBuilder from "@/components/onboarding/ProjectBuilder";
import { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { getCurrentUser } from "@/lib/actions/users";

export const metadata: Metadata = {
  title: "Démarrer un projet",
  description: "Décrivez votre besoin en quelques minutes. Nous revenons avec un périmètre et un budget.",
};

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  // Un client déjà connecté ne doit pas recréer de compte pour lancer un projet.
  const user = await getCurrentUser();

  return (
    <main className="min-h-[100dvh] bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="shell flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <span className="hidden text-[13px] text-secondary sm:inline">Démarrer un projet</span>
            <Link href={user ? "/dashboard" : "/login"} className="btn btn-outline h-10 px-4 text-[13px]">
              {user ? "Mon espace" : "Espace client"}
            </Link>
          </div>
        </div>
      </header>

      <ProjectBuilder currentUser={user ? { name: user.name, email: user.email } : null} />
    </main>
  );
}
