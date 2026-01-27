"use client";

import { useState, useEffect } from "react";
import { Bell, Check, CheckCheck, X, ExternalLink } from "lucide-react";
import { getUserNotifications, markAsRead, markAllAsRead, deleteNotification, getUnreadCount } from "@/lib/actions/notifications";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
    id: string;
    title: string;
    message: string;
    link?: string | null;
    read: boolean;
    createdAt: Date;
}

export default function NotificationCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        loadNotifications();
        loadUnreadCount();

        // Poll for new notifications every 30 seconds
        const interval = setInterval(() => {
            loadUnreadCount();
            if (isOpen) {
                loadNotifications();
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [isOpen]);

    const loadNotifications = async () => {
        setLoading(true);
        const data = await getUserNotifications();
        setNotifications(data as any);
        setLoading(false);
    };

    const loadUnreadCount = async () => {
        const count = await getUnreadCount();
        setUnreadCount(count);
    };

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

    return (
        <div className="relative">
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-10 h-10 rounded-xl bg-background/50 border border-border/50 flex items-center justify-center hover:bg-white hover:border-primary/30 transition-all group"
            >
                <Bell size={18} className="text-secondary/40 group-hover:text-primary transition-colors" />

                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-lg"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                )}
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-40"
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 top-14 w-96 max-h-[600px] bg-white border border-border/50 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-border/30 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-black text-primary uppercase italic tracking-tight">
                                        Notifications
                                    </h3>
                                    <p className="text-[9px] font-bold text-secondary/40 uppercase tracking-widest mt-1">
                                        {unreadCount} non {unreadCount > 1 ? 'lues' : 'lue'}
                                    </p>
                                </div>

                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllAsRead}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary/20 transition-colors"
                                    >
                                        <CheckCheck size={12} />
                                        Tout lire
                                    </button>
                                )}
                            </div>

                            {/* List */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                                {loading ? (
                                    <div className="py-20 text-center">
                                        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="py-20 text-center">
                                        <Bell className="w-12 h-12 text-secondary/10 mx-auto mb-4" />
                                        <p className="text-[10px] font-black text-secondary/20 uppercase tracking-widest italic">
                                            Aucune notification
                                        </p>
                                    </div>
                                ) : (
                                    notifications.map((notif) => (
                                        <motion.div
                                            key={notif.id}
                                            layout
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            onClick={() => handleMarkAsRead(notif.id, notif.link)}
                                            className={`
                                                group relative p-4 rounded-2xl cursor-pointer transition-all
                                                ${notif.read
                                                    ? 'bg-slate-50 hover:bg-slate-100'
                                                    : 'bg-primary/5 border border-primary/10 hover:bg-primary/10'
                                                }
                                            `}
                                        >
                                            {/* Unread Indicator */}
                                            {!notif.read && (
                                                <div className="absolute top-4 left-2 w-2 h-2 bg-primary rounded-full animate-pulse" />
                                            )}

                                            <div className="flex items-start gap-3 ml-2">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-[11px] font-black text-primary uppercase italic tracking-tight mb-1">
                                                        {notif.title}
                                                    </h4>
                                                    <p className="text-[10px] font-bold text-secondary/60 leading-relaxed">
                                                        {notif.message}
                                                    </p>
                                                    <p className="text-[8px] font-black text-secondary/20 uppercase tracking-widest mt-2">
                                                        {new Date(notif.createdAt).toLocaleString()}
                                                    </p>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {notif.link && (
                                                        <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                                                            <ExternalLink size={12} className="text-primary" />
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={(e) => handleDelete(notif.id, e)}
                                                        className="w-6 h-6 rounded-lg bg-rose-100 flex items-center justify-center hover:bg-rose-200 transition-colors"
                                                    >
                                                        <X size={12} className="text-rose-500" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            {notifications.length > 0 && (
                                <div className="p-4 border-t border-border/30 text-center">
                                    <p className="text-[9px] font-black text-secondary/20 uppercase tracking-widest italic">
                                        {notifications.length} notification{notifications.length > 1 ? 's' : ''} au total
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
