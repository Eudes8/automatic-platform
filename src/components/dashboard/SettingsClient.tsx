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
        { name: "IDENTITÉ", label: "Profil", icon: User },
        { name: "SÉCURITÉ", label: "Sécurité", icon: Lock },
        { name: "NOTIFICATIONS", label: "Notifications", icon: Bell },
        { name: "FACTURES", label: "Factures", icon: CreditCard },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-12">
            {/* Navigation Sidebar */}
            <aside className="lg:col-span-1 space-y-3 sm:space-y-4">
                <p className="px-4 sm:px-6 text-[8px] sm:text-[9px] font-bold text-secondary/20 uppercase tracking-widest mb-4 sm:mb-6">Configuration</p>
                {tabs.map((item, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveTab(item.name)}
                        className={cn(
                            "w-full flex items-center justify-between px-5 sm:px-8 py-4 sm:py-6 rounded-[1.5rem] sm:rounded-[2rem] text-[9px] sm:text-[10px] uppercase font-bold tracking-widest transition-all duration-500 group relative overflow-hidden",
                            activeTab === item.name
                                ? "bg-primary text-background shadow-2xl shadow-primary/20 scale-[1.02] sm:scale-[1.05]"
                                : "text-secondary/30 hover:text-primary hover:bg-white border border-transparent hover:border-border/50 shadow-sm"
                        )}
                    >
                        <div className="flex items-center gap-3 sm:gap-5 relative z-10">
                            <item.icon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                            {item.label}
                        </div>
                        {activeTab === item.name && <div className="w-1.5 h-1.5 rounded-full bg-background animate-ping" />}
                    </button>
                ))}

                <div className="mt-10 sm:mt-16 p-5 sm:p-8 bg-white/40 backdrop-blur-3xl border border-border/50 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-xl">
                    <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary/30">
                            <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div>
                            <p className="text-[8px] sm:text-[9px] font-bold text-secondary/40 uppercase tracking-widest">Intégrité du compte</p>
                            <p className="text-[7px] sm:text-[8px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">Vérifié</p>
                        </div>
                    </div>
                    <div className="h-[2px] bg-background rounded-full overflow-hidden border border-border/50">
                        <div className="h-full bg-primary w-[92%] shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-8 sm:space-y-12">
                <div className="bg-white/40 backdrop-blur-3xl border border-border/50 rounded-[2rem] sm:rounded-[3.5rem] p-6 sm:p-12 lg:p-16 shadow-2xl relative overflow-hidden group/card min-h-[400px] sm:min-h-[600px]">
                    <div className="absolute top-0 right-0 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-primary/2 rounded-full blur-[80px] sm:blur-[120px] -mr-40 sm:-mr-80 -mt-40 sm:-mt-80 pointer-events-none" />

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
