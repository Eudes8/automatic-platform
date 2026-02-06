"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Bell,
    Check,
    CheckCheck,
    X,
    ExternalLink,
    Info,
    CheckCircle2,
    AlertTriangle,
    AlertCircle,
    Pocket,
    CreditCard,
    MessageSquare,
    Trash2,
    Clock
} from "lucide-react";
import {
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    getUnreadCount
} from "@/lib/actions/notifications";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Notification } from "@prisma/client";
import { toast } from "sonner";

export type NotificationType = "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "PROJECT" | "PAYMENT" | "CHAT";

import { formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

const TYPE_CONFIG: Record<NotificationType, { icon: any, color: string, bg: string, border: string }> = {
    INFO: { icon: Info, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    SUCCESS: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    WARNING: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    ERROR: { icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
    PROJECT: { icon: Pocket, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
    PAYMENT: { icon: CreditCard, color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
    CHAT: { icon: MessageSquare, color: "text-sky-500", bg: "bg-sky-500/10", border: "border-sky-500/20" },
};

export default function NotificationCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Grouping logic
    const groupedNotifications = useMemo(() => {
        const groups: Record<string, Notification[]> = {
            "Aujourd'hui": [],
            "Hier": [],
            "Plus tôt": []
        };

        notifications.forEach(notif => {
            const date = new Date(notif.createdAt);
            if (isToday(date)) groups["Aujourd'hui"].push(notif);
            else if (isYesterday(date)) groups["Hier"].push(notif);
            else groups["Plus tôt"].push(notif);
        });

        return Object.entries(groups).filter(([_, items]) => items.length > 0);
    }, [notifications]);

    const loadNotifications = async () => {
        setLoading(true);
        const data = await getUserNotifications();
        setNotifications(data);
        setLoading(false);
    };

    const loadUnreadCount = async () => {
        const count = await getUnreadCount();
        setUnreadCount(count);
    };

    useEffect(() => {
        loadNotifications();
        loadUnreadCount();

        // Real-time listener via Supabase
        const channel = supabase
            .channel('realtime_notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'Notification'
                },
                (payload) => {
                    const newNotif = payload.new as Notification;
                    setNotifications(prev => [newNotif, ...prev].slice(0, 50));
                    setUnreadCount(prev => prev + 1);

                    // Show Toast
                    const config = TYPE_CONFIG[newNotif.type as NotificationType || "INFO"];
                    toast(newNotif.title, {
                        description: newNotif.message,
                        action: newNotif.link ? {
                            label: "Voir",
                            onClick: () => router.push(newNotif.link!)
                        } : undefined,
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleMarkAsRead = async (notificationId: string, link?: string | null) => {
        await markAsRead(notificationId);
        setNotifications(prev => prev.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));

        if (link) {
            setIsOpen(false);
            router.push(link);
        }
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    const handleDelete = async (notificationId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        await deleteNotification(notificationId);
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        loadUnreadCount();
    };

    const handleClearAll = async () => {
        if (!confirm("Voulez-vous supprimer toutes vos notifications ?")) return;
        await deleteAllNotifications();
        setNotifications([]);
        setUnreadCount(0);
    };

    return (
        <div className="relative">
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-500 group overflow-hidden",
                    isOpen
                        ? "bg-primary text-background shadow-2xl shadow-primary/20 scale-105"
                        : "bg-background/80 backdrop-blur-xl border border-border/50 text-secondary/40 hover:text-primary hover:border-primary/20 shadow-sm"
                )}
            >
                <Bell size={20} className={cn("transition-transform duration-500 group-hover:rotate-12", isOpen && "animate-pulse")} />

                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute top-2.5 right-2.5 w-5 h-5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-lg border-2 border-background"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.span>
                    )}
                </AnimatePresence>
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-40 bg-black/5"
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ opacity: 0, y: 15, scale: 0.95, rotateX: -10 }}
                            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                            exit={{ opacity: 0, y: 15, scale: 0.95, rotateX: -10 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="absolute right-0 top-16 sm:top-20 w-[calc(100vw-2rem)] sm:w-[450px] max-h-[85vh] bg-white/95 backdrop-blur-2xl border border-border/50 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] z-50 flex flex-col overflow-hidden origin-top-right ring-1 ring-black/5"
                        >
                            {/* Header */}
                            <div className="p-8 pb-6 flex flex-col gap-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-2xl font-black text-primary uppercase tracking-tight leading-none">
                                            Flux d'Activité
                                        </h3>
                                        <p className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest mt-2">
                                            Centre de Commandement AUTOMATIC
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-3 hover:bg-black/5 rounded-full transition-colors text-secondary/20 hover:text-primary"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="flex items-center gap-3">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={handleMarkAllAsRead}
                                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-primary text-background rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
                                        >
                                            <CheckCheck size={14} />
                                            Tout marquer comme lu
                                        </button>
                                    )}
                                    {notifications.length > 0 && (
                                        <button
                                            onClick={handleClearAll}
                                            className="p-4 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-100 transition-colors group"
                                            title="Effacer tout"
                                        >
                                            <Trash2 size={16} className="group-hover:rotate-12 transition-transform" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* List Container */}
                            <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-8 custom-scrollbar scroll-smooth">
                                {loading ? (
                                    <div className="py-32 flex flex-col items-center justify-center gap-6">
                                        <div className="relative">
                                            <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-4 h-4 bg-primary rounded-full animate-ping" />
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em] animate-pulse">Synchronisation...</p>
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="py-32 text-center flex flex-col items-center justify-center">
                                        <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-8 border border-border/10 shadow-inner">
                                            <Bell className="w-10 h-10 text-secondary/10" />
                                        </div>
                                        <h4 className="text-xl font-black text-primary/20 uppercase tracking-tighter mb-2">Silence Radio</h4>
                                        <p className="text-[10px] font-bold text-secondary/10 uppercase tracking-widest">
                                            Aucune mise à jour disponible.
                                        </p>
                                    </div>
                                ) : (
                                    groupedNotifications.map(([group, items]) => (
                                        <div key={group} className="space-y-4">
                                            <div className="flex items-center gap-4 sticky top-0 bg-white/50 backdrop-blur-sm py-2 z-10 mx-[-24px] px-8">
                                                <span className="text-[10px] font-black text-secondary/30 uppercase tracking-[0.2em]">{group}</span>
                                                <div className="h-px flex-1 bg-border/20" />
                                            </div>

                                            <div className="space-y-3">
                                                {items.map((notif) => {
                                                    const config = TYPE_CONFIG[notif.type || "INFO"];
                                                    const Icon = config.icon;

                                                    return (
                                                        <motion.div
                                                            key={notif.id}
                                                            layout
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            onClick={() => handleMarkAsRead(notif.id, notif.link)}
                                                            className={cn(
                                                                "group relative p-5 rounded-[2rem] cursor-pointer transition-all duration-500 flex gap-4 border",
                                                                notif.read
                                                                    ? 'bg-slate-50/50 border-transparent hover:bg-slate-50'
                                                                    : 'bg-white border-border shadow-md hover:shadow-xl hover:scale-[1.01]'
                                                            )}
                                                        >
                                                            {/* Status Indicator Bar */}
                                                            {!notif.read && (
                                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-primary rounded-r-full" />
                                                            )}

                                                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm", config.bg, config.border)}>
                                                                <Icon className={cn("w-6 h-6", config.color)} />
                                                            </div>

                                                            <div className="flex-1 min-w-0 pr-8">
                                                                <div className="flex items-center gap-2 mb-1.5">
                                                                    <span className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border", config.bg, config.border, config.color)}>
                                                                        {notif.type}
                                                                    </span>
                                                                    <span className="text-[9px] font-bold text-secondary/30 flex items-center gap-1">
                                                                        <Clock size={10} />
                                                                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: fr })}
                                                                    </span>
                                                                </div>
                                                                <h4 className="text-sm font-bold text-primary tracking-tight mb-2 leading-snug">
                                                                    {notif.title}
                                                                </h4>
                                                                <p className="text-xs text-secondary/60 leading-relaxed line-clamp-2">
                                                                    {notif.message}
                                                                </p>
                                                            </div>

                                                            {/* Subtle Link Indicator */}
                                                            {notif.link && (
                                                                <div className="absolute right-5 top-1/2 -translate-y-1/2 p-2 bg-slate-50 rounded-full text-secondary/20 group-hover:text-primary group-hover:bg-primary/10 transition-all opacity-0 group-hover:opacity-100">
                                                                    <ExternalLink size={14} />
                                                                </div>
                                                            )}

                                                            <button
                                                                onClick={(e) => handleDelete(notif.id, e)}
                                                                className="absolute -right-2 -top-2 w-8 h-8 rounded-full bg-white border border-border shadow-lg flex items-center justify-center text-rose-500 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 hover:bg-rose-500 hover:text-white"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Sticky Footer Info */}
                            {notifications.length > 0 && (
                                <div className="p-6 bg-slate-50/80 backdrop-blur-md border-t border-border/30 flex items-center justify-between">
                                    <p className="text-[9px] font-black text-secondary/30 uppercase tracking-[0.3em]">
                                        Terminal v0.5.2-Alpha
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-success rounded-full animate-ping" />
                                        <span className="text-[9px] font-black text-success uppercase tracking-widest">Connecté</span>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
