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
import { getUserNotifications } from "@/lib/actions/notifications";
import { Bell, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = 'force-dynamic';

type RecentMessage = {
    id: string;
    text: string;
    createdAt: string | Date;
    sender?: { role: string | null };
    project?: { title: string };
};

export default async function AdminDashboard() {
    const stats = await getAdminStats();
    const activeProjects = await getAllChatChannels(); // Get recent activity
    const recentMessages = activeProjects.flatMap((p) =>
        p.messages.map((m) => ({
            ...m,
            createdAt: m.createdAt.toISOString ? m.createdAt.toISOString() : m.createdAt,
            project: { title: p.title }
        }))
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

    const notifications = await getUserNotifications();

    return (
        <div className="min-h-screen bg-background p-4 sm:p-6 md:p-10 lg:p-14 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Admin Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 sm:gap-8 md:gap-10 mb-8 sm:mb-12 md:mb-16 pb-6 sm:pb-8 md:pb-12 border-b border-border/50">
                <div className="space-y-4 sm:space-y-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-accent animate-pulse shadow-[0_0_10px_rgba(79,70,229,0.3)]" />
                        <span className="text-[9px] sm:text-[10px] font-black text-accent uppercase tracking-[0.2em] sm:tracking-[0.3em] italic">Tableau de bord administrateur</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-heading font-black text-primary uppercase tracking-tighter italic leading-[0.85] sm:leading-[0.8]">
                        GESTION <br /><span className="text-secondary/20 tracking-normal">GÉNÉRALE.</span>
                    </h1>
                </div>
                <div className="flex gap-6 sm:gap-8 md:gap-10 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-secondary/40 italic">
                    <div className="flex flex-col items-end">
                        <span className="opacity-50 mb-1">HEURE</span>
                        <span className="text-primary font-mono">{new Date().toLocaleTimeString('fr-FR')}</span>
                    </div>
                    <div className="flex flex-col items-end border-l border-border/50 pl-6 sm:pl-8 md:pl-10">
                        <span className="opacity-50 mb-1">STATUT</span>
                        <span className="text-emerald-600 font-mono">OPÉRATIONNEL</span>
                    </div>
                </div>
            </header>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-10 mb-8 sm:mb-12">
                {/* KPI Tickers */}
                <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                    <div className="p-5 sm:p-6 md:p-8 bg-card/10 border border-border/50 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] shadow-xl group hover:bg-white hover:scale-[1.02] transition-all duration-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-primary/2 rounded-full blur-3xl -mr-10 -mt-10 sm:-mr-12 sm:-mt-12 md:-mr-16 md:-mt-16" />
                        <div className="flex justify-between items-start mb-4 sm:mb-6">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background transition-colors duration-500">
                                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <span className="text-[8px] sm:text-[9px] text-secondary/40 font-black uppercase tracking-[0.25em] sm:tracking-[0.3em] italic group-hover:text-primary/60 transition-colors">CHIFFRE D'AFFAIRES</span>
                        </div>
                        <p className="text-2xl sm:text-3xl md:text-4xl font-black text-primary tracking-tighter italic uppercase">{new Intl.NumberFormat('fr-FR').format(stats.totalRevenue)} FCFA</p>
                        <div className="mt-3 sm:mt-4 flex items-center gap-2">
                            <span className="text-[7px] sm:text-[8px] font-black text-emerald-600 uppercase tracking-widest italic">+12.4% CROISSANCE</span>
                        </div>
                    </div>

                    <div className="p-5 sm:p-6 md:p-8 bg-card/10 border border-border/50 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] shadow-xl group hover:bg-white hover:scale-[1.02] transition-all duration-500 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4 sm:mb-6">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-secondary/5 flex items-center justify-center text-secondary group-hover:bg-primary group-hover:text-background transition-colors duration-500">
                                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <span className="text-[8px] sm:text-[9px] text-secondary/40 font-black uppercase tracking-[0.25em] sm:tracking-[0.3em] italic group-hover:text-primary/60 transition-colors">BASE CLIENTS</span>
                        </div>
                        <p className="text-2xl sm:text-3xl md:text-4xl font-black text-primary tracking-tighter italic uppercase">{stats.totalUsers}</p>
                        <div className="mt-3 sm:mt-4 flex items-center gap-2 text-secondary/20">
                            <Activity className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                            <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest italic">Activité en direct</span>
                        </div>
                    </div>

                    <div className="p-5 sm:p-6 md:p-8 bg-card/10 border border-border/50 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] shadow-xl group hover:bg-white hover:scale-[1.02] transition-all duration-500 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4 sm:mb-6">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-accent/5 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-background transition-colors duration-500">
                                <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <span className="text-[8px] sm:text-[9px] text-secondary/40 font-black uppercase tracking-[0.25em] sm:tracking-[0.3em] italic group-hover:text-accent/60 transition-colors">PROJETS ACTIFS</span>
                        </div>
                        <p className="text-2xl sm:text-3xl md:text-4xl font-black text-primary tracking-tighter italic uppercase">{stats.totalProjects}</p>
                        <div className="mt-3 sm:mt-4 flex items-center gap-2">
                            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-accent animate-pulse" />
                            <span className="text-[7px] sm:text-[8px] font-black text-accent uppercase tracking-widest italic">PROJETS EN PRODUCTION</span>
                        </div>
                    </div>

                    <div className="p-5 sm:p-6 md:p-8 bg-card/10 border border-border/50 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] shadow-xl group hover:bg-white hover:scale-[1.02] transition-all duration-500 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4 sm:mb-6">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-500/5 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-background transition-colors duration-500">
                                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <span className="text-[8px] sm:text-[9px] text-secondary/40 font-black uppercase tracking-[0.25em] sm:tracking-[0.3em] italic group-hover:text-emerald-600/60 transition-colors">MESSAGES RÉCENTS</span>
                        </div>
                        <p className="text-2xl sm:text-3xl md:text-4xl font-black text-primary tracking-tighter italic uppercase">{stats.newMessages}</p>
                        <div className="mt-3 sm:mt-4 flex items-center gap-2 text-secondary/20">
                            <div className="h-px flex-1 bg-border/50" />
                            <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest italic">SYNC OK</span>
                        </div>
                    </div>
                </div>

                {/* Central Monitor */}
                <div className="lg:col-span-3 p-6 sm:p-8 md:p-10 bg-card/30 border border-border/50 rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] bg-primary/2 rounded-full blur-[80px] sm:blur-[100px] -mr-40 -mt-40 sm:-mr-52 sm:-mt-52 md:-mr-64 md:-mt-64 pointer-events-none" />

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-8 sm:mb-12 relative z-10">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:rotate-12 transition-transform duration-500">
                                <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <h3 className="text-primary font-heading font-black uppercase text-sm sm:text-base tracking-tighter italic">
                                ACTIVITÉ RÉCENTE DE LA PLATEFORME.
                            </h3>
                        </div>
                        <Link href="/admin/chat" className="group flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] text-secondary/40 hover:text-primary uppercase tracking-[0.3em] sm:tracking-[0.4em] font-black transition-all italic">
                            VOIR TOUTE L'ACTIVITÉ <ArrowUpRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="space-y-3 sm:space-y-4 relative z-10">
                        {recentMessages.length > 0 ? recentMessages.map((msg: RecentMessage) => (
                            <div key={msg.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 md:gap-8 p-4 sm:p-6 rounded-[1.2rem] sm:rounded-[1.5rem] md:rounded-[1.8rem] bg-white/50 border border-transparent hover:border-border hover:bg-white hover:shadow-2xl hover:scale-[1.01] transition-all duration-500 group/item">
                                <span className="text-[9px] sm:text-[10px] font-black text-secondary/20 w-full sm:w-20 group-hover/item:text-primary transition-colors italic tracking-widest">
                                    {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-background border border-border/50 rounded-xl flex items-center justify-center text-[8px] sm:text-[9px] font-black text-secondary group-hover/item:bg-primary group-hover/item:text-background transition-all duration-500 shadow-inner">
                                    {msg.sender?.role === "ADMIN" ? "SYS" : "CLI"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm font-bold text-primary truncate leading-tight italic uppercase tracking-tight">{msg.text}</p>
                                    <p className="text-[7px] sm:text-[8px] font-black text-secondary/30 uppercase tracking-[0.25em] sm:tracking-[0.3em] mt-1 italic">
                                        PROJET: {msg.project?.title?.split(' - ')[0] || "SUPPORT GÉNÉRAL"}
                                    </p>
                                </div>
                                <div className="hidden md:flex items-center gap-2 sm:gap-3">
                                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500" />
                                    <span className="text-[8px] sm:text-[9px] uppercase font-black text-secondary/20 italic tracking-widest">En direct</span>
                                </div>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center h-48 sm:h-56 md:h-64 text-secondary/20 bg-background/30 rounded-[1.5rem] sm:rounded-[2rem] border border-dashed border-border/50">
                                <AlertCircle className="w-9 h-9 sm:w-12 sm:h-12 mb-4 sm:mb-6 opacity-20" />
                                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] sm:tracking-[0.5em] italic">// AUCUNE ACTIVITÉ DÉTECTÉE</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* System Status Side Panel */}
                <div className="lg:col-span-1 space-y-4 sm:space-y-6 md:space-y-8">
                    {/* Notifications Panel */}
                    <div className="p-5 sm:p-6 md:p-8 bg-card/30 border border-border/50 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                        <div className="flex justify-between items-center mb-5 sm:mb-6 md:mb-8 relative z-10">
                            <h4 className="text-[9px] sm:text-[10px] font-black text-secondary/40 uppercase tracking-[0.3em] sm:tracking-[0.4em] italic flex items-center gap-2 sm:gap-3">
                                <Bell className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:animate-bounce" /> NOTIFICATIONS ({notifications.filter(n => !n.read).length})
                            </h4>
                        </div>
                        <div className="space-y-3 sm:space-y-4 max-h-[250px] sm:max-h-[300px] md:max-h-[350px] overflow-y-auto custom-scrollbar relative z-10">
                            {notifications.length > 0 ? notifications.slice(0, 5).map((notification) => (
                                <div key={notification.id} className={cn(
                                    "p-4 sm:p-5 md:p-6 rounded-[1rem] sm:rounded-[1.2rem] md:rounded-[1.5rem] border transition-all duration-500 group/notif",
                                    notification.read ? 'bg-background/40 border-border/50 opacity-60' : 'bg-primary/5 border-primary/20 shadow-lg'
                                )}>
                                    <h5 className="text-[10px] sm:text-[11px] font-black text-primary mb-1.5 sm:mb-2 uppercase italic tracking-tight">{notification.title}</h5>
                                    <p className="text-[9px] sm:text-[10px] text-secondary/60 mb-3 sm:mb-4 leading-relaxed font-bold italic line-clamp-2">{notification.message}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[7px] sm:text-[8px] font-black text-secondary/20 uppercase italic tracking-widest">
                                            {new Date(notification.createdAt).toLocaleDateString()}
                                        </span>
                                        {!notification.read && (
                                            <button className="text-[7px] sm:text-[8px] text-primary hover:text-accent uppercase font-black tracking-widest transition-all italic underline underline-offset-4 decoration-primary/20">
                                                MARQUER COMME LU
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-6 sm:py-8 md:py-10 opacity-20">
                                    <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.25em] sm:tracking-[0.3em] italic">// AUCUNE NOTIFICATION</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-5 sm:p-6 md:p-8 bg-background border border-border/50 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-accent animate-pulse" />
                        <h4 className="text-[9px] sm:text-[10px] font-black text-secondary/40 uppercase tracking-[0.3em] sm:tracking-[0.4em] mb-5 sm:mb-6 md:mb-8 italic">ÉTAT DES SERVICES</h4>
                        <div className="space-y-4 sm:space-y-6">
                            <div className="flex justify-between items-center group cursor-help">
                                <span className="flex items-center gap-2 sm:gap-3 text-secondary/60 text-[9px] sm:text-[10px] font-black uppercase tracking-widest italic group-hover:text-primary transition-colors"><Server className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> BASE DE DONNÉES</span>
                                <span className="text-emerald-600 font-black uppercase text-[8px] sm:text-[9px] tracking-widest italic animate-pulse">EN LIGNE</span>
                            </div>
                            <div className="flex justify-between items-center group cursor-help">
                                <span className="flex items-center gap-2 sm:gap-3 text-secondary/60 text-[9px] sm:text-[10px] font-black uppercase tracking-widest italic group-hover:text-primary transition-colors"><FileText className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> CONTRATS</span>
                                <span className="text-primary font-black uppercase text-[8px] sm:text-[9px] tracking-widest italic">{stats.signedContracts}_SIG</span>
                            </div>
                            <div className="flex justify-between items-center group cursor-help">
                                <span className="flex items-center gap-2 sm:gap-3 text-secondary/60 text-[9px] sm:text-[10px] font-black uppercase tracking-widest italic group-hover:text-primary transition-colors"><Globe className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> PASSERELLE API</span>
                                <span className="text-accent font-black uppercase text-[8px] sm:text-[9px] tracking-widest italic">PRÊTE</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 sm:p-8 md:p-10 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] bg-primary text-background shadow-2xl shadow-primary/20 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <h4 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] mb-5 sm:mb-6 md:mb-8 opacity-40 italic">ACTIONS SYSTÈME</h4>
                        <div className="space-y-3 sm:space-y-4 relative z-10">
                            <button className="w-full py-3 sm:py-4 bg-background/10 hover:bg-background/20 text-background text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em] sm:tracking-[0.3em] rounded-[1rem] sm:rounded-[1.2rem] transition-all duration-500 border border-white/10 hover:shadow-2xl italic">
                                DÉPLOYER STAGING
                            </button>
                            <button className="w-full py-3 sm:py-4 bg-background/5 hover:bg-background/10 text-background text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em] sm:tracking-[0.3em] rounded-[1rem] sm:rounded-[1.2rem] transition-all duration-500 border border-white/5 italic">
                                ACTUALISER CACHE
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

