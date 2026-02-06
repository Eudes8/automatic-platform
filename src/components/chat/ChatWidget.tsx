"use client";

import { useChat, Message } from "@/hooks/useChat";
import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Paperclip, RefreshCw, Check, CheckCheck, AlertCircle, Wifi, WifiOff, Search, File } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { format, isSameDay, isToday, isYesterday } from "date-fns";
import { fr } from "date-fns/locale";

import { User } from "@prisma/client";

interface ChatWidgetProps {
    currentUser: User;
}

export default function ChatWidget({ currentUser }: ChatWidgetProps) {
    const { messages, sendMessage, loading, isOpen, setIsOpen, refreshMessages, conversation, isConnected } = useChat();
    const [inputValue, setInputValue] = useState("");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || isSending) return;

        const text = inputValue;
        setInputValue("");
        setLocalError(null);
        setIsSending(true);

        try {
            await sendMessage(text);
        } catch (err) {
            setLocalError("Erreur lors de l'envoi du message");
            setInputValue(text);
            console.error(err);
        } finally {
            setIsSending(false);
        }
    };

    const handleRefresh = async () => {
        if (!conversation) return;
        setIsRefreshing(true);
        try {
            await refreshMessages(conversation.id);
        } catch (error) {
            console.error("Error refreshing messages:", error);
        } finally {
            setIsRefreshing(false);
        }
    };

    // Get read receipt icon
    const getReadReceipt = (msg: Message) => {
        if (msg.status === 'sending') return null;
        if (msg.status === 'read') return <CheckCheck size={14} className="text-blue-400" />;
        if (msg.status === 'delivered') return <CheckCheck size={14} className="text-slate-400" />;
        return <Check size={14} className="text-slate-400" />;
    };

    // Format time
    const formatTime = (date: string) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Format date separators
    const formatDateSeparator = (date: string) => {
        const msgDate = new Date(date);
        if (isToday(msgDate)) return "Aujourd'hui";
        if (isYesterday(msgDate)) return "Hier";
        return msgDate.toLocaleDateString('fr-FR', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    // Group messages by date
    const groupedMessages = messages.reduce((acc, msg) => {
        const date = new Date(msg.createdAt).toLocaleDateString('fr-FR');
        if (!acc[date]) acc[date] = [];
        acc[date].push(msg);
        return acc;
    }, {} as Record<string, typeof messages>);

    // Filter messages by search
    const filteredMessages = showSearch ? messages.filter(m =>
        m.text.toLowerCase().includes(searchQuery.toLowerCase())
    ) : messages;

    const filteredGroupedMessages = filteredMessages.reduce((acc, msg) => {
        const date = new Date(msg.createdAt).toLocaleDateString('fr-FR');
        if (!acc[date]) acc[date] = [];
        acc[date].push(msg);
        return acc;
    }, {} as Record<string, typeof filteredMessages>);

    return (
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col items-end pointer-events-none">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="mb-4 sm:mb-6 w-[calc(100vw-2rem)] sm:w-[440px] h-[70vh] sm:h-[750px] bg-background/80 backdrop-blur-3xl border border-border/50 rounded-[2rem] sm:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
                    >
                        {/* Header */}
                        <div className="p-4 sm:p-6 md:p-8 bg-card/30 border-b border-border/50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

                            <div className="flex justify-between items-start relative z-10">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-[1.2rem] sm:rounded-[1.5rem] bg-primary/5 border border-primary/10 flex items-center justify-center text-primary font-bold text-[10px] sm:text-xs shadow-inner">
                                        AC
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg sm:text-xl text-primary tracking-tight leading-none mb-0.5 sm:mb-1">Support Client</h3>
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <span className={cn(
                                                "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.5)]",
                                                isConnected ? "bg-emerald-500" : "bg-accent"
                                            )} />
                                            <span className="text-[8px] sm:text-[9px] font-bold text-secondary/40 uppercase tracking-widest">
                                                {isConnected ? "En ligne" : "Hors ligne"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <button
                                        onClick={() => setShowSearch(!showSearch)}
                                        className="p-2 sm:p-3 text-secondary/40 hover:text-primary transition-all hover:bg-primary/5 rounded-xl border border-transparent hover:border-primary/10"
                                        title="Rechercher"
                                    >
                                        <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    </button>
                                    <button
                                        onClick={handleRefresh}
                                        disabled={isRefreshing}
                                        className="p-2 sm:p-3 text-secondary/40 hover:text-primary transition-all hover:bg-primary/5 rounded-xl border border-transparent hover:border-primary/10 disabled:opacity-50"
                                        title="Actualiser"
                                    >
                                        <RefreshCw className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", isRefreshing && "animate-spin")} />
                                    </button>
                                </div>
                            </div>

                            {showSearch && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="mt-4 sm:mt-6"
                                >
                                    <input
                                        type="text"
                                        placeholder="RECHERCHER..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-secondary/5 border border-border/50 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-primary placeholder:text-secondary/20 focus:outline-none focus:border-primary/30"
                                    />
                                </motion.div>
                            )}
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-3 sm:space-y-4 custom-scrollbar bg-transparent scroll-smooth" ref={scrollRef}>
                            {loading && (
                                <div className="flex flex-col items-center justify-center py-8 sm:py-12 gap-3 sm:gap-4">
                                    <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 text-primary/20 animate-spin" />
                                    <span className="text-[8px] sm:text-[9px] font-bold text-secondary/20 uppercase tracking-widest">Chargement...</span>
                                </div>
                            )}

                            {!loading && filteredMessages.length === 0 && !showSearch && (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-6 sm:space-y-8 p-6 sm:p-8 md:p-10 bg-card/10 border border-dashed border-border/50 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem]">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.2rem] sm:rounded-[1.5rem] bg-primary/5 flex items-center justify-center shadow-inner border border-primary/10">
                                        <MessageSquare className="text-secondary/20 w-6 h-6 sm:w-8 sm:h-8" />
                                    </div>
                                    <div>
                                        <p className="text-primary font-bold uppercase text-lg sm:text-xl tracking-tight mb-3 sm:mb-4">Démarrer une discussion</p>
                                        <p className="text-secondary/40 text-[9px] sm:text-[10px] uppercase font-bold tracking-widest leading-relaxed max-w-xs mx-auto">
                                            Posez vos questions à notre équipe.<br />
                                            Nous vous répondrons dès que possible.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {Object.entries(filteredGroupedMessages).map(([date, msgs]) => (
                                <div key={date} className="space-y-3 sm:space-y-4">
                                    <div className="flex items-center gap-3 sm:gap-4 py-3 sm:py-4">
                                        <div className="flex-1 h-px bg-border/30" />
                                        <span className="text-[7px] sm:text-[8px] text-secondary/30 font-black uppercase tracking-[0.4em] sm:tracking-[0.5em] italic">
                                            {formatDateSeparator(date)}
                                        </span>
                                        <div className="flex-1 h-px bg-border/30" />
                                    </div>

                                    {msgs.map((msg, i) => {
                                        const isMe = msg.senderId === currentUser.id;
                                        const isFailed = msg.error;
                                        return (
                                            <motion.div
                                                key={msg.id || i}
                                                initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className={cn(
                                                    "flex w-full group",
                                                    isMe ? "justify-end" : "justify-start"
                                                )}
                                            >
                                                <div className={cn(
                                                    "flex flex-col max-w-[90%] sm:max-w-[85%]",
                                                    isMe ? "items-end" : "items-start"
                                                )}>
                                                    <div
                                                        className={cn(
                                                            "rounded-[1.2rem] sm:rounded-[1.5rem] px-4 sm:px-6 py-3 sm:py-4 text-[11px] sm:text-[13px] font-bold leading-relaxed shadow-xl",
                                                            isMe
                                                                ? "bg-primary text-background rounded-br-none"
                                                                : "bg-card/40 text-primary rounded-bl-none border border-border/50",
                                                            msg.status === 'sending' && "opacity-70 animate-pulse",
                                                            isFailed && "border-accent border-2"
                                                        )}
                                                    >
                                                        <p className="break-words select-text selection:bg-background/20">{msg.text}</p>
                                                    </div>

                                                    <div className={cn(
                                                        "flex items-center gap-2 sm:gap-3 mt-1.5 sm:mt-2 px-2 text-[7px] sm:text-[8px] font-bold uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity",
                                                        isMe ? "justify-end text-primary" : "justify-start text-secondary/40"
                                                    )}>
                                                        <span>{formatTime(msg.createdAt)}</span>
                                                        {isMe && getReadReceipt(msg)}
                                                        {isFailed && (
                                                            <div title={msg.error} className="flex items-center gap-1 text-accent">
                                                                <AlertCircle className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                                                                <span>Erreur d'envoi</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            ))}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 sm:p-6 md:p-8 bg-card/30 border-t border-border/50">
                            {/* File Preview Label */}
                            <AnimatePresence>
                                {fileInputRef.current?.files?.[0] && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="mb-3 sm:mb-4 px-4 sm:px-6 py-2.5 sm:py-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                <File className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                            </div>
                                            <div>
                                                <p className="text-[8px] sm:text-[9px] font-bold text-primary uppercase tracking-widest truncate max-w-[150px] sm:max-w-[200px]">
                                                    {fileInputRef.current.files[0].name.toUpperCase()}
                                                </p>
                                                <p className="text-[6px] sm:text-[7px] font-bold text-emerald-500 uppercase tracking-widest">PRÊT À L'ENVOI</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (fileInputRef.current) fileInputRef.current.value = "";
                                                setLocalError(null);
                                            }}
                                            className="text-primary/20 hover:text-accent transition-colors"
                                        >
                                            <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={handleSend} className="flex items-center gap-2 sm:gap-3 md:gap-4">
                                <button
                                    type="button"
                                    disabled={isSending}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={cn(
                                        "p-3 sm:p-4 transition-all hover:scale-110 rounded-xl sm:rounded-2xl border shadow-inner",
                                        fileInputRef.current?.files?.[0]
                                            ? "bg-primary text-background border-primary"
                                            : "bg-secondary/5 text-secondary/40 border-transparent hover:border-primary/10"
                                    )}
                                    title="Joindre un fichier"
                                >
                                    <Paperclip className={cn("w-4 h-4 sm:w-5 sm:h-5", fileInputRef.current?.files?.[0] ? "animate-pulse" : "")} />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    hidden
                                    onChange={() => {
                                        // Trigger re-render to show preview
                                        setLocalError(null);
                                    }}
                                />
                                <input
                                    value={inputValue}
                                    onChange={(e) => {
                                        setInputValue(e.target.value);
                                        setLocalError(null);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    placeholder={isSending ? "Envoi..." : "Tapez ici..."}
                                    disabled={isSending}
                                    className="flex-1 bg-secondary/5 border border-border/50 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-[11px] font-bold uppercase tracking-tight focus:outline-none focus:border-primary/30 transition-all text-primary placeholder:text-secondary/20 shadow-inner"
                                />
                                <button
                                    type="submit"
                                    disabled={(!inputValue.trim() && !fileInputRef.current?.files?.[0]) || isSending}
                                    className={cn(
                                        "p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-primary text-background transition-all shadow-xl shadow-primary/20 hover:scale-110 active:scale-90 disabled:opacity-50 disabled:grayscale",
                                        isSending && "animate-pulse"
                                    )}
                                    title="Envoyer"
                                >
                                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                layout
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={cn(
                    "pointer-events-auto h-16 w-16 sm:h-20 sm:w-20 rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl flex items-center justify-center transition-all duration-500 relative z-50 border border-primary/20",
                    isOpen
                        ? "bg-background text-primary rotate-180"
                        : "bg-primary text-background"
                )}
            >
                <div className="relative">
                    {isOpen ? <X className="w-6 h-6 sm:w-7 sm:h-7" /> : <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7" />}

                    {!isOpen && messages.some(m => !m.read && m.senderId !== currentUser.id) && (
                        <span className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 flex h-5 w-5 sm:h-6 sm:w-6">
                            <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-5 w-5 sm:h-6 sm:w-6 bg-accent text-background text-[9px] sm:text-[10px] font-bold flex items-center justify-center tracking-tighter shadow-lg shadow-accent/40 border-2 border-primary">
                                {messages.filter(m => !m.read && m.senderId !== currentUser.id).length}
                            </span>
                        </span>
                    )}
                </div>
            </motion.button>
        </div>
    );
}
