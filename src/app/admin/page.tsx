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
import { getAllProjectsWithMessages } from "@/lib/actions/adminChat";

export default async function AdminDashboard() {
    const stats = await getAdminStats();
    const activeProjects = await getAllProjectsWithMessages(); // Get recent activity
    const recentMessages = activeProjects.flatMap(p => p.messages).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

    return (
        <div className="min-h-screen bg-background p-8 text-secondary font-sans transition-colors">
            {/* Admin Header - Industrial/Cyber Look Updated */}
            <header className="flex justify-between items-end border-b border-border pb-8 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />
                        <span className="text-[10px] font-bold text-green-500 uppercase tracking-[0.3em]">Système Opérationnel</span>
                    </div>
                    <h1 className="text-5xl font-heading font-bold text-primary uppercase tracking-tighter">Nexus <span className="text-blue-500">Contrôle.</span></h1>
                </div>
                <div className="hidden md:flex gap-8 text-[11px] font-bold uppercase tracking-widest text-secondary/40">
                    <div className="flex flex-col items-end">
                        <span>Heure Serveur</span>
                        <span className="text-primary">{new Date().toLocaleTimeString('fr-FR')} UTC</span>
                    </div>
                    <div className="flex flex-col items-end border-l border-border pl-8">
                        <span>Latence</span>
                        <span className="text-green-500">24ms</span>
                    </div>
                </div>
            </header>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">

                {/* KPI Tickers */}
                <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="glass-premium p-6 rounded-2xl border border-blue-500/10">
                        <div className="flex justify-between items-start mb-4">
                            <BarChart3 className="w-5 h-5 text-blue-500" />
                            <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Revenus Totaux</span>
                        </div>
                        <p className="text-3xl font-heading font-bold text-primary tracking-tighter">{stats.totalRevenue}€</p>
                    </div>
                    <div className="glass-premium p-6 rounded-2xl">
                        <div className="flex justify-between items-start mb-4">
                            <Users className="w-5 h-5 text-secondary" />
                            <span className="text-[10px] text-secondary/60 font-bold uppercase tracking-widest">Clients Actifs</span>
                        </div>
                        <p className="text-3xl font-heading font-bold text-primary tracking-tighter">{stats.totalUsers}</p>
                    </div>
                    <div className="glass-premium p-6 rounded-2xl border border-orange-500/10">
                        <div className="flex justify-between items-start mb-4">
                            <Zap className="w-5 h-5 text-orange-500" />
                            <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">Projets en Cours</span>
                        </div>
                        <p className="text-3xl font-heading font-bold text-primary tracking-tighter">{stats.totalProjects}</p>
                    </div>
                    <div className="glass-premium p-6 rounded-2xl border border-green-500/10">
                        <div className="flex justify-between items-start mb-4">
                            <MessageSquare className="w-5 h-5 text-green-500" />
                            <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Messages (24h)</span>
                        </div>
                        <p className="text-3xl font-heading font-bold text-primary tracking-tighter">{stats.newMessages}</p>
                    </div>
                </div>

                {/* Central Monitor */}
                <div className="lg:col-span-3 glass-premium p-8 rounded-[2.5rem] min-h-[450px]">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-primary font-heading font-bold uppercase text-sm tracking-widest flex items-center gap-2">
                            <Activity className="w-4 h-4 text-primary" /> Flux d'Activité en Direct
                        </h3>
                        <Link href="/admin/chat" className="text-[10px] text-primary/40 hover:text-primary uppercase tracking-[0.2em] font-black flex items-center gap-1 transition-colors">
                            Voir toutes les opérations <ArrowUpRight className="w-3 h-3" />
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {recentMessages.length > 0 ? recentMessages.map((msg: any) => (
                            <div key={msg.id} className="flex items-center gap-6 p-4 rounded-xl hover:bg-primary/5 transition-all group border border-transparent hover:border-border">
                                <span className="text-[10px] font-bold text-secondary/40 w-20">{new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                                <div className="w-9 h-9 bg-primary/5 rounded-lg flex items-center justify-center text-[10px] font-black text-secondary group-hover:text-primary transition-colors">
                                    {msg.sender?.role === "ADMIN" ? "SYS" : "CLI"}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-secondary group-hover:text-primary truncate transition-colors">{msg.text}</p>
                                </div>
                                <span className="text-[10px] uppercase font-bold text-blue-500/50 group-hover:text-blue-500 transition-colors">
                                    {msg.project?.title?.split(' - ')[0] || "Inconnu"}
                                </span>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center h-48 text-secondary/20">
                                <AlertCircle className="w-8 h-8 mb-4 " />
                                <span className="text-xs font-bold uppercase tracking-[0.2em]">Aucune activité récente détectée</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* System Status Side Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-premium p-6 rounded-2xl">
                        <h4 className="text-[10px] font-bold text-secondary/40 uppercase tracking-[0.2em] mb-6">Données Réseau</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-xs">
                                <span className="flex items-center gap-2 text-secondary/60"><Server className="w-3 h-3" /> Database</span>
                                <span className="text-green-500 font-bold uppercase text-[10px]">Active</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="flex items-center gap-2 text-secondary/60"><FileText className="w-3 h-3" /> Contrats</span>
                                <span className="text-primary font-bold uppercase text-[10px]">{stats.signedContracts}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="flex items-center gap-2 text-secondary/60"><Globe className="w-3 h-3" /> API Gateway</span>
                                <span className="text-green-500 font-bold uppercase text-[10px]">Stonks</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-primary text-background shadow-2xl shadow-primary/10">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 opacity-40">Actions Système</h4>
                        <div className="space-y-3">
                            <button className="w-full py-3 bg-background/10 hover:bg-background/20 text-background text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all">
                                Déployer Staging
                            </button>
                            <button className="w-full py-3 bg-background/5 hover:bg-background/10 text-background text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all">
                                Purger Cache
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
