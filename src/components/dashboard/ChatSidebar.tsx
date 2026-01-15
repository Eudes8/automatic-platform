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
    Reply
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getProjectMessages, sendChatMessage } from "@/lib/actions/messages";
import { format, isSameDay, isYesterday, isToday } from "date-fns";
import { fr } from "date-fns/locale";

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

        return () => {
            isSubscribed = false;
            supabase.removeChannel(messageChannel);
            supabase.removeChannel(typingChannel);
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
        <div className="flex flex-col h-full glass-premium rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
            {/* Header */}
            <div className="p-6 sm:p-8 border-b border-border bg-card/10 flex items-center justify-between">
                <div className="flex items-center gap-4 sm:gap-5">
                    <div className="relative">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                            <span className="text-background font-black text-base sm:text-lg">A</span>
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-green-500 border-2 border-background rounded-full shadow-sm" />
                    </div>
                    <div>
                        <h4 className="font-heading font-bold text-primary tracking-tight text-sm sm:text-base">Support Technique</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            <p className="text-[10px] text-secondary/60 font-bold uppercase tracking-widest">En ligne</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                    <button onClick={() => setShowSearch(!showSearch)} className="p-2 sm:p-3 hover:bg-primary/5 rounded-xl transition-all text-secondary/60 hover:text-primary">
                        <Search className="w-4.5 h-4.5" />
                    </button>
                    <button className="hidden sm:block p-3 hover:bg-primary/5 rounded-xl transition-all text-secondary/60 hover:text-primary"><Video className="w-4.5 h-4.5" /></button>
                    <button className="p-2 sm:p-3 hover:bg-primary/5 rounded-xl transition-all text-secondary/60 hover:text-primary"><MoreVertical className="w-4.5 h-4.5" /></button>
                </div>
            </div>

            {/* Search */}
            <AnimatePresence>
                {showSearch && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-6 pb-6 overflow-hidden">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/30 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-secondary/5 border border-border rounded-2xl text-sm outline-none focus:border-primary/30 transition-all font-medium"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2 custom-scrollbar bg-background/5 scroll-smooth">
                {isLoading ? (
                    <div className="space-y-6 pt-10">
                        <div className="flex justify-start"><div className="w-32 h-10 bg-secondary/5 animate-pulse rounded-2xl" /></div>
                        <div className="flex justify-end"><div className="w-48 h-10 bg-primary/5 animate-pulse rounded-2xl" /></div>
                        <div className="flex justify-start"><div className="w-40 h-10 bg-secondary/5 animate-pulse rounded-2xl" /></div>
                    </div>
                ) : filteredMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center px-10">
                        <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mb-6">
                            <MessageSquare className="w-8 h-8 text-secondary/20" />
                        </div>
                        <p className="text-secondary/40 text-xs font-bold uppercase tracking-widest">Aucun message</p>
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
                                        <div className="flex justify-center my-8">
                                            <span className="text-[10px] bg-secondary/10 text-secondary/60 px-4 py-1.5 rounded-full font-bold uppercase tracking-[0.2em] shadow-sm">
                                                {isToday(messageTime) ? "Aujourd'hui" : isYesterday(messageTime) ? "Hier" : format(messageTime, "d MMMM yyyy", { locale: fr })}
                                            </span>
                                        </div>
                                    )}

                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        className={`flex ${isClient ? "justify-end" : "justify-start"} group relative mb-1`}
                                    >
                                        <div className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${isClient ? "flex-row-reverse" : ""}`}>
                                            {/* Avatar */}
                                            <div className={`w-8 h-8 flex-shrink-0 flex items-end ${!isLastInGroup ? 'invisible' : ''}`}>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black tracking-tighter shadow-sm ${isClient ? "bg-primary text-background" : "bg-card border border-border text-primary"
                                                    }`}>
                                                    {isClient ? "CS" : "AT"}
                                                </div>
                                            </div>

                                            <div className={`flex flex-col gap-1 ${isClient ? "items-end" : "items-start"}`}>
                                                {!isClient && isFirstInGroup && (
                                                    <span className="text-[10px] text-secondary/40 font-bold ml-1 uppercase tracking-widest">Automatic Support</span>
                                                )}

                                                <div className={`relative px-4 py-2.5 text-[13px] sm:text-sm leading-relaxed font-medium transition-all shadow-sm
                                                    ${isClient
                                                        ? `bg-primary text-background ${isFirstInGroup ? 'rounded-2xl rounded-tr-sm' : 'rounded-2xl'} ${!isFirstInGroup && !isLastInGroup ? 'rounded-r-sm' : ''} ${isLastInGroup && !isFirstInGroup ? 'rounded-br-2xl rounded-tr-sm' : ''}`
                                                        : `bg-card border border-border text-primary ${isFirstInGroup ? 'rounded-2xl rounded-tl-sm' : 'rounded-2xl'} ${!isFirstInGroup && !isLastInGroup ? 'rounded-l-sm' : ''} ${isLastInGroup && !isFirstInGroup ? 'rounded-bl-2xl rounded-tl-sm' : ''}`
                                                    }
                                                `}>
                                                    {msg.replyTo && (
                                                        <div className={`text-xs mb-2 p-2 rounded-lg border-l-2 ${isClient ? "bg-black/10 border-white/30" : "bg-secondary/5 border-primary/30"}`}>
                                                            <div className="flex items-center gap-1.5 opacity-60 mb-0.5">
                                                                <Reply className="w-3 h-3" />
                                                                <span className="font-bold text-[9px] uppercase tracking-tighter">Réponse</span>
                                                            </div>
                                                            <p className="truncate opacity-90 line-clamp-1 italic">{msg.replyTo}</p>
                                                        </div>
                                                    )}

                                                    <p className="whitespace-pre-wrap">{msg.text}</p>

                                                    {msg.attachment && (
                                                        <div className={`mt-2 p-2.5 rounded-xl border ${isClient ? "bg-black/10 border-white/10" : "bg-background border-border"}`}>
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isClient ? "bg-white/10" : "bg-primary/5"}`}>
                                                                    <File className="w-4 h-4" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-bold text-[11px] truncate">{msg.attachment.name}</p>
                                                                    <a href={msg.attachment.url} target="_blank" rel="noopener noreferrer" className="text-[9px] opacity-60 hover:opacity-100 underline underline-offset-2">Télécharger</a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className={`flex items-center gap-1.5 mt-1.5 justify-end ${isClient ? "text-white/50" : "text-secondary/40"}`}>
                                                        <span className="text-[9px] font-bold">{format(messageTime, 'HH:mm')}</span>
                                                        {isClient && (
                                                            msg.id.startsWith('temp-')
                                                                ? <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                                                                : <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className={`flex flex-col justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isClient ? "items-end" : "items-start"}`}>
                                                <button onClick={() => setReplyingTo(msg)} className="p-1.5 hover:bg-secondary/10 rounded-full text-secondary/40 hover:text-primary transition-colors">
                                                    <Reply className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setShowEmojiPicker(true)} className="p-1.5 hover:bg-secondary/10 rounded-full text-secondary/40 hover:text-primary transition-colors">
                                                    <Smile className="w-4 h-4" />
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

            {/* Typing */}
            {typingUsers.length > 0 && (
                <div className="px-8 py-3 bg-background/50 border-t border-border">
                    <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                            <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                            <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce delay-75" />
                            <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce delay-150" />
                        </div>
                        <p className="text-[10px] text-secondary/60 font-medium italic">Support en train d'écrire...</p>
                    </div>
                </div>
            )}

            {/* Footer / Input */}
            <div className="p-6 sm:p-8 bg-card/5 border-t border-border">
                {replyingTo && (
                    <div className="mb-4 flex items-center justify-between p-3 bg-secondary/5 border border-border rounded-2xl">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <Reply className="w-4 h-4 text-primary shrink-0" />
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Réponse</p>
                                <p className="text-xs text-secondary/60 truncate italic">{replyingTo.text}</p>
                            </div>
                        </div>
                        <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-secondary/10 rounded-lg text-secondary/40"><X className="w-4 h-4" /></button>
                    </div>
                )}

                {selectedFile && (
                    <div className="mb-4 flex items-center justify-between p-3 bg-primary/5 border border-primary/10 rounded-2xl">
                        <div className="flex items-center gap-3">
                            <File className="w-4 h-4 text-primary" />
                            <p className="text-xs font-medium text-primary/80 truncate max-w-[200px]">{selectedFile.name}</p>
                        </div>
                        <button onClick={() => setSelectedFile(null)} className="p-1 hover:bg-primary/10 rounded-lg text-primary/40"><X className="w-4 h-4" /></button>
                    </div>
                )}

                <div className="relative">
                    <div className="flex items-end gap-3 bg-background/80 border border-border p-2 sm:p-3 pl-4 sm:pl-5 rounded-3xl shadow-lg focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="mb-1.5 p-2 hover:bg-secondary/10 rounded-xl text-secondary/40 hover:text-primary transition-colors cursor-pointer"
                        >
                            <Paperclip className="w-5 h-5" />
                        </button>
                        <textarea
                            placeholder="Écrire un message..."
                            className="bg-transparent border-none outline-none flex-1 text-sm text-primary placeholder:text-secondary/30 font-medium resize-none min-h-[40px] max-h-32 py-2"
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
                            className="p-3.5 sm:p-4 bg-primary text-background rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale transition-all"
                        >
                            <Send className="w-4.5 h-4.5" />
                        </button>
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])} />
                </div>
            </div>
        </div>
    );
}
