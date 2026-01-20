"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Send,
    Paperclip,
    MessageSquare,
    X,
    Check,
    CheckCheck,
    File,
    RefreshCw,
    Search,
    Smile,
    Video,
    MoreVertical,
    Reply,
    Zap
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getProjectMessages, sendChatMessage } from "@/lib/actions/messages";
import { format, isSameDay, isYesterday, isToday } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface TypingUser {
    id: string;
    name: string;
}

interface Message {
    id: string;
    sender: "client" | "staff" | "system";
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

export default function ChatSidebar({ projectId }: { projectId?: string }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [showSearch, setShowSearch] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const refreshMessages = async () => {
        if (!projectId) return;
        try {
            console.log("Chat [Client]: Initializing messages for project:", projectId);
            const data = await getProjectMessages(projectId);
            const formattedMessages: Message[] = data.map(m => ({
                id: m.id,
                sender: m.sender.role === "CLIENT" ? "client" : "staff",
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
            console.error("ChatSidebar: Error fetching messages:", error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!projectId) return;
        refreshMessages();

        let isSubscribed = true;

        console.log("Chat [Client]: Setting up realtime subscription for project:", projectId);

        // CHANNEL 1: MESSAGES (Listen to all, filter in callback for robustness)
        const messageChannel = supabase
            .channel(`project-chat-v2-${projectId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'Message'
                    // removed filter for robustness
                },
                async (payload) => {
                    if (!isSubscribed) return;
                    console.log('Chat [Client]: Raw payload received:', payload);

                    // Filter in callback
                    if (payload.new.projectId !== projectId) return;

                    try {
                        // Fetch the full message with sender details
                        // Try a simpler select first
                        const { data: newMessage, error } = await supabase
                            .from('Message')
                            .select('*, sender:User(*)')
                            .eq('id', payload.new.id)
                            .single();

                        if (error) {
                            console.error('Chat [Client]: Error fetching joined message, trying simple fetch:', error);
                            // Fallback to simple message if join fails
                            const formattedMessage: Message = {
                                id: payload.new.id,
                                sender: "staff", // Fallback assumption
                                text: payload.new.text,
                                time: new Date(payload.new.createdAt).toISOString(),
                                attachment: payload.new.attachment ? {
                                    name: "Pièce jointe",
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
                                text: newMessage.text,
                                time: new Date(newMessage.createdAt).toISOString(),
                                attachment: newMessage.attachment ? {
                                    name: "Pièce jointe",
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
                            console.log('Chat [Client]: Message appended to UI:', formattedMessage);
                        }
                    } catch (err) {
                        console.error('Chat [Client]: Critical error processing realtime:', err);
                    }
                }
            )
            .subscribe((status) => {
                console.log(`Chat [Client]: Realtime status:`, status);
            });

        const typingChannel = supabase
            .channel(`project-typing-${projectId}`)
            .on('broadcast', { event: 'typing' }, (payload) => {
                if (!isSubscribed) return;
                const { userId, isTyping } = payload.payload;
                if (userId === 'client-user') return; // Ignore own typing

                setTypingUsers(prev => {
                    if (isTyping) {
                        if (!prev.some(u => u.id === userId)) return [...prev, { id: userId, name: 'Support' }];
                        return prev;
                    }
                    return prev.filter(u => u.id !== userId);
                });
            })
            .subscribe();

        // 1s Polling Fallback as requested
        const pollingInterval = setInterval(() => {
            if (isSubscribed) {
                refreshMessages();
            }
        }, 1000);

        return () => {
            isSubscribed = false;
            supabase.removeChannel(messageChannel);
            supabase.removeChannel(typingChannel);
            clearInterval(pollingInterval);
            console.log("Chat [Client]: Cleaned up realtime for project:", projectId);
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
    }, [messages, typingUsers]);

    // Search
    useEffect(() => {
        if (searchQuery.trim()) {
            setFilteredMessages(messages.filter(m => m.text.toLowerCase().includes(searchQuery.toLowerCase())));
        } else {
            setFilteredMessages(messages);
        }
    }, [searchQuery, messages]);

    const handleTyping = () => {
        if (!isTyping && projectId) {
            setIsTyping(true);
            supabase.channel(`project-typing-${projectId}`).send({
                type: 'broadcast',
                event: 'typing',
                payload: { userId: 'client-user', isTyping: true }
            });

            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                setIsTyping(false);
                supabase.channel(`project-typing-${projectId}`).send({
                    type: 'broadcast',
                    event: 'typing',
                    payload: { userId: 'client-user', isTyping: false }
                });
            }, 3000);
        }
    };

    const sendMessage = async () => {
        if ((!input.trim() && !selectedFile) || !projectId) return;

        const currentInput = input;
        const currentFile = selectedFile;
        const replyText = replyingTo?.text;

        setInput("");
        setSelectedFile(null);
        setReplyingTo(null);

        const optimisticId = `temp-${Date.now()}`;
        const optimisticMessage: Message = {
            id: optimisticId,
            sender: "client",
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
            isPinned: false,
            replyTo: replyText
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
                } else {
                    throw new Error("Upload failed");
                }
            } else {
                await sendChatMessage(projectId, currentInput);
            }

            // Cleanup optimistic message after some time to allow realtime to take over
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
        <div className="flex flex-col h-full bg-background border border-border/50 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/2 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />

            {/* Header */}
            <div className="p-8 border-b border-border/50 bg-card/10 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-5">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-[1.5rem] bg-primary text-background flex items-center justify-center shadow-2xl shadow-primary/20">
                            <Zap size={20} className="animate-pulse" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-background rounded-full shadow-inner" />
                    </div>
                    <div>
                        <h4 className="font-heading font-black text-primary tracking-tighter text-lg uppercase italic">UNITÉ_SUPPORT.ALPHA</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.3em] italic">NODE_ACTIVE // CH-256V</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowSearch(!showSearch)} className="p-3 hover:bg-primary/5 rounded-[1rem] transition-all text-secondary/40 hover:text-primary border border-transparent hover:border-border/50">
                        <Search size={18} />
                    </button>
                    <button className="p-3 hover:bg-primary/5 rounded-[1rem] transition-all text-secondary/40 hover:text-primary border border-transparent hover:border-border/50">
                        <MoreVertical size={18} />
                    </button>
                </div>
            </div>

            {/* Search */}
            <AnimatePresence>
                {showSearch && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-8 pb-6 overflow-hidden bg-card/10 border-b border-border/50">
                        <div className="relative mt-4">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="XFER_FIND: Rechercher messages..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-background border border-border/50 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary/30 transition-all italic shadow-inner"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar bg-background/30 scroll-smooth">
                {isLoading ? (
                    <div className="space-y-8 pt-10">
                        <div className="flex justify-start"><div className="w-48 h-16 bg-secondary/5 animate-pulse rounded-[1.5rem]" /></div>
                        <div className="flex justify-end"><div className="w-64 h-16 bg-primary/5 animate-pulse rounded-[1.5rem]" /></div>
                        <div className="flex justify-start"><div className="w-56 h-16 bg-secondary/5 animate-pulse rounded-[1.5rem]" /></div>
                    </div>
                ) : filteredMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                        <div className="w-20 h-20 bg-primary/5 rounded-[2rem] flex items-center justify-center mb-8 border border-primary/10 shadow-inner">
                            <MessageSquare size={32} className="text-secondary/20" />
                        </div>
                        <p className="text-[10px] text-secondary/40 font-black uppercase tracking-[0.5em] italic">// AUCUN_HISTORIQUE_XFER</p>
                    </div>
                ) : (
                    <>
                        {filteredMessages.map((msg, i) => {
                            const isClient = msg.sender === "client";
                            const prevMsg = filteredMessages[i - 1];
                            const nextMsg = filteredMessages[i + 1];
                            const isFirstInDay = !prevMsg || !isSameDay(new Date(prevMsg.time), new Date(msg.time));
                            const isFirstInGroup = isFirstInDay || prevMsg?.sender !== msg.sender;
                            const isLastInGroup = !nextMsg || nextMsg.sender !== msg.sender || !isSameDay(new Date(nextMsg.time), new Date(msg.time));
                            const messageTime = new Date(msg.time);

                            return (
                                <div key={msg.id} className="flex flex-col">
                                    {isFirstInDay && (
                                        <div className="flex justify-center my-10">
                                            <span className="text-[9px] bg-secondary/5 text-secondary/40 px-6 py-2 rounded-full font-black uppercase tracking-[0.3em] border border-border/50 italic">
                                                {isToday(messageTime) ? "JOUR_ACTUEL" : isYesterday(messageTime) ? "VEILLE_LOG" : format(messageTime, "dd_MM_yyyy", { locale: fr })}
                                            </span>
                                        </div>
                                    )}

                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        className={`flex ${isClient ? "justify-end" : "justify-start"} group relative mb-2`}
                                    >
                                        <div className={`flex gap-4 max-w-[85%] ${isClient ? "flex-row-reverse" : ""}`}>
                                            <div className={`w-10 h-10 flex-shrink-0 flex items-end ${!isLastInGroup ? 'invisible' : ''}`}>
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black uppercase tracking-[0.1em] italic shadow-inner border border-border/50",
                                                    isClient ? "bg-primary text-background" : "bg-white text-primary"
                                                )}>
                                                    {isClient ? "U_S" : "A_I"}
                                                </div>
                                            </div>

                                            <div className={`flex flex-col gap-1.5 ${isClient ? "items-end" : "items-start"}`}>
                                                {!isClient && isFirstInGroup && (
                                                    <span className="text-[9px] text-secondary/30 font-black ml-1 uppercase tracking-[0.3em] italic">// AUTOMATIC_AGENT</span>
                                                )}

                                                <div className={cn(
                                                    "relative px-6 py-4 text-sm font-bold tracking-tight leading-relaxed transition-all shadow-xl",
                                                    isClient
                                                        ? `bg-primary text-background shadow-primary/10 ${isFirstInGroup ? 'rounded-[1.5rem] rounded-tr-none' : 'rounded-[1.5rem]'}`
                                                        : `bg-white border border-border/50 text-primary ${isFirstInGroup ? 'rounded-[1.5rem] rounded-tl-none' : 'rounded-[1.5rem]'}`
                                                )}>
                                                    {msg.replyTo && (
                                                        <div className={cn(
                                                            "text-xs mb-3 p-3 rounded-xl border-l-4 shadow-inner",
                                                            isClient ? "bg-black/10 border-white/20" : "bg-card/30 border-primary/20"
                                                        )}>
                                                            <p className="text-[8px] font-black uppercase tracking-widest italic opacity-50 mb-1">XFER_REPLY:</p>
                                                            <p className="line-clamp-2 italic opacity-80 text-xs">{msg.replyTo}</p>
                                                        </div>
                                                    )}

                                                    <p className="whitespace-pre-wrap">{msg.text}</p>

                                                    {msg.attachment && (
                                                        <div className={cn(
                                                            "mt-4 p-4 rounded-[1.2rem] border shadow-inner",
                                                            isClient ? "bg-black/10 border-white/10" : "bg-secondary/5 border-border/50"
                                                        )}>
                                                            <div className="flex items-center gap-4">
                                                                <div className={cn(
                                                                    "w-10 h-10 rounded-lg flex items-center justify-center",
                                                                    isClient ? "bg-white/10" : "bg-primary/5"
                                                                )}>
                                                                    <File size={18} />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-black text-[10px] uppercase tracking-wider truncate italic">{msg.attachment.name}</p>
                                                                    <a href={msg.attachment.url} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black uppercase tracking-[0.1em] opacity-40 hover:opacity-100 italic transition-opacity">DATA_FETCH_OK</a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className={cn(
                                                        "flex items-center gap-2 mt-3 justify-end",
                                                        isClient ? "text-white/40" : "text-secondary/20"
                                                    )}>
                                                        <span className="text-[8px] font-black uppercase tracking-widest italic">{format(messageTime, 'HH:mm')}</span>
                                                        {isClient && (
                                                            msg.id.startsWith('temp-')
                                                                ? <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                                                                : <CheckCheck className="w-4 h-4 text-accent" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={cn(
                                                "flex flex-col justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300",
                                                isClient ? "items-end" : "items-start"
                                            )}>
                                                <button onClick={() => setReplyingTo(msg)} className="p-2 hover:bg-secondary/5 rounded-lg text-secondary/30 hover:text-primary transition-colors border border-transparent hover:border-border/50">
                                                    <Reply size={16} />
                                                </button>
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

            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
                <div className="px-8 py-3 bg-secondary/2 border-t border-border/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex space-x-1.5">
                            <span className="w-1.5 h-1.5 bg-primary/30 rounded-full animate-bounce" />
                            <span className="w-1.5 h-1.5 bg-primary/30 rounded-full animate-bounce [animation-delay:0.2s]" />
                            <span className="w-1.5 h-1.5 bg-primary/30 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                        <p className="text-[9px] text-secondary/40 font-black uppercase tracking-[0.3em] italic">UNITÉ_SUPPORT EN TRAIN D'ÉCRIRE...</p>
                    </div>
                </div>
            )}

            {/* Footer / Input */}
            <div className="p-8 bg-card/10 border-t border-border/50 relative z-10">
                {replyingTo && (
                    <div className="mb-6 flex items-center justify-between p-4 bg-secondary/2 border border-border/50 rounded-[1.5rem] shadow-inner animate-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center gap-4 overflow-hidden">
                            <Reply className="text-primary/40 shrink-0" size={16} />
                            <div className="min-w-0">
                                <p className="text-[9px] font-black text-primary/40 uppercase tracking-[0.3em] italic">RÉPONSE_AUX_LOGS</p>
                                <p className="text-xs text-primary/80 truncate italic line-clamp-1">{replyingTo.text}</p>
                            </div>
                        </div>
                        <button onClick={() => setReplyingTo(null)} className="p-2 hover:bg-secondary/5 rounded-lg text-secondary/40 transition-colors"><X size={16} /></button>
                    </div>
                )}

                {selectedFile && (
                    <div className="mb-6 flex items-center justify-between p-4 bg-primary/2 border border-primary/20 rounded-[1.5rem] shadow-inner animate-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center gap-4 overflow-hidden">
                            <File className="text-primary/40" size={18} />
                            <p className="text-xs font-black text-primary/80 uppercase tracking-widest truncate italic">{selectedFile.name}</p>
                        </div>
                        <button onClick={() => setSelectedFile(null)} className="p-2 hover:bg-primary/5 rounded-lg text-primary/40 transition-colors"><X size={16} /></button>
                    </div>
                )}

                <div className="relative group">
                    <div className="flex items-end gap-4 bg-white border border-border/80 p-4 pl-6 rounded-[2rem] shadow-2xl focus-within:border-primary/40 focus-within:ring-8 focus-within:ring-primary/5 transition-all duration-500">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="mb-1.5 p-3 hover:bg-secondary/5 rounded-xl text-secondary/40 hover:text-primary transition-all duration-300 active:scale-90"
                        >
                            <Paperclip size={20} />
                        </button>
                        <textarea
                            placeholder="COMM_XFER: Encodez votre message..."
                            className="bg-transparent border-none outline-none flex-1 text-sm text-primary placeholder:text-secondary/20 font-bold leading-relaxed resize-none min-h-[44px] max-h-48 py-3 italic"
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value);
                                handleTyping();
                            }}
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
                            className="p-4 bg-primary text-background rounded-2xl shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale transition-all duration-500 hover:shadow-primary/40"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])} />
                </div>
            </div>
        </div>
    );
}
