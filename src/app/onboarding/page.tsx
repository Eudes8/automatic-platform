import ProjectBuilder from "@/components/onboarding/ProjectBuilder";
import { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/shared/Logo";

export const metadata: Metadata = {
    title: "Initialisation Protocole | AUTOMATIC",
    description: "Configurez votre actif technologique via l'interface Nexus.",
};

export default function OnboardingPage() {
    return (
        <main className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
            {/* Serious Tech Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_100%)]" />
            </div>

            {/* Header / Logo */}
            <div className="absolute top-10 w-full px-12 flex justify-between items-center z-50">
                <Link href="/" className="flex items-center gap-4 hover:scale-105 transition-transform">
                    <Logo />
                </Link>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">Encrypted_Session</span>
                    </div>
                </div>
            </div>

            <ProjectBuilder />
        </main>
    );
}

