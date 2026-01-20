import { getCurrentUser } from "@/lib/actions/users";
import { User, Lock, Bell, CreditCard, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    const user = await getCurrentUser();

    return (
        <div className="max-w-7xl mx-auto space-y-16 p-10 lg:p-14 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-border/50 pb-12">
                <div>
                    <div className="flex items-center gap-3 mb-5">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
                        <p className="text-[10px] text-primary/40 font-black uppercase tracking-[0.5em] italic">STATION_CONFIG // NODE_ACTIVE</p>
                    </div>
                    <h1 className="text-6xl md:text-7xl font-black text-primary italic uppercase tracking-tighter leading-none">
                        PROFIL <span className="text-secondary/20">& SETTINGS.</span>
                    </h1>
                    <p className="text-secondary/40 font-black text-[10px] uppercase tracking-[0.4em] mt-5 italic max-w-xl leading-relaxed">
                        // PERSONNALISATION_DES_INTERFACES_DE_PILOTAGE_UNITÉ. <br />
                        LES_CHANGEMENTS_SONT_PROPAGÉS_EN_TEMPS_RÉEL_SUR_LE_RÉSEAU.
                    </p>
                </div>

                <div className="flex flex-col items-end gap-3 text-right">
                    <div className="flex items-center gap-4 px-6 py-4 bg-primary/5 border border-primary/20 rounded-[1.5rem] italic">
                        <Shield size={16} className="text-emerald-500" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">NIVEAU_SÉCURITÉ: ALPHA_STABLE</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Navigation Sidebar */}
                <aside className="lg:col-span-1 space-y-4">
                    <p className="px-6 text-[9px] font-black text-secondary/20 uppercase tracking-[0.6em] mb-6 italic">// PARAMÈTRES_NODES</p>
                    {[
                        { name: "IDENTITÉ_RÉSEAU", icon: User, active: true },
                        { name: "SÉCURITÉ_PROTOCOLE", icon: Lock },
                        { name: "FLUX_NOTIFICATIONS", icon: Bell },
                        { name: "UNITÉ_FACTURATION", icon: CreditCard },
                    ].map((item, i) => (
                        <button
                            key={i}
                            className={`w-full flex items-center justify-between px-8 py-6 rounded-[2rem] text-[10px] uppercase font-black tracking-[0.3em] italic transition-all duration-500 group relative overflow-hidden ${item.active
                                ? "bg-primary text-background shadow-2xl shadow-primary/20 scale-[1.05]"
                                : "text-secondary/30 hover:text-primary hover:bg-white border border-transparent hover:border-border/50 shadow-sm"}`}
                        >
                            <div className="flex items-center gap-5 relative z-10">
                                <item.icon size={18} className={item.active ? "opacity-100" : "opacity-20 group-hover:opacity-100 transition-opacity"} />
                                {item.name}
                            </div>
                            {item.active && <div className="w-1.5 h-1.5 rounded-full bg-background animate-ping" />}
                        </button>
                    ))}

                    <div className="mt-16 p-8 bg-white/40 backdrop-blur-3xl border border-border/50 rounded-[2.5rem] shadow-xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary/30">
                                <Shield size={20} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-secondary/40 uppercase tracking-widest italic">SYSTÈME_INTÉGRITÉ</p>
                                <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest italic mt-0.5">VÉRIFIÉ_ET_SCELLÉ</p>
                            </div>
                        </div>
                        <div className="h-[2px] bg-background rounded-full overflow-hidden border border-border/50">
                            <div className="h-full bg-primary w-[92%] shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-12">
                    <div className="bg-white/40 backdrop-blur-3xl border border-border/50 rounded-[3.5rem] p-12 lg:p-16 shadow-2xl relative overflow-hidden group/card">
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/2 rounded-full blur-[120px] -mr-80 -mt-80 pointer-events-none" />

                        <div className="space-y-12 relative z-10">
                            <div className="flex items-center gap-5 mb-8">
                                <div className="w-12 h-12 rounded-[1.2rem] bg-primary/5 border border-primary/20 flex items-center justify-center text-primary animate-pulse">
                                    <Zap size={24} />
                                </div>
                                <h3 className="text-3xl font-black text-primary italic uppercase tracking-tighter leading-none">
                                    IDENTITY <span className="text-secondary/20">Buffer.</span>
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.4em] ml-4 italic">NOM_D_ENTITÉ_UNIQUE</label>
                                    <div className="p-8 rounded-[2.5rem] bg-background/50 border border-border/50 text-primary font-black uppercase text-[13px] italic tracking-widest shadow-inner group-hover/card:bg-white transition-all duration-700">
                                        {user?.name || "NON_IDENTIFIÉ"}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.4em] ml-4 italic">CANAL_MAIL_SÉCURISÉ</label>
                                    <div className="p-8 rounded-[2.5rem] bg-background/50 border border-border/50 text-primary font-black uppercase text-[13px] italic tracking-widest shadow-inner group-hover/card:bg-white transition-all duration-700">
                                        {user?.email || "NODATA@AUTOMATIC.COM"}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-16 border-t border-border/30 space-y-10">
                                <div className="flex items-center gap-5 mb-8">
                                    <div className="w-12 h-12 rounded-[1.2rem] bg-primary/5 border border-primary/20 flex items-center justify-center text-primary/40">
                                        <Bell size={24} />
                                    </div>
                                    <h3 className="text-3xl font-black text-primary italic uppercase tracking-tighter leading-none">
                                        COMM_SYNC <span className="text-secondary/20">Protocole.</span>
                                    </h3>
                                </div>

                                <div className="grid gap-6">
                                    {[
                                        { label: "LOGS_DÉPLOIEMENT_SPRINT", desc: "Suivi technique de l'exécution hebdomadaire.", active: true },
                                        { label: "COMM_UNITÉ_SUPPORT", desc: "Interconnexion directe avec les techniciens.", active: true },
                                        { label: "RAPPORTS_SYSTÈME_CRITIQUE", desc: "Analyses de débit et alertes de performance.", active: false }
                                    ].map((item, i) => (
                                        <div key={i} className="flex justify-between items-center p-8 rounded-[2.5rem] bg-background/20 border border-transparent hover:border-border/50 hover:bg-white transition-all duration-500 group/toggle cursor-pointer shadow-sm">
                                            <div className="flex flex-col gap-2">
                                                <span className="text-[11px] font-black text-primary uppercase tracking-[0.2em] italic">{item.label}</span>
                                                <span className="text-[9px] font-black text-secondary/30 uppercase tracking-widest italic">{item.desc}</span>
                                            </div>
                                            <div className={cn(
                                                "w-16 h-8 rounded-full flex items-center px-2 transition-all duration-500 shadow-inner",
                                                item.active ? "bg-primary shadow-primary/20" : "bg-secondary/10"
                                            )}>
                                                <div className={cn(
                                                    "w-4 h-4 rounded-full shadow-sm transition-all duration-500",
                                                    item.active ? "bg-background ml-auto rotate-90" : "bg-white/40"
                                                )} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Actions Area */}
                        <div className="mt-20 pt-16 border-t border-border/30 flex flex-col sm:flex-row justify-between items-center gap-8 relative z-10">
                            <button className="w-full sm:w-auto px-12 py-6 bg-primary text-background font-black uppercase text-[11px] tracking-[0.4em] rounded-[2rem] shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-500 italic">
                                PROPAGER_CHANGEMENTS_OK
                            </button>
                            <button className="w-full sm:w-auto px-12 py-6 bg-accent/5 hover:bg-accent text-accent hover:text-background font-black uppercase text-[11px] tracking-[0.4em] rounded-[2rem] border border-accent/20 transition-all duration-500 italic group/purge">
                                <span className="group-hover/purge:animate-pulse">PURGER_INSTANCE_PROFIL</span>
                            </button>
                        </div>

                        {/* Scanline Effect */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 group-hover/card:opacity-[0.03] transition-opacity duration-700">
                            <div className="w-full h-[1px] bg-primary animate-scan-line" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
