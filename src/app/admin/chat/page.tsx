import { getAllChatChannels } from "@/lib/actions/adminChat";
import AdminChatInterface from "@/components/admin/chat/AdminChatInterface";

export const dynamic = 'force-dynamic';

export default async function AdminChatPage() {
    const channels = await getAllChatChannels();

    return (
        <div className="p-10 lg:p-14 h-[calc(100vh-100px)] flex flex-col animate-in fade-in slide-in-from-bottom-6 duration-700">
            <header className="mb-12 shrink-0 border-b border-border/50 pb-8">
                <div className="flex items-center gap-3 mb-4">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
                    <p className="text-[10px] text-primary/40 font-black uppercase tracking-[0.5em] italic">COMM_LINK // ALPHA_TERMINAL</p>
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-primary italic uppercase tracking-tighter leading-none">
                    MESSAGERIE <span className="text-secondary/20">Interne.</span>
                </h1>
                <p className="text-secondary/40 font-black text-[10px] uppercase tracking-[0.3em] mt-3 italic max-w-lg">
                    // CANAL_DIRECT_XFER_PROTOCOLE_CLIENTS.
                </p>
            </header>

            <div className="flex-1 min-h-0 bg-white/40 backdrop-blur-3xl border border-border/50 rounded-[3rem] shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/2 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
                <AdminChatInterface projects={channels} />
            </div>
        </div>
    );
}
