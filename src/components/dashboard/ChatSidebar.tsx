"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Paperclip, MoreVertical, Search, Phone, Video } from "lucide-react";

interface Message {
    id: string;
    sender: "client" | "staff" | "system";
    text: string;
    time: string;
}

import { getProjectMessages, sendChatMessage } from "@/lib/actions/messages";
import { supabase } from "@/lib/supabase";

export default function ChatSidebar({ projectId }: { projectId?: string }) {
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    const refreshMessages = async () => {
        if (!projectId) return;
        const data = await getProjectMessages(projectId);
        setMessages(data.map(m => ({
            id: m.id,
            sender: m.sender.role === "CLIENT" ? "client" : "staff",
            text: m.text,
            time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })));
        setIsLoading(false);
    };

    useEffect(() => {
        if (!projectId) return;

        // Initial fetch
        refreshMessages();

        // Subscribe to NEW messages
        const channel = supabase
            .channel(`project-chat-${projectId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'Message',
                    filter: `projectId=eq.${projectId}`
                },
                (payload) => {
                    console.log('New message received via realtime:', payload);
                    // Instead of full refresh, we could just append, 
                    // but we need the sender object which isn't in the payload direct
                    // So we trigger a refresh or we fetch just the missing one.
                    // For now, refresh is safer to get the relation data.
                    refreshMessages();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [projectId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || !projectId) return;

        try {
            const currentInput = input;
            setInput("");
            await sendChatMessage(projectId, currentInput);
            await refreshMessages();
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    return (
        <div className="flex flex-col h-full glass-premium rounded-[2.5rem] overflow-hidden">
            {/* Chat Header */}
            <div className="p-8 border-b border-border bg-card/10 flex items-center justify-between">
                <div className="flex items-center gap-5">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
                            <span className="text-background font-black text-lg">A</span>
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full" />
                    </div>
                    <div>
                        <h4 className="font-heading font-bold text-primary tracking-tight">Assistance Automatic</h4>
                        <p className="text-[10px] text-green-500 font-bold uppercase tracking-[0.2em] mt-0.5">Équipe Réactive</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-3 hover:bg-primary/5 rounded-2xl transition-all text-secondary"><Search className="w-4.5 h-4.5" /></button>
                    <button className="p-3 hover:bg-primary/5 rounded-2xl transition-all text-secondary"><Video className="w-4.5 h-4.5" /></button>
                    <button className="p-3 hover:bg-primary/5 rounded-2xl transition-all text-secondary"><MoreVertical className="w-4.5 h-4.5" /></button>
                </div>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-background/20">
                {isLoading ? (
                    <div className="space-y-6">
                        <div className="flex justify-start"><div className="w-32 h-10 bg-secondary/10 animate-pulse rounded-2xl" /></div>
                        <div className="flex justify-end"><div className="w-48 h-10 bg-primary/5 animate-pulse rounded-2xl" /></div>
                        <div className="flex justify-start"><div className="w-40 h-10 bg-secondary/10 animate-pulse rounded-2xl" /></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center px-10">
                        <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mb-6">
                            <MessageSquare className="w-8 h-8 text-secondary/30" />
                        </div>
                        <p className="text-secondary font-bold uppercase text-[10px] tracking-[0.3em] mb-2">Canal Sécurisé Ouvert</p>
                        <p className="text-secondary/40 text-xs font-medium max-w-[200px]">Posez vos questions techniques ici, nos ingénieurs vous répondront bientôt.</p>
                    </div>
                ) : (
                    messages.map((msg, i) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.sender === "client" ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`flex gap-4 max-w-[85%] ${msg.sender === "client" ? "flex-row-reverse" : ""}`}>
                                <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-[10px] font-black tracking-tighter ${msg.sender === "client" ? "bg-primary text-background" : "bg-card border border-border text-primary"}`}>
                                    {msg.sender === "client" ? "CS" : "AT"}
                                </div>
                                <div className={`flex flex-col gap-2 ${msg.sender === "client" ? "items-end" : "items-start"}`}>
                                    <div className={`p-5 rounded-2xl text-[13px] leading-relaxed font-medium ${msg.sender === "client"
                                        ? "bg-primary text-background rounded-tr-none shadow-xl shadow-primary/5"
                                        : "bg-card border border-border text-primary rounded-tl-none shadow-sm"
                                        }`}>
                                        {msg.text}
                                    </div>
                                    <span className="text-[9px] text-secondary/40 font-bold uppercase tracking-widest">{msg.time}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Input Area */}
            <div className="p-8 border-t border-border bg-card/5">
                <div className="relative group">
                    <div className="flex items-center gap-4 bg-background/50 border border-border p-3 pl-5 rounded-3xl focus-within:border-primary transition-all shadow-sm">
                        <button className="p-2 hover:text-primary rounded-xl transition-colors text-secondary/40">
                            <Paperclip className="w-5 h-5" />
                        </button>
                        <input
                            type="text"
                            placeholder="Message technique..."
                            className="bg-transparent border-none outline-none flex-1 text-sm text-primary placeholder:text-secondary/30 font-medium"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim()}
                            className="p-4 bg-primary text-background rounded-2xl shadow-xl shadow-primary/10 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
