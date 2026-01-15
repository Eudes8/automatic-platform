"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Send,
    Paperclip,
    MoreVertical,
    Search,
    MessageSquare,
    Smile,
    File,
    X,
    Check,
    CheckCheck,
    Reply,
    RefreshCw,
    Video
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getProjectMessages, sendChatMessage } from "@/lib/actions/messages";
import { format, isSameDay, isYesterday, isToday } from "date-fns";
import { fr } from "date-fns/locale";

interface Message {
    id: string;
    sender: "client" | "staff" | "system";
    senderName?: string;
    text: string;
    time: string;
    attachment?: {
        name: string;
        url: string;
        type: string;
        size: number;
    };
    reactions?: { emoji: string; count: number; users: string[] }[];
    isRead?: boolean;
    isPinned?: boolean;
    replyTo?: string;
}

export default function ChatSidebarAdmin({ projectId }: { projectId?: string }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const refreshMessages = async () => {
        if (!projectId) return;
        try {
            console.log("Chat [Admin]: Initializing messages for project:", projectId);
            const data = await getProjectMessages(projectId);
            const formattedMessages: Message[] = data.map(m => ({
                id: m.id,
                sender: m.sender.role === "CLIENT" ? "client" : "staff",
                senderName: m.sender.name || undefined,
                text: m.text,
                time: new Date(m.createdAt).toISOString(),
                attachment: m.attachment ? {
                    name: "Attachment",
                    url: m.attachment,
                    type: "file",
                    size: 0
                } : undefined,
                reactions: [],
                isRead: true,
                isPinned: false
            }));
            setMessages(formattedMessages);
            setIsLoading(false);
        } catch (error) {
            console.error("ChatSidebarAdmin: Error fetching messages:", error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!projectId) return;
        refreshMessages();

        let isSubscribed = true;

        console.log("Chat [Admin]: Setting up realtime subscription for project:", projectId);

        const messageChannel = supabase
            .channel(`admin-chat-resilient-${projectId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'Message'
                    // Removed filter for robustness
                },
                async (payload) => {
                    if (!isSubscribed) return;
                    console.log('Chat [Admin]: Raw payload received:', payload);

                    // Filter in callback
                    if (payload.new.projectId !== projectId) return;

                    try {
                        // Fetch the full message with sender details
                        const { data: newMessage, error } = await supabase
                            .from('Message')
                            .select('*, sender:User(*)')
                            .eq('id', payload.new.id)
                            .single();

                        if (error) {
                            console.error('Chat [Admin]: Error fetching joined message, using payload:', error);
                            // Fallback to simple message if join fails
                            const formattedMessage: Message = {
                                id: payload.new.id,
                                sender: "client", // Assume client for fallback
                                text: payload.new.text,
                                time: new Date(payload.new.createdAt).toISOString(),
                                attachment: payload.new.attachment ? {
                                    name: "Attachment",
                                    url: payload.new.attachment,
                                    type: "file",
                                    size: 0
                                } : undefined,
                                reactions: [],
                                isRead: true
                            };
                            setMessages(prev => {
                                if (prev.some(msg => msg.id === formattedMessage.id)) return prev;
                                return [...prev, formattedMessage];
                            });
                            return;
                        }

                        if (newMessage && isSubscribed) {
                            const senderData = Array.isArray(newMessage.sender) ? newMessage.sender[0] : newMessage.sender;
                            const formattedMessage: Message = {
                                id: newMessage.id,
                                sender: senderData?.role === "CLIENT" ? "client" : "staff",
                                senderName: senderData?.name || undefined,
                                text: newMessage.text,
                                time: new Date(newMessage.createdAt).toISOString(),
                                attachment: newMessage.attachment ? {
                                    name: "Attachment",
                                    url: newMessage.attachment,
                                    type: "file",
                                    size: 0
                                } : undefined,
                                reactions: [],
                                isRead: true,
                                isPinned: false
                            };

                            setMessages(prev => {
                                if (prev.some(msg => msg.id === formattedMessage.id)) return prev;
                                return [...prev, formattedMessage];
                            });
                            console.log('Chat [Admin]: Message appended to UI:', formattedMessage);
                        }
                    } catch (err) {
                        console.error('Chat [Admin]: Critical error processing realtime:', err);
                    }
                }
            )
            .subscribe((status) => {
                console.log(`Chat [Admin]: Realtime status:`, status);
            });

        return () => {
            isSubscribed = false;
            supabase.removeChannel(messageChannel);
            console.log("Chat [Admin]: Cleaned up realtime for project:", projectId);
        };
    }, [projectId]);

    // Smart scroll
    useEffect(() => {
        if (scrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
            if (isNearBottom || messages.length < 5) {
                bottomRef.current?.scrollIntoView({ behavior: "smooth" });
            }
        }
    }, [messages]);

    useEffect(() => {
        if (searchQuery.trim()) {
            setFilteredMessages(messages.filter(m => m.text.toLowerCase().includes(searchQuery.toLowerCase())));
        } else {
            setFilteredMessages(messages);
        }
    }, [searchQuery, messages]);

    const sendMessage = async () => {
        if ((!input.trim() && !selectedFile) || !projectId) return;

        const currentInput = input;
        const currentFile = selectedFile;
        setInput("");
        setSelectedFile(null);

        const optimisticId = `temp-${Date.now()}`;
        const optimisticMessage: Message = {
            id: optimisticId,
            sender: "staff",
            senderName: "Admin",
            text: currentFile ? `📎 ${currentFile.name}` : currentInput,
            time: new Date().toISOString(),
            attachment: currentFile ? {
                name: currentFile.name,
                url: "",
                type: currentFile.type,
                size: currentFile.size
            } : undefined,
            reactions: [],
            isRead: true,
            isPinned: false
        };

        setMessages(prev => [...prev, optimisticMessage]);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

        try {
            if (currentFile) {
                const formData = new FormData();
                formData.append('file', currentFile);
                formData.append('projectId', projectId);
                const res = await fetch('/api/files/upload', { method: 'POST', body: formData });
                if (res.ok) {
                    const { asset } = await res.json();
                    await sendChatMessage(projectId, currentInput || `📎 ${currentFile.name}`);
                }
            } else {
                await sendChatMessage(projectId, currentInput);
            }

            // Cleanup optimistic
            setTimeout(() => {
                setMessages(prev => {
                    const hasReal = prev.some(m => !m.id.startsWith('temp-') && m.text.includes(currentInput.slice(0, 10)));
                    return hasReal ? prev.filter(m => m.id !== optimisticId) : prev;
                });
            }, 4000);
        } catch (error) {
            console.error("Send failed:", error);
            setMessages(prev => prev.filter(m => m.id !== optimisticId));
        }
    };

    return (
        <div className="flex flex-col h-full glass-premium rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-slate-900/40">
            {/* Header */}
            <div className="p-6 sm:p-8 border-b border-white/5 bg-slate-800/20 flex items-center justify-between">
                <div className="flex items-center gap-4 sm:gap-5">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <h4 className="font-heading font-bold text-white tracking-tight text-sm sm:text-base">Support Admin</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Conversation Projet</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowSearch(!showSearch)} className="p-2.5 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all">
                        <Search className="w-4.5 h-4.5" />
                    </button>
                    <button onClick={refreshMessages} className="p-2.5 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all">
                        <RefreshCw className="w-4.5 h-4.5" />
                    </button>
                    <button className="p-2.5 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all"><MoreVertical className="w-4.5 h-4.5" /></button>
                </div>
            </div>

            {/* Search */}
            <AnimatePresence>
                {showSearch && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-6 pb-6 overflow-hidden">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/5 rounded-2xl text-sm text-white outline-none focus:border-blue-500/30 transition-all font-medium"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2 custom-scrollbar scroll-smooth">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                        <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Chargement...</p>
                    </div>
                ) : filteredMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center px-10">
                        <MessageSquare className="w-8 h-8 text-slate-700 mb-4" />
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Aucun message</p>
                    </div>
                ) : (
                    <>
                        {filteredMessages.map((msg, i) => {
                            const isStaff = msg.sender === "staff";
                            const prevMsg = filteredMessages[i - 1];
                            const nextMsg = filteredMessages[i + 1];
                            const isFirstInDay = !prevMsg || !isSameDay(new Date(prevMsg.time), new Date(msg.time));
                            const isFirstInGroup = isFirstInDay || prevMsg?.sender !== msg.sender;
                            const isLastInGroup = !nextMsg || nextMsg.sender !== msg.sender || !isSameDay(new Date(nextMsg.time), new Date(msg.time));
                            const messageTime = new Date(msg.time);

                            return (
                                <div key={msg.id} className="flex flex-col">
                                    {isFirstInDay && (
                                        <div className="flex justify-center my-8">
                                            <span className="text-[10px] bg-white/5 text-slate-400 px-4 py-1.5 rounded-full font-bold uppercase tracking-[0.2em] shadow-sm">
                                                {isToday(messageTime) ? "Aujourd'hui" : isYesterday(messageTime) ? "Hier" : format(messageTime, "d MMMM yyyy", { locale: fr })}
                                            </span>
                                        </div>
                                    )}

                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className={`flex ${isStaff ? "justify-end" : "justify-start"} group relative mb-1`}
                                    >
                                        <div className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${isStaff ? "flex-row-reverse" : ""}`}>
                                            {/* Avatar */}
                                            <div className={`w-8 h-8 flex-shrink-0 flex items-end ${!isLastInGroup ? 'invisible' : ''}`}>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black tracking-tighter shadow-sm ${isStaff ? "bg-blue-600 text-white" : "bg-slate-800 border border-white/5 text-slate-300"
                                                    }`}>
                                                    {isStaff ? "AT" : "CS"}
                                                </div>
                                            </div>

                                            <div className={`flex flex-col gap-1 ${isStaff ? "items-end" : "items-start"}`}>
                                                {!isStaff && isFirstInGroup && (
                                                    <span className="text-[10px] text-slate-500 font-bold ml-1 uppercase tracking-widest">{msg.senderName || 'Client'}</span>
                                                )}

                                                <div className={`relative px-4 py-2.5 text-[13px] sm:text-sm leading-relaxed font-medium transition-all
                                                    ${isStaff
                                                        ? `bg-blue-600 text-white ${isFirstInGroup ? 'rounded-2xl rounded-tr-sm' : 'rounded-2xl'} ${!isFirstInGroup && !isLastInGroup ? 'rounded-r-sm' : ''} ${isLastInGroup && !isStaff && !isLastInGroup ? '' : ''} ${isLastInGroup && !isFirstInGroup ? 'rounded-br-2xl rounded-tr-sm' : ''}`
                                                        : `bg-slate-800 border border-white/5 text-white ${isFirstInGroup ? 'rounded-2xl rounded-tl-sm' : 'rounded-2xl'} ${!isFirstInGroup && !isLastInGroup ? 'rounded-l-sm' : ''} ${isLastInGroup && !isFirstInGroup ? 'rounded-bl-2xl rounded-tl-sm' : ''}`
                                                    }
                                                `}>
                                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                                    {msg.attachment && (
                                                        <div className={`mt-2 p-2.5 rounded-xl border ${isStaff ? "bg-black/10 border-white/10" : "bg-black/20 border-white/5"}`}>
                                                            <div className="flex items-center gap-3">
                                                                <File className="w-4 h-4" />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-bold text-[11px] truncate">{msg.attachment.name}</p>
                                                                    <a href={msg.attachment.url} target="_blank" rel="noopener noreferrer" className="text-[9px] opacity-60 hover:opacity-100 underline underline-offset-2">Télécharger</a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className={`flex items-center gap-1.5 mt-1.5 justify-end ${isStaff ? "text-white/50" : "text-slate-500"}`}>
                                                        <span className="text-[9px] font-bold">{format(messageTime, 'HH:mm')}</span>
                                                        {isStaff && (
                                                            msg.id.startsWith('temp-')
                                                                ? <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                                                                : <CheckCheck className="w-3.5 h-3.5 text-blue-300" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            );
                        })}
                        <div ref={bottomRef} />
                    </>
                )}
            </div>

            {/* Input */}
            <div className="p-6 sm:p-8 bg-slate-800/20 border-t border-white/5">
                {selectedFile && (
                    <div className="mb-4 flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                        <div className="flex items-center gap-3">
                            <File className="w-4 h-4 text-blue-400" />
                            <p className="text-xs font-medium text-blue-100 truncate max-w-[200px]">{selectedFile.name}</p>
                        </div>
                        <button onClick={() => setSelectedFile(null)} className="p-1 hover:bg-blue-500/10 rounded-lg text-slate-400"><X className="w-4 h-4" /></button>
                    </div>
                )}

                <div className="flex items-end gap-3 bg-white/5 border border-white/5 p-2 sm:p-3 pl-4 sm:pl-5 rounded-3xl shadow-lg focus-within:border-blue-500/30 transition-all">
                    <button onClick={() => fileInputRef.current?.click()} className="mb-1.5 p-2 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-colors">
                        <Paperclip className="w-5 h-5" />
                    </button>
                    <textarea
                        placeholder="Écrire un message..."
                        className="bg-transparent border-none outline-none flex-1 text-sm text-white placeholder:text-slate-600 font-medium resize-none min-h-[40px] max-h-32 py-2"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                        rows={1}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim() && !selectedFile}
                        className="p-3.5 sm:p-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale transition-all"
                    >
                        <Send className="w-4.5 h-4.5" />
                    </button>
                </div>
                <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])} />
            </div>
        </div>
    );
}
