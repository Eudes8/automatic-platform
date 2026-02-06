"use client";

import Sidebar from "@/components/dashboard/Sidebar";
import NotificationCenter from "@/components/dashboard/NotificationCenter";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen bg-background text-primary overflow-hidden relative">
            {/* Global Ambient Glow */}
            <div className="fixed top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Sidebar component now handles its own mobile trigger */}
            <Sidebar />

            <main className="flex-1 flex flex-col relative z-10 lg:ml-0 overflow-y-auto custom-scrollbar">
                <header className="h-16 sm:h-20 md:h-24 border-b border-border/50 flex items-center justify-between px-4 sm:px-6 md:px-10 bg-background/80 backdrop-blur-3xl z-20 sticky top-0 shrink-0">
                    <div className="flex flex-col">
                        <h1 className="text-base sm:text-lg md:text-xl font-bold uppercase tracking-tight">Administration</h1>
                        <p className="text-[8px] sm:text-[9px] md:text-[10px] text-secondary/40 font-bold uppercase tracking-widest mt-0.5 sm:mt-1">
                            {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6 md:gap-8">
                        <div className="hidden sm:flex items-center gap-2 sm:gap-3 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 bg-accent/5 border border-accent/10 rounded-full shadow-inner group transition-all">
                            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-accent rounded-full animate-pulse" />
                            <span className="text-[8px] sm:text-[9px] font-bold text-accent uppercase tracking-widest">Connecté</span>
                        </div>
                        <NotificationCenter />
                    </div>
                </header>

                <div className="flex-1 p-4 sm:p-6 md:p-10 lg:p-14 custom-scrollbar scroll-smooth">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                    {/* Add spacer for content footer on narrow screens */}
                    <div className="h-24 lg:hidden" />
                </div>
            </main>
        </div>
    );
}
