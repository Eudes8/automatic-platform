import Sidebar from "@/components/dashboard/Sidebar";
import { getCurrentUser } from "@/lib/actions/users";
import ChatWidget from "@/components/chat/ChatWidget";
import NotificationCenter from "@/components/dashboard/NotificationCenter";

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="flex h-screen bg-background text-primary overflow-hidden relative selection:bg-primary/10 selection:text-primary">
      {/* Global Ambient Glow - Unified Premium Light */}
      <div className="fixed top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <Sidebar user={user} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10 lg:ml-0">
        <header className="h-16 sm:h-20 md:h-24 border-b border-border/50 flex items-center justify-between px-4 sm:px-6 md:px-10 bg-background/80 backdrop-blur-3xl z-20 sticky top-0">
          <div className="flex flex-col">
            <h1 className="text-base sm:text-lg md:text-xl font-bold uppercase tracking-tight">Espace Client</h1>
            <p className="text-[8px] sm:text-[9px] md:text-[10px] text-secondary/40 font-bold uppercase tracking-widest mt-0.5 sm:mt-1">
              {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 md:gap-8">
            <div className="hidden sm:flex items-center gap-2 sm:gap-3 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 bg-primary/5 border border-primary/10 rounded-full shadow-inner group transition-all">
              <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-emerald-500 rounded-full" />
              <span className="text-[8px] sm:text-[9px] font-bold text-primary uppercase tracking-widest">Équipe en ligne</span>
            </div>
            <NotificationCenter />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 lg:p-16 custom-scrollbar scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>

          <div className="h-16 sm:h-24 md:h-32" />
        </div>
      </main>

      {user && user.role === 'CLIENT' && <ChatWidget currentUser={user} />}
    </div>
  );
}
