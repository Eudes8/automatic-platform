import ProjectBuilder from "@/components/onboarding/ProjectBuilder";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Configuration du Projet | AUTOMATIC",
    description: "Configurez votre projet digital en quelques clics.",
};

export default function OnboardingPage() {
    return (
        <main className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-50/80 to-transparent pointer-events-none" />
            <ProjectBuilder />
        </main>
    );
}
