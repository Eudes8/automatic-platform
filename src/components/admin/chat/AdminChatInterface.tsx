"use client";

import { useEffect, useRef, useState } from "react";
import { Paperclip, Send, User, Building, MessageSquare, Mail, RefreshCw, X, File, Loader2 } from "lucide-react";
import { uploadFileAction } from "@/lib/actions/storage";
import { sendAdminMessage } from "@/lib/actions/adminMessage";
import { sendMessage } from "@/lib/actions/chat";
import { supabase } from "@/lib/supabase";
import { getAllChatChannels } from "@/lib/actions/adminChat";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    text: string;
    createdAt: string;
    senderId: string;
    attachment?: string;
    sender?: {
        role: string;
        name: string;
    };
}

interface ChatChannel {
    id: string;
    type: 'PROJECT' | 'SUPPORT';
    title: string;
    client: any;
    messages: Message[];
    updatedAt: string;
    status: string;
    originalId?: string;
}

interface ChatInterfaceProps {
    projects: ChatChannel[];
}

export default function AdminChatInterface({ projects: initialChannels }: ChatInterfaceProps) {
    const [channels, setChannels] = useState<ChatChannel[]>(initialChannels);
    const [selectedChannelId, setSelectedChannelId] = useState<string | null>(initialChannels[0]?.id || null);
    const [message, setMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const selectedChannel = channels.find(c => c.id === selectedChannelId);

    const refreshData = async () => {
        setIsRefreshing(true);
        try {
            const updated = await getAllChatChannels();
            setChannels(updated as any);
        } catch (error) {
            console.error("AdminChat: Failed to refresh channels:", error);
        } finally {
            setIsRefreshing(false);
        }
    };

    // Subscriptions
    useEffect(() => {
        console.log("AdminChat: Setting up resilient message subscription...");

        const channel = supabase
            .channel('admin-global-chat')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'Message'
                },
                async (payload) => {
                    console.log('AdminChat: New message payload received:', payload);

                    try {
                        // Fetch the full message with sender details
                        const { data: newMessage, error } = await supabase
                            .from('Message')
                            .select('*, sender:User(*)')
                            .eq('id', payload.new.id)
                            .single();

                        if (error) {
                            console.error('AdminChat: Error fetching full message:', error);
                            // Fallback: manually update the specific channel
                            setChannels(prev => prev.map(ch => {
                                if (ch.id === payload.new.projectId || ch.id === payload.new.conversationId) {
                                    return {
                                        ...ch,
                                        messages: [...ch.messages, payload.new as any]
                                    };
                                }
                                return ch;
                            }));
                            return;
                        }

                        if (newMessage) {
                            const senderData = Array.isArray(newMessage.sender) ? newMessage.sender[0] : newMessage.sender;
                            const formattedMessage: Message = {
                                ...newMessage,
                                sender: senderData
                            };

                            setChannels(prev => prev.map(ch => {
                                // Match by Project ID or Conversation ID
                                const isMatch = ch.id === newMessage.projectId || ch.id === newMessage.conversationId;
                                if (isMatch) {
                                    // Check if message already exists
                                    if (ch.messages.some(m => m.id === formattedMessage.id)) return ch;
                                    return {
                                        ...ch,
                                        messages: [...ch.messages, formattedMessage],
                                        updatedAt: formattedMessage.createdAt
                                    };
                                }
                                return ch;
                            }));
                            console.log('AdminChat: UI updated with new message for channel:', newMessage.projectId || newMessage.conversationId);
                        }
                    } catch (err) {
                        console.error('AdminChat: Error processing realtime insertion:', err);
                    }
                }
            )
            .subscribe((status) => {
                console.log("AdminChat: Realtime subscription status:", status);
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Manual refresh once in a while just in case, but less frequent (e.g. 30s) or button only
    useEffect(() => {
        const interval = setInterval(refreshData, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [selectedChannelId, selectedChannel?.messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!message.trim() && !selectedFile) || !selectedChannel) return;

        const currentMsg = message;
        const currentFile = selectedFile;
        setMessage("");
        setSelectedFile(null);

        // Optimistic UI for Admin
        const tempId = `temp-${Date.now()}`;
        const optimisticMsg: Message = {
            id: tempId,
            text: currentFile ? (currentMsg || `📎 ${currentFile.name}`) : currentMsg,
            createdAt: new Date().toISOString(),
            senderId: 'admin', // Placeholder
            attachment: currentFile ? URL.createObjectURL(currentFile) : undefined,
            sender: { role: 'ADMIN', name: 'Admin' }
        };

        setChannels(prev => prev.map(ch => {
            if (ch.id === selectedChannel.id) {
                return { ...ch, messages: [...ch.messages, optimisticMsg] };
            }
            return ch;
        }));

        try {
            let attachmentUrl: string | undefined = undefined;

            if (currentFile) {
                setIsUploading(true);
                const formData = new FormData();
                formData.append('file', currentFile);
                formData.append('bucket', 'project-assets');
                const result = await uploadFileAction(formData);
                attachmentUrl = result.url;
                setIsUploading(false);
            }

            if (selectedChannel.type === 'PROJECT') {
                await sendAdminMessage(selectedChannel.id, currentMsg || (currentFile ? `📎 ${currentFile.name}` : ""), attachmentUrl);
            } else {
                await sendMessage(selectedChannel.id, currentMsg || (currentFile ? `📎 ${currentFile.name}` : ""), attachmentUrl);
            }

            // Realtime will replace the optimistic UI
            setTimeout(() => {
                setChannels(prev => prev.map(ch => {
                    if (ch.id === selectedChannel.id) {
                        const hasReal = ch.messages.some(m => !m.id.startsWith('temp-') && (m.text === currentMsg || (attachmentUrl && m.attachment === attachmentUrl)));
                        return hasReal ? { ...ch, messages: ch.messages.filter(m => m.id !== tempId) } : ch;
                    }
                    return ch;
                }));
            }, 3000);
        } catch (error) {
            console.error("Failed to send admin message:", error);
            setMessage(currentMsg);
            setSelectedFile(currentFile);
            setIsUploading(false);
            setChannels(prev => prev.map(ch => {
                if (ch.id === selectedChannel.id) {
                    return { ...ch, messages: ch.messages.filter(m => m.id !== tempId) };
                }
                return ch;
            }));
        }
    };

    const filteredChannels = channels.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.client?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!channels || channels.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 bg-white/40 backdrop-blur-3xl rounded-[3rem] text-center h-full relative overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-primary/2 rounded-full blur-[80px] -ml-32 -mt-32 pointer-events-none" />
                <Building className="w-16 h-16 text-primary/10 mb-8" />
                <p className="text-primary font-black uppercase text-[11px] tracking-[0.4em] italic">SILENCE_RADIO_GLOBAL</p>
                <p className="text-secondary/40 text-[10px] font-bold uppercase italic tracking-widest mt-4">// AUCUNE_DISCUSSION_ACTIVE_CAPTÉE_SUR_LE_RÉSEAU.</p>
                <button onClick={refreshData} className="mt-10 flex items-center gap-4 px-8 py-4 bg-primary text-background rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all duration-500 shadow-2xl shadow-primary/20 italic group">
                    <RefreshCw className={`w-4 h-4 group-hover:rotate-180 transition-transform duration-700 ${isRefreshing ? 'animate-spin' : ''}`} />
                    REINITIALISER_SCAN
                </button>
            </div>
        );
    }

    return (
        <div className="flex h-full bg-white/10 overflow-hidden relative group">
            {/* Sidebar List */}
            <div className="w-[400px] border-r border-border/50 bg-white/20 flex flex-col relative z-20">
                <div className="p-8 border-b border-border/30 bg-white/10 flex items-center gap-4">
                    <div className="relative flex-1 group/search">
                        <input
                            placeholder="SCAN_CHANNELS..."
                            className="w-full bg-background border border-border/50 rounded-2xl px-6 py-4 text-[10px] font-black uppercase italic tracking-widest text-primary focus:border-primary/50 focus:ring-8 focus:ring-primary/5 outline-none transition-all duration-500 shadow-inner placeholder:text-secondary/10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={refreshData}
                        disabled={isRefreshing}
                        className="p-4 bg-background border border-border/50 rounded-2xl hover:bg-primary hover:text-background transition-all duration-700 text-primary/40 shadow-inner disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                    {filteredChannels.map((channel) => {
                        const lastMsg = channel.messages[channel.messages.length - 1];
                        const isActive = selectedChannelId === channel.id;
                        return (
                            <button
                                key={channel.id}
                                onClick={() => setSelectedChannelId(channel.id)}
                                className={cn(
                                    "w-full p-8 text-left rounded-[2rem] transition-all duration-500 relative overflow-hidden group/item",
                                    isActive
                                        ? "bg-primary text-background shadow-2xl shadow-primary/30"
                                        : "hover:bg-white hover:border-border/50 border border-transparent text-secondary shadow-sm"
                                )}
                            >
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <span className={cn(
                                        "text-xs font-black uppercase italic tracking-tighter truncate pr-4",
                                        isActive ? "text-background" : "text-primary"
                                    )}>
                                        {channel.client?.name || "CLI_INCONNU"}
                                    </span>
                                    <span className={cn(
                                        "text-[9px] font-black uppercase tracking-widest pt-1",
                                        isActive ? "text-background/40" : "text-secondary/20"
                                    )}>
                                        {lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 mb-4 relative z-10">
                                    <span className={cn(
                                        "px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] border italic",
                                        isActive
                                            ? "border-white/20 bg-white/10"
                                            : channel.type === 'SUPPORT'
                                                ? "border-blue-500/20 bg-blue-500/10 text-blue-500"
                                                : "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                                    )}>
                                        {channel.type === 'SUPPORT' ? "SUPPORT" : "PROJET"}
                                    </span>
                                    <p className={cn(
                                        "text-[9px] font-black uppercase tracking-[0.2em] truncate flex-1 italic",
                                        isActive ? "text-white/40" : "text-secondary/20"
                                    )}>/{channel.title}</p>
                                </div>

                                {lastMsg && (
                                    <p className={cn(
                                        "text-[10px] truncate italic font-bold uppercase tracking-tight relative z-10",
                                        isActive ? "opacity-60" : "opacity-30"
                                    )}>
                                        // {lastMsg.text}
                                    </p>
                                )}

                                {isActive && (
                                    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
                                        <div className="w-full h-[1px] bg-white animate-scan-line" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-transparent relative z-10">
                {selectedChannel ? (
                    <>
                        <header className="p-10 border-b border-border/30 flex justify-between items-center bg-white/10 backdrop-blur-xl relative z-20">
                            <div className="flex-1">
                                <div className="flex items-center gap-4 mb-3">
                                    <h3 className="text-2xl font-black text-primary italic uppercase tracking-tighter leading-none">{selectedChannel.title}</h3>
                                    <span className="px-3 py-1 bg-primary text-background rounded-lg text-[9px] font-black uppercase italic tracking-[0.3em] shadow-lg shadow-primary/20">
                                        {selectedChannel.status}_STATUS
                                    </span>
                                </div>
                                <div className="flex items-center gap-8 text-[9px] font-black text-secondary/20 uppercase tracking-[0.3em] italic">
                                    <span className="flex items-center gap-2 group/header"><User className="w-4 h-4 text-primary/40 group-hover/header:text-primary transition-colors" /> {selectedChannel.client?.name || "IDENTITE_INCONNUE"}</span>
                                    {selectedChannel.client?.email && (
                                        <span className="flex items-center gap-2 border-l border-border/30 pl-8 group/header"><Mail className="w-4 h-4 text-primary/40 group-hover/header:text-primary transition-colors" /> {selectedChannel.client.email}</span>
                                    )}
                                </div>
                            </div>
                        </header>

                        <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar relative" ref={scrollRef}>
                            <div className="absolute inset-0 bg-primary/2 pointer-events-none opacity-20" />
                            {selectedChannel.messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-secondary/10 italic text-[10px] font-black uppercase tracking-[0.5em] text-center relative z-10">
                                    <MessageSquare className="w-20 h-20 mb-10 opacity-5" />
                                    // SILENCE_OPÉRATIONNEL_SÉCURISÉ.
                                </div>
                            ) : (
                                selectedChannel.messages.map((msg: Message) => {
                                    const senderRole = msg.sender?.role || 'CLIENT';
                                    const isMe = senderRole === "ADMIN" || senderRole === "STAFF";

                                    return (
                                        <div key={msg.id} className={cn("flex relative z-10", isMe ? "justify-end" : "justify-start")}>
                                            <div className={cn("flex gap-6 max-w-[80%]", isMe ? "flex-row-reverse text-right" : "")}>
                                                <div className={cn(
                                                    "w-12 h-12 rounded-[1.2rem] shrink-0 flex items-center justify-center font-black text-[10px] shadow-xl italic tracking-tighter",
                                                    isMe ? "bg-primary text-background shadow-primary/20" : "bg-white border border-border/50 text-primary shadow-sm"
                                                )}>
                                                    {isMe ? "ADM" : "CLI"}
                                                </div>
                                                <div className={cn("flex flex-col gap-3", isMe ? "items-end" : "items-start")}>
                                                    <div className={cn(
                                                        "p-8 rounded-[2.5rem] text-[13px] leading-relaxed font-black uppercase italic shadow-2xl relative overflow-hidden transition-all duration-500",
                                                        isMe
                                                            ? "bg-primary text-background rounded-tr-none hover:bg-primary/95 shadow-primary/20"
                                                            : "bg-white border border-border/50 text-primary rounded-tl-none hover:border-primary/50 shadow-sm"
                                                    )}>
                                                        <p className="whitespace-pre-wrap tracking-tight">{msg.text}</p>

                                                        {msg.attachment && (
                                                            <div className={cn(
                                                                "mt-4 p-4 rounded-[1.2rem] border shadow-inner transition-all hover:border-current/30",
                                                                isMe ? "bg-black/10 border-white/10" : "bg-secondary/5 border-border/50"
                                                            )}>
                                                                <div className="flex items-center gap-4">
                                                                    <div className={cn(
                                                                        "w-10 h-10 rounded-lg flex items-center justify-center",
                                                                        isMe ? "bg-white/10" : "bg-primary/5"
                                                                    )}>
                                                                        <File size={18} />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="font-black text-[9px] uppercase tracking-wider truncate italic">PIÈCE_JOINTE</p>
                                                                        <a href={msg.attachment} target="_blank" rel="noopener noreferrer" className="text-[8px] font-black uppercase tracking-[0.1em] opacity-40 hover:opacity-100 italic transition-opacity">OUVRIR_DATA</a>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className={cn(
                                                            "absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden",
                                                            isMe ? "bg-white" : "bg-primary"
                                                        )}>
                                                            <div className="w-full h-[1px] bg-current animate-scan-line" />
                                                        </div>
                                                    </div>
                                                    <span className="text-[9px] text-secondary/20 font-black uppercase tracking-[0.3em] italic px-4">
                                                        TIMESTAMP_XFER: {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="p-10 border-t border-border/30 bg-white/50 backdrop-blur-xl relative z-20">
                            {selectedFile && (
                                <div className="mb-6 flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-[1.5rem] shadow-inner animate-in slide-in-from-bottom-2 duration-300">
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <File className="text-primary/40" size={18} />
                                        <p className="text-[10px] font-black text-primary/80 uppercase tracking-widest truncate italic">{selectedFile.name}</p>
                                    </div>
                                    <button onClick={() => setSelectedFile(null)} className="p-2 hover:bg-primary/5 rounded-lg text-primary/40 transition-colors"><X size={16} /></button>
                                </div>
                            )}

                            <form onSubmit={handleSend} className="relative group/form flex items-end gap-4 p-4 bg-background border border-border/50 rounded-[2rem] shadow-inner focus-within:border-primary/40 focus-within:ring-[15px] focus-within:ring-primary/5 transition-all duration-500">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-4 hover:bg-secondary/5 rounded-2xl text-secondary/40 hover:text-primary transition-all duration-300 active:scale-90"
                                >
                                    {isUploading ? <Loader2 size={24} className="animate-spin" /> : <Paperclip size={24} />}
                                </button>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder={selectedChannel.type === 'SUPPORT' ? "XFER_REPLY_SUPPORT..." : "XFER_REPLY_PROJECT..."}
                                    className="flex-1 bg-transparent border-none outline-none text-[13px] font-black uppercase italic tracking-tight text-primary placeholder:text-secondary/10 min-h-[44px] max-h-[200px] py-3"
                                    rows={1}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend(e as any);
                                        }
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={(!message.trim() && !selectedFile) || isUploading}
                                    className="p-6 bg-primary text-background rounded-[1.5rem] hover:scale-110 active:scale-90 transition-all duration-500 shadow-2xl shadow-primary/20 disabled:grayscale disabled:opacity-20 disabled:scale-100 group/send"
                                >
                                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-500" />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])}
                                />
                            </form>
                            <div className="mt-4 flex items-center gap-4 px-6 text-[8px] font-black text-secondary/20 uppercase tracking-[0.4em] italic">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                STATION_TERM_EN_LIGNE // CANAL_XFER_READY
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary/[0.01] pointer-events-none" />
                        <MessageSquare className="w-24 h-24 mb-10 text-primary/5" />
                        <span className="text-[11px] font-black uppercase tracking-[0.5em] text-secondary/10 italic animate-pulse">
                            ATTENTE_SÉLECTION_CANAL_OPÉRATIONNEL_V2.0
                        </span>
                    </div>
                )}
            </div>

            {/* Global Background Scanlines */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02] overflow-hidden z-0">
                <div className="w-full h-full bg-[linear-gradient(rgba(37,99,235,0.05)_1px,transparent_1px)] bg-[size:100%_4px]" />
            </div>
        </div>
    );
}


