import LoginForm from "@/components/auth/LoginForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    return (
        <main className="min-h-screen bg-background flex flex-col items-center justify-center p-8 relative overflow-hidden">
            {/* Background elements - Premium Light Ambience */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-64 -mt-64" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -ml-64 -mb-64" />

            {/* Navigation Return */}
            <div className="absolute top-10 left-10 z-20">
                <Link
                    href="/"
                    className="group flex items-center gap-3 text-[10px] font-black text-secondary/40 uppercase tracking-[0.4em] hover:text-primary transition-all italic"
                >
                    <div className="w-10 h-10 rounded-xl bg-background border border-border/50 flex items-center justify-center group-hover:bg-primary group-hover:text-background transition-all duration-500 shadow-inner group-hover:scale-110">
                        <ChevronLeft size={16} />
                    </div>
                    // PROTOCOL_HOME_RETURN
                </Link>
            </div>

            <div className="relative z-10 w-full flex justify-center py-20">
                <LoginForm />
            </div>

            {/* Footer Technical Log */}
            <div className="absolute bottom-6 left-6 text-[8px] font-black text-secondary/20 uppercase tracking-[0.3em] italic">
                SÉCURITÉ_ÉLEVÉE // NODES_SÉCURISÉS // {new Date().getFullYear()}_AUTOMATIC_CI
            </div>
        </main>
    );
}
