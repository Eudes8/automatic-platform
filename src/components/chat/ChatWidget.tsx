"use client";

import { useChat } from "@/hooks/useChat";
import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Paperclip } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChatWidgetProps {
    currentUser: { id: string; name?: string | null };
}

export default function ChatWidget({ currentUser }: ChatWidgetProps) {
    const { messages, sendMessage, loading, isOpen, setIsOpen } = useChat();
    const [inputValue, setInputValue] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;
        const text = inputValue;
        setInputValue(""); // Clear immediately for UX
        try {
            await sendMessage(text);
        } catch (err) {
            console.error(err);
            setInputValue(text); // Restore on error
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            {/* Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="mb-4 w-[380px] h-[600px] bg-white/90 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto ring-1 ring-slate-900/5"
                    >
                        {/* Header */}
                        <div className="p-4 bg-white/80 border-b border-slate-100 flex justify-between items-center shadow-sm backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs ring-4 ring-white shadow-lg shadow-blue-500/20">
                                    AU
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-sm">Support AUTOMATIC</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-sm" />
                                        <span className="text-[10px] text-slate-500 font-medium">Réponse &lt; 5min</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/50" ref={scrollRef}>
                            {loading && (
                                <div className="flex justify-center py-8">
                                    <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                                </div>
                            )}

                            {!loading && messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-0 animate-in fade-in duration-700 fill-mode-forwards">
                                    <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center ring-1 ring-slate-100 shadow-sm">
                                        <MessageSquare className="text-slate-400" size={32} />
                                    </div>
                                    <div>
                                        <p className="text-slate-900 font-medium">Bonjour {currentUser.name?.split(' ')[0]} !</p>
                                        <p className="text-slate-500 text-sm mt-1 max-w-[200px] mx-auto leading-relaxed">
                                            Comment pouvons-nous vous aider à accélérer votre projet aujourd'hui ?
                                        </p>
                                    </div>
                                </div>
                            )}

                            {messages.map((msg, i) => {
                                const isMe = msg.senderId === currentUser.id;
                                return (
                                    <div
                                        key={msg.id || i}
                                        className={cn(
                                            "flex w-full animate-in slide-in-from-bottom-2 duration-300",
                                            isMe ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                                                isMe
                                                    ? "bg-blue-600 text-white rounded-br-none shadow-blue-500/20"
                                                    : "bg-white text-slate-700 rounded-bl-none border border-slate-100 shadow-slate-200/50"
                                            )}
                                        >
                                            <p>{msg.text}</p>
                                            <div className={cn("text-[10px] mt-1 opacity-60 text-right font-medium", isMe ? "text-blue-50" : "text-slate-400")}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white/80 border-t border-slate-100 backdrop-blur-md">
                            <form onSubmit={handleSend} className="relative flex items-center gap-2">
                                <button type="button" className="p-2 text-slate-400 hover:text-slate-900 transition-colors hover:bg-slate-100 rounded-lg">
                                    <Paperclip size={20} />
                                </button>
                                <input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Écrivez votre message..."
                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-900 placeholder:text-slate-400"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim()}
                                    className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
                                >
                                    <Send size={18} />
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
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                    "pointer-events-auto h-14 w-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 relative z-50 ring-4 ring-slate-950",
                    isOpen ? "bg-slate-800 text-white rotate-90" : "bg-blue-600 text-white hover:bg-blue-500"
                )}
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}

                {/* Notification Badge (Hidden if open) */}
                {!isOpen && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                    </span>
                )}
            </motion.button>
        </div>
    );
}
