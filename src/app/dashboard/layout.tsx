import Sidebar from "@/components/dashboard/Sidebar";
import { getCurrentUser } from "@/lib/actions/users";
import ChatWidget from "@/components/chat/ChatWidget";

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden relative selection:bg-blue-100 selection:text-blue-900">
      {/* Global Ambient Glow - Subtle Light Mode */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-100 rounded-full blur-[150px] pointer-events-none opacity-60" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-50 rounded-full blur-[150px] pointer-events-none opacity-60" />

      <Sidebar user={user} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10">
        <header className="h-20 border-b border-slate-200 flex items-center justify-between px-8 bg-white/80 backdrop-blur-xl z-20 sticky top-0 shadow-sm">
          <div className="flex flex-col">
            <h1 className="text-sm font-black uppercase tracking-widest text-slate-800">Tableau de Bord</h1>
            <p className="text-[10px] text-slate-500 font-medium">Console v2.1 • {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-emerald-200 shadow-lg" />
              Système Opérationnel
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full shadow-sm">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-tight">Equipe Connectée</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-12">
            {children}
          </div>

          {/* Bottom spacer for scroll */}
          <div className="h-20" />
        </div>
      </main>

      {/* Chat Widget for Clients */}
      {user && user.role === 'CLIENT' && <ChatWidget currentUser={user} />}
    </div>
  );
}
