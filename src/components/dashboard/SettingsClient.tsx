"use client";

import { useState } from "react";
import { User, Lock, Bell, CreditCard, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import ProfileForm from "./ProfileForm";
import SecurityForm from "./SecurityForm";
import NotificationPreferences from "./NotificationPreferences";
import BillingHistory from "./BillingHistory";

import { User as UserType, Invoice } from "@prisma/client";

interface SettingsClientProps {
    user: UserType;
    invoices: (Invoice & { project?: { title: string } | null })[];
}

export default function SettingsClient({ user, invoices }: SettingsClientProps) {
    const [activeTab, setActiveTab] = useState("IDENTITÉ");

    const tabs = [
        { name: "IDENTITÉ", icon: User },
        { name: "SÉCURITÉ", icon: Lock },
        { name: "NOTIFICATIONS", icon: Bell },
        { name: "FACTURES", icon: CreditCard },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Navigation Sidebar */}
            <aside className="lg:col-span-1 space-y-4">
                <p className="px-6 text-[9px] font-black text-secondary/20 uppercase tracking-[0.6em] mb-6 italic">// PARAMÈTRES_NODES</p>
                {tabs.map((item, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveTab(item.name)}
                        className={cn(
                            "w-full flex items-center justify-between px-8 py-6 rounded-[2rem] text-[10px] uppercase font-black tracking-[0.3em] italic transition-all duration-500 group relative overflow-hidden",
                            activeTab === item.name
                                ? "bg-primary text-background shadow-2xl shadow-primary/20 scale-[1.05]"
                                : "text-secondary/30 hover:text-primary hover:bg-white border border-transparent hover:border-border/50 shadow-sm"
                        )}
                    >
                        <div className="flex items-center gap-5 relative z-10">
                            <item.icon size={18} className={activeTab === item.name ? "opacity-100" : "opacity-20 group-hover:opacity-100 transition-opacity"} />
                            {item.name}
                        </div>
                        {activeTab === item.name && <div className="w-1.5 h-1.5 rounded-full bg-background animate-ping" />}
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
                <div className="bg-white/40 backdrop-blur-3xl border border-border/50 rounded-[3.5rem] p-12 lg:p-16 shadow-2xl relative overflow-hidden group/card min-h-[600px]">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/2 rounded-full blur-[120px] -mr-80 -mt-80 pointer-events-none" />

                    <div className="relative z-10 animate-in fade-in slide-in-from-right-4 duration-500">
                        {activeTab === "IDENTITÉ" && user && (
                            <ProfileForm
                                user={{
                                    name: user.name,
                                    email: user.email,
                                    phone: user.phone,
                                    companyName: user.companyName,
                                    industry: user.industry
                                }}
                            />
                        )}

                        {activeTab === "SÉCURITÉ" && (
                            <SecurityForm email={user.email} />
                        )}

                        {activeTab === "NOTIFICATIONS" && (
                            <NotificationPreferences />
                        )}

                        {activeTab === "FACTURES" && (
                            <BillingHistory invoices={invoices} />
                        )}
                    </div>

                    {/* Scanline Effect */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 group-hover/card:opacity-[0.03] transition-opacity duration-700">
                        <div className="w-full h-[1px] bg-primary animate-scan-line" />
                    </div>
                </div>
            </div>
        </div>
    );
}
