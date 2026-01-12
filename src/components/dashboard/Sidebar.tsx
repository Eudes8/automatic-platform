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
    Briefcase
} from "lucide-react";

const CLIENT_NAV_ITEMS = [
    { label: "Vue d'ensemble", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Mon Projet", icon: FolderLock, href: "/dashboard/projects" },
    { label: "Messages", icon: MessageSquare, href: "/dashboard/chat" },
    { label: "Contrats", icon: FileText, href: "/dashboard/contracts" },
    { label: "Configuration", icon: Settings, href: "/dashboard/settings" },
];

const ADMIN_NAV_ITEMS = [
    { label: "Command Center", icon: LayoutDashboard, href: "/admin" },
    { label: "CRM Clients", icon: Users, href: "/admin/users" },
    { label: "Gestion Projets", icon: FolderLock, href: "/admin/projects" },
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
        <aside className="w-64 border-r border-white/5 flex flex-col bg-slate-900/50 backdrop-blur-xl h-screen">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white fill-current" />
                    </div>
                    <span className="font-black tracking-tighter uppercase italic">AUTOMATIC</span>
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                    // Check if we are inside a specific project context
                    const projectMatch = pathname.match(/\/dashboard\/projects\/([^\/]+)/);
                    const projectId = projectMatch ? projectMatch[1] : null;

                    let href = item.href;
                    let label = item.label;

                    // Dynamic Link Logic
                    if (projectId) {
                        if (item.href === "/dashboard/projects") {
                            // "Mon Projet" -> The specific project Overview
                            href = `/dashboard/projects/${projectId}`;
                            // label = "Vue Projet"; // Optional: change label
                        } else if (item.href === "/dashboard/chat") {
                            // "Messages" -> Project Chat
                            href = `/dashboard/projects/${projectId}/chat`;
                        } else if (item.href === "/dashboard/contracts") {
                            // "Contrats" -> Project Contracts
                            href = `/dashboard/projects/${projectId}/contracts`;
                        } else if (item.href === "/dashboard") {
                            // "Vue d'ensemble" -> Go back to global list? Or stay global.
                            // Let's keep /dashboard as the "Exit to List" button essentially.
                        }
                    }

                    // Active state calculation
                    let isActive = pathname === href;
                    // Handle "Mon Projet" active state when in sub-routes
                    if (projectId && item.href === "/dashboard/projects") {
                        isActive = pathname === `/dashboard/projects/${projectId}` || pathname === href;
                    }
                    // standard prefix check for other items if not in strict project mode
                    if (!projectId) {
                        isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                    }


                    return (
                        <Link
                            key={item.href} // Use original href as key to maintain stability
                            href={href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive
                                ? "bg-blue-600/10 text-blue-400 border border-blue-600/20"
                                : "text-slate-500 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-bold text-sm tracking-tight">{label}</span>
                            {isActive && <ChevronRight className="ml-auto w-4 h-4" />}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/5">
                {(() => {
                    const projectMatch = pathname.match(/\/dashboard\/projects\/([^\/]+)/);
                    const projectId = projectMatch ? projectMatch[1] : null;
                    const supportLink = projectId ? `/dashboard/projects/${projectId}/chat` : "/dashboard/chat";

                    return (
                        <div className="p-4 rounded-2xl bg-blue-600/5 border border-blue-500/10 mb-4 group cursor-pointer hover:bg-blue-600/10 transition-all">
                            <p className="text-[10px] font-black uppercase text-blue-500 tracking-[0.2em] mb-1 italic">Support Direct</p>
                            <p className="text-[11px] text-slate-400 leading-tight mb-3">Une question technique ? Nos experts vous répondent.</p>
                            <Link href={supportLink} className="block w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest text-center transition-all">
                                Ouvrir le Salon
                            </Link>
                        </div>
                    );
                })()}

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-black uppercase shadow-lg shrink-0">
                        {initials}
                    </div>
                    <div className="flex flex-col overflow-hidden flex-1">
                        <span className="text-[11px] font-black truncate text-white uppercase italic">{user?.name || "Client"}</span>
                        <span className="text-[9px] text-slate-500 truncate lowercase font-bold tracking-tight">{user?.email || "chargement..."}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                        title="Déconnexion"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
