import ProjectBuilder from "@/components/onboarding/ProjectBuilder";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
    title: "Configuration du Projet | AUTOMATIC",
    description: "Configurez votre projet digital en quelques clics.",
};

export default function OnboardingPage() {
    return (
        <main className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-50/80 to-transparent pointer-events-none" />
            
            {/* Logo Header */}
            <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Image
                    src="/logo.svg"
                    alt="AUTOMATIC Logo"
                    width={32}
                    height={32}
                    className="w-8 h-8"
                />
                <span className="font-heading font-bold text-lg text-slate-900">AUTOMATIC</span>
            </Link>
            
            <ProjectBuilder />
        </main>
    );
}
