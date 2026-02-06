import LoginForm from "@/components/auth/LoginForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    return (
        <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden">
            {/* Background elements - Premium Light Ambience */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] bg-primary/5 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] -mr-40 -mt-40 sm:-mr-52 sm:-mt-52 md:-mr-64 md:-mt-64" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] bg-accent/5 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] -ml-40 -mb-40 sm:-ml-52 sm:-mb-52 md:-ml-64 md:-mb-64" />

            {/* Navigation Return */}
            <div className="absolute top-6 sm:top-8 md:top-10 left-4 sm:left-6 md:left-10 z-20">
                <Link
                    href="/"
                    className="group flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] font-black text-secondary/40 uppercase tracking-[0.35em] sm:tracking-[0.4em] hover:text-primary transition-all italic"
                >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-background border border-border/50 flex items-center justify-center group-hover:bg-primary group-hover:text-background transition-all duration-500 shadow-inner group-hover:scale-110">
                        <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <span className="hidden sm:inline">Retour à l'accueil</span>
                </Link>
            </div>

            <div className="relative z-10 w-full flex justify-center py-12 sm:py-16 md:py-20">
                <LoginForm />
            </div>

            {/* Footer Technical Log */}
            <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 text-[7px] sm:text-[8px] font-black text-secondary/20 uppercase tracking-[0.2em] italic">
                Connexion sécurisée // {new Date().getFullYear()} Automatic
            </div>
        </main>
    );
}
