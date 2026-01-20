import Sidebar from "@/components/dashboard/Sidebar";
import { getCurrentUser } from "@/lib/actions/users";
import ChatWidget from "@/components/chat/ChatWidget";

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
      <main className="flex-1 flex flex-col relative z-10">
        <header className="h-24 border-b border-border/50 flex items-center justify-between px-10 bg-background/80 backdrop-blur-3xl z-20 sticky top-0">
          <div className="flex flex-col">
            <h1 className="text-xl font-heading font-black uppercase tracking-tighter italic">CONSOLE_MAIN_UNIT.</h1>
            <p className="text-[10px] text-secondary/40 font-black uppercase tracking-[0.3em] mt-1">
              SYSTEM_BOOT_LOG // {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.')}
            </p>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden lg:flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[9px] font-black text-secondary/40 uppercase tracking-[0.4em] italic">NODE_OPÉRATIONNEL_V2.1</span>
            </div>

            <div className="flex items-center gap-3 px-6 py-2.5 bg-primary/5 border border-primary/10 rounded-full shadow-inner group hover:bg-primary/10 transition-all cursor-crosshair">
              <div className="w-1.5 h-1.5 bg-accent rounded-full animate-ping" />
              <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] italic">EQUIPE_DISPONIBLE</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 lg:p-16 custom-scrollbar scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>

          <div className="h-32" />
        </div>
      </main>

      {user && user.role === 'CLIENT' && <ChatWidget currentUser={user} />}
    </div>
  );
}
