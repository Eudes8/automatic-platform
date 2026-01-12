import Sidebar from "@/components/dashboard/Sidebar";
import { getCurrentUser } from "@/lib/actions/users";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      <Sidebar user={user} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-slate-950">
          <h1 className="text-sm font-black uppercase tracking-widest text-slate-400">Project Console / v1.0.4</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-green-500 uppercase tracking-tighter">Équipe en ligne</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
