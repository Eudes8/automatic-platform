import ProjectBuilder from "@/components/onboarding/ProjectBuilder";
import { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/shared/Logo";

export const metadata: Metadata = {
  title: "Démarrer un projet",
  description: "Décrivez votre besoin en quelques minutes. Nous revenons avec un périmètre et un budget.",
};

export default function OnboardingPage() {
  return (
    <main className="min-h-[100dvh] bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="shell flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <span className="hidden text-[13px] text-secondary sm:inline">Démarrer un projet</span>
            <Link href="/login" className="btn btn-outline h-10 px-4 text-[13px]">
              Espace client
            </Link>
          </div>
        </div>
      </header>

      <ProjectBuilder />
    </main>
  );
}
