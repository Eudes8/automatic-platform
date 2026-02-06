import ProjectBuilder from "@/components/onboarding/ProjectBuilder";
import { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/shared/Logo";

export const metadata: Metadata = {
    title: "Créer votre projet | AUTOMATIC",
    description: "Donnez vie à votre idée en quelques clics.",
};

export default function OnboardingPage() {
    return (
        <main className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
            {/* Soft Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-20%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] left-[-20%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[120px]" />
            </div>

            {/* Header / Logo */}
            <div className="absolute top-6 sm:top-8 md:top-10 w-full px-6 sm:px-8 md:px-12 flex justify-between items-center z-50">
                <Link href="/" className="flex items-center gap-3 sm:gap-4 hover:scale-105 transition-transform">
                    <Logo />
                </Link>
                <div className="flex items-center gap-4 sm:gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary/60 uppercase tracking-widest">Espace Création</span>
                    </div>
                </div>
            </div>

            <ProjectBuilder />
        </main>
    );
}

