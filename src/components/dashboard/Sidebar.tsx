"use client";

import Link from "next/link";
import Image from "next/image";
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

const CLIENT_NAV_ITEMS = [
    { label: "Vue d'ensemble", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Mon Projet", icon: FolderLock, href: "/dashboard/projects" },
    { label: "Messages", icon: MessageSquare, href: "/dashboard/chat" },
    { label: "Contrats", icon: FileText, href: "/dashboard/contracts" },
    { label: "Support", icon: HelpCircle, href: "/dashboard/tickets" },
    { label: "Configuration", icon: Settings, href: "/dashboard/settings" },
];

const ADMIN_NAV_ITEMS = [
    { label: "Command Center", icon: LayoutDashboard, href: "/admin" },
    { label: "CRM Clients", icon: Users, href: "/admin/users" },
    { label: "Gestion Projets", icon: FolderLock, href: "/admin/projects" },
    { label: "Support Tickets", icon: HelpCircle, href: "/admin/tickets" },
    { label: "Facturation", icon: Receipt, href: "/admin/invoices" },
    { label: "Gestion Portfolio", icon: Briefcase, href: "/admin/portfolio" },
    { label: "Messagerie", icon: MessageSquare, href: "/admin/chat" },
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
        <aside className="w-80 bg-white/80 backdrop-blur-xl border-r border-slate-200 flex flex-col h-screen relative z-50 shadow-sm">
            {/* Logo Section */}
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-4 group">
                    <div className="relative w-10 h-10 flex items-center justify-center">
                        <Image
                            src="/logo.svg"
                            alt="Automatic Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <div>
                        <h3 className="text-xl font-heading font-bold text-slate-900 tracking-tight">Automatic</h3>
                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Console v2.0</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-2">Menu Principal</p>
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
                            className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 group relative overflow-hidden ${isActive
                                ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100"
                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
                                }`}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full" />
                            )}

                            <item.icon className={`w-5 h-5 transition-all duration-300 ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                                }`} />

                            <span className="font-medium text-sm tracking-wide">
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile & Actions */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 backdrop-blur-md">
                {(() => {
                    const projectMatch = pathname.match(/\/dashboard\/projects\/([^\/]+)/);
                    const projectId = projectMatch ? projectMatch[1] : null;
                    const supportLink = projectId ? `/dashboard/projects/${projectId}/chat` : "/dashboard/chat";

                    return (
                        <Link href={supportLink} className="group relative block w-full p-4 mb-6 rounded-2xl bg-white border border-slate-200 overflow-hidden hover:border-blue-400 hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="p-2 bg-blue-600 rounded-lg text-white shadow-md shadow-blue-500/20">
                                    <Zap className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-slate-900 font-bold text-xs uppercase tracking-wider">Support VIP</p>
                                    <p className="text-[10px] text-slate-500">Réponse &lt; 5 min</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-400 ml-auto group-hover:translate-x-1 group-hover:text-blue-500 transition-all" />
                            </div>
                        </Link>
                    );
                })()}

                <div className="flex items-center gap-3 pl-1">
                    <div className="w-10 h-10 rounded-full bg-slate-200 border border-white flex items-center justify-center text-slate-600 text-xs font-black uppercase shadow-sm">
                        {initials}
                    </div>
                    <div className="flex flex-col overflow-hidden flex-1">
                        <span className="text-sm font-bold truncate text-slate-900">{user?.name || "Client"}</span>
                        <span className="text-[10px] text-slate-500 truncate font-mono">{user?.email}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                        title="Déconnexion"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
