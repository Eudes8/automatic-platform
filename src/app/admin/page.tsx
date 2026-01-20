import {
    BarChart3,
    Users,
    MessageSquare,
    Zap,
    Activity,
    Server,
    Globe,
    AlertCircle,
    ArrowUpRight,
    FileText
} from "lucide-react";
import { getAdminStats } from "@/lib/actions/admin";
import Link from "next/link";
import { getAllChatChannels } from "@/lib/actions/adminChat";
import { getAdminNotifications } from "@/lib/actions/notifications";
import { Bell, Check } from "lucide-react";

export const dynamic = 'force-dynamic';

type RecentMessage = {
    id: string;
    text: string;
    createdAt: string;
    sender?: { role: string };
    project?: { title: string };
};

export default async function AdminDashboard() {
    const stats = await getAdminStats();
    const activeProjects = await getAllChatChannels(); // Get recent activity
    const recentMessages = activeProjects.flatMap((p: any) =>
        p.messages.map((m: any) => ({
            ...m,
            createdAt: m.createdAt.toISOString(),
            project: { title: p.title }
        }))
    ).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

    const notifications = await getAdminNotifications();

    return (
        <div className="min-h-screen bg-background p-10 lg:p-14 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Admin Header - Industrial/Cyber Look Updated */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-16 pb-12 border-b border-border/50">
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-4 h-4 rounded-full bg-accent animate-ping shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
                        <span className="text-[10px] font-black text-accent uppercase tracking-[0.5em] italic">SYSTÈME_ACTIF // NÉVRALGIE_MÉTIER</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-heading font-black text-primary uppercase tracking-tighter italic leading-[0.8]">
                        MAINFRAME <br /><span className="text-secondary/20 tracking-normal">NEXUS_CONTROLE.</span>
                    </h1>
                </div>
                <div className="flex gap-10 text-[9px] font-black uppercase tracking-[0.4em] text-secondary/40 italic">
                    <div className="flex flex-col items-end">
                        <span className="opacity-50 mb-1">HORODATAGE_SERVEUR</span>
                        <span className="text-primary font-mono">{new Date().toLocaleTimeString('fr-FR')}_UTC</span>
                    </div>
                    <div className="flex flex-col items-end border-l border-border/50 pl-10">
                        <span className="opacity-50 mb-1">LATENCE_RÉSEAU</span>
                        <span className="text-emerald-600 font-mono">0.12ms // SCAN_OK</span>
                    </div>
                </div>
            </header>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 mb-12">
                {/* KPI Tickers */}
                <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="p-8 bg-card/10 border border-border/50 rounded-[2.5rem] shadow-xl group hover:bg-white hover:scale-[1.02] transition-all duration-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/2 rounded-full blur-3xl -mr-16 -mt-16" />
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background transition-colors duration-500">
                                <BarChart3 size={20} />
                            </div>
                            <span className="text-[9px] text-secondary/40 font-black uppercase tracking-[0.3em] italic group-hover:text-primary/60 transition-colors">REV_TOTAL_ANNUEL</span>
                        </div>
                        <p className="text-4xl font-black text-primary tracking-tighter italic uppercase">{stats.totalRevenue}€</p>
                        <div className="mt-4 flex items-center gap-2">
                            <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest italic">+12.4%_XFER</span>
                        </div>
                    </div>

                    <div className="p-8 bg-card/10 border border-border/50 rounded-[2.5rem] shadow-xl group hover:bg-white hover:scale-[1.02] transition-all duration-500 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-secondary/5 flex items-center justify-center text-secondary group-hover:bg-primary group-hover:text-background transition-colors duration-500">
                                <Users size={20} />
                            </div>
                            <span className="text-[9px] text-secondary/40 font-black uppercase tracking-[0.3em] italic group-hover:text-primary/60 transition-colors">CLIENTS_NODE_SYNC</span>
                        </div>
                        <p className="text-4xl font-black text-primary tracking-tighter italic uppercase">{stats.totalUsers}</p>
                        <div className="mt-4 flex items-center gap-2 text-secondary/20">
                            <Activity size={10} />
                            <span className="text-[8px] font-black uppercase tracking-widest italic">REAL_TIME_MONITORING</span>
                        </div>
                    </div>

                    <div className="p-8 bg-card/10 border border-border/50 rounded-[2.5rem] shadow-xl group hover:bg-white hover:scale-[1.02] transition-all duration-500 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-accent/5 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-background transition-colors duration-500">
                                <Zap size={20} />
                            </div>
                            <span className="text-[9px] text-secondary/40 font-black uppercase tracking-[0.3em] italic group-hover:text-accent/60 transition-colors">PROJETS_DEPLOYES</span>
                        </div>
                        <p className="text-4xl font-black text-primary tracking-tighter italic uppercase">{stats.totalProjects}</p>
                        <div className="mt-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                            <span className="text-[8px] font-black text-accent uppercase tracking-widest italic">THREADS_ACTIFS</span>
                        </div>
                    </div>

                    <div className="p-8 bg-card/10 border border-border/50 rounded-[2.5rem] shadow-xl group hover:bg-white hover:scale-[1.02] transition-all duration-500 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/5 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-background transition-colors duration-500">
                                <MessageSquare size={20} />
                            </div>
                            <span className="text-[9px] text-secondary/40 font-black uppercase tracking-[0.3em] italic group-hover:text-emerald-600/60 transition-colors">COMMS_24H_LOG</span>
                        </div>
                        <p className="text-4xl font-black text-primary tracking-tighter italic uppercase">{stats.newMessages}</p>
                        <div className="mt-4 flex items-center gap-2 text-secondary/20">
                            <div className="h-px flex-1 bg-border/50" />
                            <span className="text-[8px] font-black uppercase tracking-widest italic">XFER_OK</span>
                        </div>
                    </div>
                </div>

                {/* Central Monitor */}
                <div className="lg:col-span-3 p-10 bg-card/30 border border-border/50 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/2 rounded-full blur-[100px] -mr-64 -mt-64 pointer-events-none" />

                    <div className="flex justify-between items-center mb-12 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:rotate-12 transition-transform duration-500">
                                <Activity size={20} />
                            </div>
                            <h3 className="text-primary font-heading font-black uppercase text-base tracking-tighter italic">
                                FLUX_ACTIVITE_TEMPS_REEL.
                            </h3>
                        </div>
                        <Link href="/admin/chat" className="group flex items-center gap-3 text-[10px] text-secondary/40 hover:text-primary uppercase tracking-[0.4em] font-black transition-all italic">
                            VOIR_TOUTES_OPS <ArrowUpRight className="w-3 h-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="space-y-4 relative z-10">
                        {recentMessages.length > 0 ? recentMessages.map((msg: RecentMessage) => (
                            <div key={msg.id} className="flex items-center gap-8 p-6 rounded-[1.8rem] bg-white/50 border border-transparent hover:border-border hover:bg-white hover:shadow-2xl hover:scale-[1.01] transition-all duration-500 group/item">
                                <span className="text-[10px] font-black text-secondary/20 w-20 group-hover/item:text-primary transition-colors italic tracking-widest">
                                    {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}_LOG
                                </span>
                                <div className="w-12 h-12 bg-background border border-border/50 rounded-xl flex items-center justify-center text-[9px] font-black text-secondary group-hover/item:bg-primary group-hover/item:text-background transition-all duration-500 shadow-inner">
                                    {msg.sender?.role === "ADMIN" ? "SYS" : "CLI"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-primary truncate leading-tight italic uppercase tracking-tight">{msg.text}</p>
                                    <p className="text-[8px] font-black text-secondary/30 uppercase tracking-[0.3em] mt-1 italic">
                                        NODE: {msg.project?.title?.split(' - ')[0] || "UNIT_EXTERNAL"}
                                    </p>
                                </div>
                                <div className="hidden md:flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 group-hover/item:animate-ping" />
                                    <span className="text-[9px] uppercase font-black text-secondary/20 group-hover/item:text-emerald-600 transition-colors italic tracking-widest">EN_DIRECT</span>
                                </div>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center h-64 text-secondary/20 bg-background/30 rounded-[2rem] border border-dashed border-border/50">
                                <AlertCircle size={48} className="mb-6 opacity-20" />
                                <span className="text-[10px] font-black uppercase tracking-[0.5em] italic">// AUCUNE_DONNEE_CAPTEE</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* System Status Side Panel */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Notifications Panel */}
                    <div className="p-8 bg-card/30 border border-border/50 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <h4 className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.4em] italic flex items-center gap-3">
                                <Bell size={14} className="group-hover:animate-bounce" /> NOTIF_FEED ({notifications.filter(n => !n.read).length})
                            </h4>
                        </div>
                        <div className="space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar relative z-10">
                            {notifications.length > 0 ? notifications.slice(0, 5).map((notification) => (
                                <div key={notification.id} className={cn(
                                    "p-6 rounded-[1.5rem] border transition-all duration-500 group/notif",
                                    notification.read ? 'bg-background/40 border-border/50 opacity-60' : 'bg-primary/5 border-primary/20 shadow-lg'
                                )}>
                                    <h5 className="text-[11px] font-black text-primary mb-2 uppercase italic tracking-tight">{notification.title}</h5>
                                    <p className="text-[10px] text-secondary/60 mb-4 leading-relaxed font-bold italic line-clamp-2">{notification.message}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[8px] font-black text-secondary/20 uppercase italic tracking-widest">
                                            {new Date(notification.createdAt).toLocaleDateString()}
                                        </span>
                                        {!notification.read && (
                                            <button className="text-[8px] text-primary hover:text-accent uppercase font-black tracking-widest transition-all italic underline underline-offset-4 decoration-primary/20">
                                                MARQUER_OK
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-10 opacity-20">
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] italic">// SILENCE_SYSTEME</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-8 bg-background border border-border/50 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-accent animate-pulse" />
                        <h4 className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.4em] mb-8 italic">DONNÉES_DYNAMIQUE_UX</h4>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center group cursor-help">
                                <span className="flex items-center gap-3 text-secondary/60 text-[10px] font-black uppercase tracking-widest italic group-hover:text-primary transition-colors"><Server size={12} /> DATABASE</span>
                                <span className="text-emerald-600 font-black uppercase text-[9px] tracking-widest italic animate-pulse">ALIVE_01</span>
                            </div>
                            <div className="flex justify-between items-center group cursor-help">
                                <span className="flex items-center gap-3 text-secondary/60 text-[10px] font-black uppercase tracking-widest italic group-hover:text-primary transition-colors"><FileText size={12} /> CONTRATS</span>
                                <span className="text-primary font-black uppercase text-[9px] tracking-widest italic">{stats.signedContracts}_SIG</span>
                            </div>
                            <div className="flex justify-between items-center group cursor-help">
                                <span className="flex items-center gap-3 text-secondary/60 text-[10px] font-black uppercase tracking-widest italic group-hover:text-primary transition-colors"><Globe size={12} /> GATEWAY</span>
                                <span className="text-accent font-black uppercase text-[9px] tracking-widest italic">XFER_READY</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-10 rounded-[2.5rem] bg-primary text-background shadow-2xl shadow-primary/20 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] mb-8 opacity-40 italic">ACTIONS_CRITIQUES</h4>
                        <div className="space-y-4 relative z-10">
                            <button className="w-full py-4 bg-background/10 hover:bg-background/20 text-background text-[11px] font-black uppercase tracking-[0.3em] rounded-[1.2rem] transition-all duration-500 border border-white/10 hover:shadow-2xl italic">
                                DÉPLOYER_STAGING
                            </button>
                            <button className="w-full py-4 bg-background/5 hover:bg-background/10 text-background text-[11px] font-black uppercase tracking-[0.3em] rounded-[1.2rem] transition-all duration-500 border border-white/5 italic">
                                PURGER_CACHE_X
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
