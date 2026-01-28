"use client";

import { useState } from "react";
import { Bell, Shield, Mail, Tablet, Smartphone, Info, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface NotificationPreferencesProps {
    initialPrefs?: {
        projectReports: boolean;
        techSupport: boolean;
        systemAlerts: boolean;
        marketing: boolean;
    };
}

export default function NotificationPreferences({ initialPrefs }: NotificationPreferencesProps) {
    const [isPending, setIsPending] = useState(false);
    const [prefs, setPrefs] = useState(initialPrefs || {
        projectReports: true,
        techSupport: true,
        systemAlerts: true,
        marketing: false
    });

    const toggle = (key: keyof typeof prefs) => {
        setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
    };

    async function handleSave() {
        setIsPending(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 1000));
        setIsPending(false);
        toast.success("Préférences synchronisées", {
            description: "Vos canaux de communication ont été mis à jour.",
            className: "glass-premium rounded-2xl border-premium p-4 font-bold text-xs uppercase tracking-widest",
        });
    }

    const channels = [
        { key: "projectReports", label: "Rapports de Project", desc: "Suivi hebdomadaire et jalons franchis.", icon: Mail, color: "text-blue-500" },
        { key: "techSupport", label: "Assistance Technique", desc: "Réponses à vos tickets et discussions.", icon: Shield, color: "text-primary" },
        { key: "systemAlerts", label: "Alertes Système", desc: "Statut des serveurs et mises à jour critiques.", icon: Tablet, color: "text-amber-500" },
        { key: "marketing", label: "News & Releases", desc: "Nouvelles fonctionnalités et offres exclusives.", icon: Info, color: "text-emerald-500" },
    ] as const;

    return (
        <div className="space-y-12 relative z-10">
            {/* Section Header */}
            <div className="flex items-center gap-5 mb-10">
                <div className="w-12 h-12 rounded-[1.2rem] bg-primary/5 border border-primary/20 flex items-center justify-center text-primary">
                    <Bell size={24} />
                </div>
                <div>
                    <h3 className="text-3xl font-black text-primary italic uppercase tracking-tighter leading-none">
                        NOTIFICATIONS.
                    </h3>
                    <p className="text-[9px] font-black text-secondary/30 uppercase tracking-[0.3em] mt-2 italic">Canaux de communication & protocoles d'alerte</p>
                </div>
            </div>

            <div className="grid gap-6">
                {channels.map((item) => (
                    <div
                        key={item.key}
                        onClick={() => toggle(item.key)}
                        className="flex justify-between items-center p-10 rounded-[2.5rem] bg-background/20 border border-transparent hover:border-border/50 hover:bg-white transition-all duration-500 group/toggle cursor-pointer shadow-sm"
                    >
                        <div className="flex items-center gap-6">
                            <div className={cn(
                                "w-12 h-12 rounded-[1.2rem] flex items-center justify-center bg-white border border-border/30 shadow-inner group-hover/toggle:scale-110 transition-transform duration-500",
                                item.color
                            )}>
                                <item.icon size={20} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-[11px] font-black text-primary uppercase tracking-[0.2em] italic">{item.label}</span>
                                <span className="text-[9px] font-black text-secondary/30 uppercase tracking-widest italic">{item.desc}</span>
                            </div>
                        </div>
                        <div className={cn(
                            "w-16 h-8 rounded-full flex items-center px-1.5 transition-all duration-500 shadow-inner",
                            prefs[item.key] ? "bg-primary shadow-primary/20" : "bg-secondary/10"
                        )}>
                            <div className={cn(
                                "w-5 h-5 rounded-full shadow-sm transition-all duration-500",
                                prefs[item.key] ? "bg-background ml-auto rotate-90" : "bg-white/40"
                            )} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-10 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={isPending}
                    className="px-12 py-6 bg-primary text-background font-black uppercase text-[11px] tracking-[0.4em] rounded-[2rem] shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-500 italic flex items-center gap-4 disabled:opacity-50"
                >
                    {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    SYNCHRONISER_FLAGS
                </button>
            </div>
        </div>
    );
}
