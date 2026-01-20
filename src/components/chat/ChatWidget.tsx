"use client";

import { useChat } from "@/hooks/useChat";
import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Paperclip, RefreshCw, Check, CheckCheck, AlertCircle, Wifi, WifiOff, Search, File } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { format, isSameDay, isToday, isYesterday } from "date-fns";
import { fr } from "date-fns/locale";

interface ChatWidgetProps {
    currentUser: { id: string; name?: string | null };
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
    const getReadReceipt = (msg: any) => {
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
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="mb-6 w-[440px] h-[750px] bg-background/80 backdrop-blur-3xl border border-border/50 rounded-[3rem] shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
                    >
                        {/* Header */}
                        <div className="p-8 bg-card/30 border-b border-border/50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

                            <div className="flex justify-between items-start relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-primary/5 border border-primary/10 flex items-center justify-center text-primary font-black text-xs shadow-inner italic">
                                        AU
                                    </div>
                                    <div>
                                        <h3 className="font-heading font-black text-xl text-primary italic uppercase tracking-tighter leading-none mb-1">UNITÉ_COMMS.</h3>
                                        <div className="flex items-center gap-3">
                                            <span className={cn(
                                                "w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.5)]",
                                                isConnected ? "bg-emerald-500" : "bg-accent"
                                            )} />
                                            <span className="text-[9px] font-black text-secondary/40 uppercase tracking-[0.3em] italic">
                                                {isConnected ? "NODE_ACTIF" : "SYNC_AUTO_LOOP"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setShowSearch(!showSearch)}
                                        className="p-3 text-secondary/40 hover:text-primary transition-all hover:bg-primary/5 rounded-xl border border-transparent hover:border-primary/10"
                                        title="Rechercher_Node"
                                    >
                                        <Search size={16} />
                                    </button>
                                    <button
                                        onClick={handleRefresh}
                                        disabled={isRefreshing}
                                        className="p-3 text-secondary/40 hover:text-primary transition-all hover:bg-primary/5 rounded-xl border border-transparent hover:border-primary/10 disabled:opacity-50"
                                        title="Sync_Buffer"
                                    >
                                        <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
                                    </button>
                                </div>
                            </div>

                            {showSearch && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="mt-6"
                                >
                                    <input
                                        type="text"
                                        placeholder="FILTRER_LOGS..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-secondary/5 border border-border/50 rounded-2xl px-5 py-3 text-[10px] font-black uppercase tracking-widest text-primary placeholder:text-secondary/20 focus:outline-none focus:border-primary/30 italic"
                                    />
                                </motion.div>
                            )}
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar bg-transparent scroll-smooth" ref={scrollRef}>
                            {loading && (
                                <div className="flex flex-col items-center justify-center py-12 gap-4">
                                    <RefreshCw className="w-8 h-8 text-primary/20 animate-spin" />
                                    <span className="text-[9px] font-black text-secondary/20 uppercase tracking-[0.4em] italic">FETCHING_REMOTE_LOGS...</span>
                                </div>
                            )}

                            {!loading && filteredMessages.length === 0 && !showSearch && (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-8 p-10 bg-card/10 border border-dashed border-border/50 rounded-[2.5rem]">
                                    <div className="w-20 h-20 rounded-[1.5rem] bg-primary/5 flex items-center justify-center shadow-inner border border-primary/10">
                                        <MessageSquare className="text-secondary/20" size={32} />
                                    </div>
                                    <div>
                                        <p className="text-primary font-black uppercase text-xl italic tracking-tighter mb-4">Initialisation_Session.</p>
                                        <p className="text-secondary/40 text-[10px] uppercase font-black tracking-[0.3em] leading-relaxed italic max-w-xs mx-auto">
                                            // Protocole d'assistance actif.<br />
                                            En attente de commandes utilisateur.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {Object.entries(filteredGroupedMessages).map(([date, msgs]) => (
                                <div key={date} className="space-y-4">
                                    <div className="flex items-center gap-4 py-4">
                                        <div className="flex-1 h-px bg-border/30" />
                                        <span className="text-[8px] text-secondary/30 font-black uppercase tracking-[0.5em] italic">
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
                                                    "flex flex-col max-w-[85%]",
                                                    isMe ? "items-end" : "items-start"
                                                )}>
                                                    <div
                                                        className={cn(
                                                            "rounded-[1.5rem] px-6 py-4 text-[13px] font-bold leading-relaxed shadow-xl",
                                                            isMe
                                                                ? "bg-primary text-background rounded-br-none italic"
                                                                : "bg-card/40 text-primary rounded-bl-none border border-border/50",
                                                            msg.status === 'sending' && "opacity-70 animate-pulse",
                                                            isFailed && "border-accent border-2"
                                                        )}
                                                    >
                                                        <p className="break-words select-text selection:bg-background/20">{msg.text}</p>
                                                    </div>

                                                    <div className={cn(
                                                        "flex items-center gap-3 mt-2 px-2 text-[8px] font-black uppercase tracking-widest italic opacity-40 group-hover:opacity-100 transition-opacity",
                                                        isMe ? "justify-end text-primary" : "justify-start text-secondary/40"
                                                    )}>
                                                        <span>{formatTime(msg.createdAt)}</span>
                                                        {isMe && getReadReceipt(msg)}
                                                        {isFailed && (
                                                            <div title={msg.error} className="flex items-center gap-1 text-accent">
                                                                <AlertCircle size={10} />
                                                                <span>SEND_ERROR</span>
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
                        <div className="p-8 bg-card/30 border-t border-border/50">
                            {/* File Preview Label */}
                            <AnimatePresence>
                                {fileInputRef.current?.files?.[0] && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="mb-4 px-6 py-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                <File size={14} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-primary uppercase tracking-widest italic truncate max-w-[200px]">
                                                    {fileInputRef.current.files[0].name.toUpperCase()}
                                                </p>
                                                <p className="text-[7px] font-black text-emerald-500 uppercase tracking-widest italic">READY_FOR_XFER</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (fileInputRef.current) fileInputRef.current.value = "";
                                                setLocalError(null);
                                            }}
                                            className="text-primary/20 hover:text-accent transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={handleSend} className="flex items-center gap-4">
                                <button
                                    type="button"
                                    disabled={isSending}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={cn(
                                        "p-4 transition-all hover:scale-110 rounded-2xl border shadow-inner",
                                        fileInputRef.current?.files?.[0]
                                            ? "bg-primary text-background border-primary"
                                            : "bg-secondary/5 text-secondary/40 border-transparent hover:border-primary/10"
                                    )}
                                    title="PROTOCOL_ATTACH"
                                >
                                    <Paperclip size={20} className={fileInputRef.current?.files?.[0] ? "animate-pulse" : ""} />
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
                                    placeholder={isSending ? "XFER_DATA..." : "ENTER_QUERY..."}
                                    disabled={isSending}
                                    className="flex-1 bg-secondary/5 border border-border/50 rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] italic focus:outline-none focus:border-primary/30 transition-all text-primary placeholder:text-secondary/20 shadow-inner"
                                />
                                <button
                                    type="submit"
                                    disabled={(!inputValue.trim() && !fileInputRef.current?.files?.[0]) || isSending}
                                    className={cn(
                                        "p-4 rounded-2xl bg-primary text-background transition-all shadow-xl shadow-primary/20 hover:scale-110 active:scale-90 disabled:opacity-50 disabled:grayscale",
                                        isSending && "animate-pulse"
                                    )}
                                    title="CMD_EXECUTE"
                                >
                                    <Send size={20} />
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
                    "pointer-events-auto h-20 w-20 rounded-[2rem] shadow-2xl flex items-center justify-center transition-all duration-500 relative z-50 border border-primary/20",
                    isOpen
                        ? "bg-background text-primary rotate-180"
                        : "bg-primary text-background"
                )}
            >
                <div className="relative">
                    {isOpen ? <X size={28} /> : <MessageSquare size={28} />}

                    {!isOpen && messages.some(m => !m.read && m.senderId !== currentUser.id) && (
                        <span className="absolute -top-4 -right-4 flex h-6 w-6">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-6 w-6 bg-accent text-background text-[10px] font-black flex items-center justify-center italic tracking-tighter shadow-lg shadow-accent/40 border-2 border-primary">
                                {messages.filter(m => !m.read && m.senderId !== currentUser.id).length}
                            </span>
                        </span>
                    )}
                </div>
            </motion.button>
        </div>
    );
}
