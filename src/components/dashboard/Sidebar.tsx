"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
    LayoutDashboard,
    MessageSquare,
    FileText,
    FolderLock,
    Settings,
    Zap,
    ChevronRight,
    LogOut,
    Users,
    Briefcase,
    Receipt,
    HelpCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { Logo } from "../shared/Logo";

const CLIENT_NAV_ITEMS = [
    { label: "VUE_D'ENSEMBLE", icon: LayoutDashboard, href: "/dashboard" },
    { label: "MAINFRAME_PROJET", icon: FolderLock, href: "/dashboard/projects" },
    { label: "CANAL_COMMUNICATION", icon: MessageSquare, href: "/dashboard/chat" },
    { label: "PROTOCOLES_LÉGAUX", icon: FileText, href: "/dashboard/contracts" },
    { label: "FACTURATION_SYSTEM", icon: Receipt, href: "/dashboard/invoices" },
    { label: "UNITÉ_SUPPORT", icon: HelpCircle, href: "/dashboard/tickets" },
    { label: "PARAMÈTRES_SYSTÈME", icon: Settings, href: "/dashboard/settings" },
];

const ADMIN_NAV_ITEMS = [
    { label: "COMMAND_CENTER", icon: LayoutDashboard, href: "/admin" },
    { label: "CRM_MAINFRAME", icon: Users, href: "/admin/users" },
    { label: "OPS_ENGINE", icon: FolderLock, href: "/admin/projects" },
    { label: "TICKET_STATION", icon: HelpCircle, href: "/admin/tickets" },
    { label: "FINANCIAL_SYSTEM", icon: Receipt, href: "/admin/invoices" },
    { label: "ARCHIVES_NEXUS", icon: Briefcase, href: "/admin/portfolio" },
    { label: "CENTRAL_COMMS", icon: MessageSquare, href: "/admin/chat" },
];

interface SidebarProps {
    user?: any;
}

export default function Sidebar({ user }: SidebarProps) {
    const pathname = usePathname();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = "/login";
    };

    const initials = user?.name
        ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
        : "??";

    const isAdmin = pathname.startsWith("/admin");
    const navItems = isAdmin ? ADMIN_NAV_ITEMS : CLIENT_NAV_ITEMS;

    return (
        <aside className="w-80 bg-background border-r border-border/50 flex flex-col h-screen relative z-50 overflow-hidden shadow-2xl">
            {/* Serious Tech Background element */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_40px] pointer-events-none opacity-20" />

            {/* Logo Section */}
            <div className="p-8 border-b border-border/50 flex items-center justify-between relative z-10">
                <Link href="/" className="flex items-center gap-4 group">
                    <Logo />
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-6 space-y-3 overflow-y-auto custom-scrollbar relative z-10">
                <p className="px-4 text-[9px] font-black text-secondary/40 uppercase tracking-[0.4em] mb-6 mt-2 italic">// Core_Navigation</p>
                {navItems.map((item) => {
                    const projectMatch = pathname.match(/\/dashboard\/projects\/([^\/]+)/);
                    const projectId = projectMatch ? projectMatch[1] : null;

                    let href = item.href;
                    const label = item.label;

                    if (projectId) {
                        if (item.href === "/dashboard/projects") href = `/dashboard/projects/${projectId}`;
                        else if (item.href === "/dashboard/chat") href = `/dashboard/projects/${projectId}/chat`;
                        else if (item.href === "/dashboard/contracts") href = `/dashboard/projects/${projectId}/contracts`;
                    }

                    let isActive = pathname === href;
                    if (projectId && item.href === "/dashboard/projects") {
                        isActive = pathname === `/dashboard/projects/${projectId}` || pathname === href;
                    }
                    if (!projectId) {
                        isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                    }

                    return (
                        <Link
                            key={item.href}
                            href={href}
                            className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-500 group relative overflow-hidden ${isActive
                                ? "bg-primary/5 border border-primary/20 text-primary shadow-lg shadow-primary/5"
                                : "text-secondary/60 hover:text-primary hover:bg-primary/[0.02] border border-transparent"
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="nav-active"
                                    className="absolute inset-0 bg-primary/[0.03] -z-10"
                                />
                            )}

                            <item.icon className={`w-4 h-4 transition-all duration-300 ${isActive ? "text-primary" : "text-secondary/40 group-hover:text-primary"
                                }`} />

                            <span className="font-black text-[10px] uppercase tracking-[0.2em] italic">
                                {label}
                            </span>

                            {isActive && (
                                <div className="ml-auto w-1 h-1 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile & Actions */}
            <div className="p-6 border-t border-border/50 bg-card/30 backdrop-blur-md relative z-10">
                <div className="mb-6">
                    <div className="p-4 rounded-2xl bg-primary text-background flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform cursor-pointer group">
                        <div className="p-2 bg-background/20 rounded-lg">
                            <Zap className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-black uppercase tracking-widest italic">Signal_Urgence</p>
                            <p className="text-[8px] font-black opacity-60 uppercase tracking-widest leading-none mt-0.5">Priorité_Alpha : On</p>
                        </div>
                        <ChevronRight className="w-4 h-4 opacity-40 group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>

                <div className="flex items-center gap-4 pl-1">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-black uppercase shadow-inner italic">
                        {initials}
                    </div>
                    <div className="flex flex-col overflow-hidden flex-1">
                        <span className="text-[11px] font-black text-primary truncate uppercase italic tracking-tight">{user?.name || "Invité"}</span>
                        <span className="text-[9px] text-secondary/40 truncate font-mono uppercase tracking-widest">{user?.role || "Inconnu"}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-3 hover:bg-red-500/10 rounded-xl text-secondary/20 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20"
                        title="Purger la session"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
