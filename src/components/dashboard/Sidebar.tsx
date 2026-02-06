"use client";

import React from "react";
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
    HelpCircle,
    Menu,
    X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "../shared/Logo";
import NotificationCenter from "./NotificationCenter";

const CLIENT_NAV_ITEMS = [
    { label: "TABLEAU DE BORD", icon: LayoutDashboard, href: "/dashboard" },
    { label: "MES PROJETS", icon: FolderLock, href: "/dashboard/projects" },
    { label: "MESSAGERIE", icon: MessageSquare, href: "/dashboard/chat" },
    { label: "DOCUMENTS PROJETS", icon: FileText, href: "/dashboard/contracts" },
    { label: "FACTURES & PAIEMENTS", icon: Receipt, href: "/dashboard/invoices" },
    { label: "SUPPORT TECHNIQUE", icon: HelpCircle, href: "/dashboard/tickets" },
    { label: "PARAMÈTRES PROFIL", icon: Settings, href: "/dashboard/settings" },
];

const ADMIN_NAV_ITEMS = [
    { label: "SYSTÈME CENTRAL", icon: LayoutDashboard, href: "/admin" },
    { label: "BASE CLIENTS", icon: Users, href: "/admin/users" },
    { label: "PROJETS ACTIFS", icon: FolderLock, href: "/admin/projects" },
    { label: "ASSISTANCE TICKETS", icon: HelpCircle, href: "/admin/tickets" },
    { label: "FACTURES & REVENUS", icon: Receipt, href: "/admin/invoices" },
    { label: "VITRINE PROJETS", icon: Briefcase, href: "/admin/portfolio" },
    { label: "MESSAGERIE INTERNE", icon: MessageSquare, href: "/admin/chat" },
];

import { User } from "@prisma/client";

interface SidebarProps {
    user?: User | null;
}

export default function Sidebar({ user }: SidebarProps) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = "/login";
    };

    const initials = user?.name
        ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
        : "AC";

    const isAdmin = pathname.startsWith("/admin");
    const navItems = isAdmin ? ADMIN_NAV_ITEMS : CLIENT_NAV_ITEMS;

    return (
        <>
            {/* Mobile Menu Button - More compact on extra small screens */}
            <button
                className="lg:hidden fixed top-3 left-3 z-[70] p-2.5 bg-background border border-border/50 rounded-lg shadow-lg active:scale-95 transition-transform"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
                {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[50]"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`
                fixed lg:static top-0 left-0 h-screen bg-background border-r border-border/50 flex flex-col relative z-[60] transition-all duration-300 ease-in-out
                ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                w-[280px] sx:w-72 sm:w-80
            `}>
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-20" />

                {/* Logo Section */}
                <div className="p-4 sm:p-6 md:p-8 border-b border-border/50 flex items-center justify-between relative z-10">
                    <Link href="/" className="flex items-center gap-3 sm:gap-4 group" onClick={() => setIsMobileMenuOpen(false)}>
                        <Logo />
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 sm:p-6 space-y-2 sm:space-y-3 overflow-y-auto custom-scrollbar relative z-10">
                    <p className="px-3 sm:px-4 text-[9px] sm:text-[10px] font-bold text-secondary/40 uppercase tracking-widest mb-4 sm:mb-6 mt-2">Menu</p>
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
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-500 group relative overflow-hidden ${isActive
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

                                <span className="font-black text-[9px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.2em] italic">
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
                <div className="p-4 sm:p-6 border-t border-border/50 bg-card/30 backdrop-blur-md relative z-10">
                    <div className="mb-4 sm:mb-6">
                        <Link href="/dashboard/tickets" className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-primary text-background flex items-center gap-2 sm:gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform cursor-pointer group">
                            <div className="p-1.5 sm:p-2 bg-background/20 rounded-lg">
                                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-bold uppercase tracking-wider">Aide & Support</p>
                                <p className="text-[8px] font-bold opacity-60 uppercase tracking-wide leading-none mt-0.5">Une question ?</p>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-40 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 pl-0 sm:pl-1">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-[10px] sm:text-xs font-black uppercase shadow-inner italic">
                            {initials}
                        </div>
                        <div className="flex flex-col overflow-hidden flex-1">
                            <span className="text-[10px] sm:text-[11px] font-bold text-primary truncate uppercase tracking-tight">{user?.name || "Mon Compte"}</span>
                            <span className="text-[8px] sm:text-[9px] text-secondary/40 truncate font-bold uppercase tracking-widest">{user?.role === 'ADMIN' ? 'Administrateur' : 'Espace Client'}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 sm:p-3 hover:bg-red-500/10 rounded-xl text-secondary/20 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20"
                            title="Déconnexion"
                        >
                            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
