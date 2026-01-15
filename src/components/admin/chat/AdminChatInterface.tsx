"use client";

import { useEffect, useRef, useState } from "react";
import { Send, User, Building, MessageSquare, Mail, RefreshCw } from "lucide-react";
import { sendAdminMessage } from "@/lib/actions/adminMessage";
import { sendMessage } from "@/lib/actions/chat";
import { supabase } from "@/lib/supabase";
import { getAllChatChannels } from "@/lib/actions/adminChat";

interface Message {
    id: string;
    text: string;
    createdAt: string;
    senderId: string;
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
    const scrollRef = useRef<HTMLDivElement>(null);

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
        if (!message.trim() || !selectedChannel) return;

        const currentMsg = message;
        setMessage("");

        // Optimistic UI for Admin
        const tempId = `temp-${Date.now()}`;
        const optimisticMsg: Message = {
            id: tempId,
            text: currentMsg,
            createdAt: new Date().toISOString(),
            senderId: 'admin', // Placeholder
            sender: { role: 'ADMIN', name: 'Admin' }
        };

        setChannels(prev => prev.map(ch => {
            if (ch.id === selectedChannel.id) {
                return { ...ch, messages: [...ch.messages, optimisticMsg] };
            }
            return ch;
        }));

        try {
            if (selectedChannel.type === 'PROJECT') {
                await sendAdminMessage(selectedChannel.id, currentMsg);
            } else {
                await sendMessage(selectedChannel.id, currentMsg);
            }

            // Realtime will replace the optimistic UI
            setTimeout(() => {
                setChannels(prev => prev.map(ch => {
                    if (ch.id === selectedChannel.id) {
                        const hasReal = ch.messages.some(m => !m.id.startsWith('temp-') && m.text === currentMsg);
                        return hasReal ? { ...ch, messages: ch.messages.filter(m => m.id !== tempId) } : ch;
                    }
                    return ch;
                }));
            }, 3000);
        } catch (error) {
            console.error("Failed to send admin message:", error);
            setMessage(currentMsg);
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
            <div className="flex flex-col items-center justify-center p-20 glass-premium rounded-[2.5rem] text-center h-full">
                <Building className="w-12 h-12 text-secondary/20 mb-4" />
                <p className="text-secondary font-bold uppercase text-[10px] tracking-[0.2em]">Silence Radio</p>
                <p className="text-secondary/40 text-xs mt-2">Aucune discussion active n'a été trouvée sur le réseau.</p>
                <button onClick={refreshData} className="mt-6 flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-xl text-primary text-xs font-bold uppercase tracking-widest hover:bg-primary/20 transition-all">
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} /> Actualiser
                </button>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-180px)] glass-premium rounded-[2.5rem] overflow-hidden">
            {/* Sidebar List */}
            <div className="w-[350px] border-r border-border bg-card/10 flex flex-col">
                <div className="p-6 border-b border-border bg-card/5 flex items-center gap-2">
                    <div className="relative flex-1">
                        <input
                            placeholder="Rechercher..."
                            className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-xs text-primary focus:border-primary outline-none transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={refreshData}
                        disabled={isRefreshing}
                        className="p-3 bg-primary/5 rounded-xl hover:bg-primary/10 transition-all text-primary disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
                    {filteredChannels.map((channel) => {
                        const lastMsg = channel.messages[channel.messages.length - 1];
                        return (
                            <button
                                key={channel.id}
                                onClick={() => setSelectedChannelId(channel.id)}
                                className={`w-full p-5 text-left rounded-2xl transition-all group ${selectedChannelId === channel.id
                                    ? "bg-primary text-background shadow-lg shadow-primary/10"
                                    : "hover:bg-primary/5 text-secondary"
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`font-heading font-bold text-sm truncate pr-2 ${selectedChannelId === channel.id ? "text-background" : "text-primary"}`}>
                                        {channel.client?.name || "Client Inconnu"}
                                    </span>
                                    <span className="text-[9px] font-bold opacity-40 whitespace-nowrap pt-1">
                                        {lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    {channel.type === 'SUPPORT' ? (
                                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border ${selectedChannelId === channel.id ? "border-white/20 bg-white/10" : "border-blue-500/20 bg-blue-500/10 text-blue-500"}`}>
                                            Support
                                        </span>
                                    ) : (
                                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border ${selectedChannelId === channel.id ? "border-white/20 bg-white/10" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"}`}>
                                            Projet
                                        </span>
                                    )}
                                    <p className={`text-[10px] font-bold uppercase tracking-wider opacity-60 truncate flex-1`}>{channel.title}</p>
                                </div>

                                {lastMsg && (
                                    <p className={`text-xs truncate italic opacity-50`}>
                                        "{lastMsg.text}"
                                    </p>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-background/20">
                {selectedChannel ? (
                    <>
                        <header className="p-8 border-b border-border flex justify-between items-center bg-card/10 text-background">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-heading font-bold text-primary text-xl tracking-tight">{selectedChannel.title}</h3>
                                    <div className="px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded text-[9px] font-black uppercase border border-blue-500/10">
                                        {selectedChannel.status}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-[10px] font-bold text-secondary/40 uppercase tracking-widest">
                                    <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {selectedChannel.client?.name || "Anonyme"}</span>
                                    {selectedChannel.client?.email && (
                                        <span className="flex items-center gap-1.5 border-l border-border pl-4 ml-0"><Mail className="w-3.5 h-3.5" /> {selectedChannel.client.email}</span>
                                    )}
                                </div>
                            </div>
                        </header>

                        <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar" ref={scrollRef}>
                            {selectedChannel.messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-secondary/20 italic text-sm text-center">
                                    <MessageSquare className="w-10 h-10 mb-4 opacity-10" />
                                    Silence opérationnel.
                                </div>
                            ) : (
                                selectedChannel.messages.map((msg: Message) => {
                                    const senderRole = msg.sender?.role || 'CLIENT';
                                    const isMe = senderRole === "ADMIN" || senderRole === "STAFF";

                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                            <div className={`flex gap-4 max-w-[75%] ${isMe ? "flex-row-reverse text-right" : ""}`}>
                                                <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center font-black text-[10px] ${isMe ? "bg-primary text-background" : "bg-card border border-border text-primary"
                                                    }`}>
                                                    {isMe ? "ADM" : "CLI"}
                                                </div>
                                                <div className={`flex flex-col gap-2 ${isMe ? "items-end" : "items-start"}`}>
                                                    <div className={`p-5 rounded-2xl text-[13px] leading-relaxed font-medium ${isMe ? "bg-primary text-background rounded-tr-none shadow-xl shadow-primary/5"
                                                        : "bg-card border border-border text-primary rounded-tl-none shadow-sm"
                                                        }`}>
                                                        <p className="whitespace-pre-wrap">{msg.text}</p>
                                                    </div>
                                                    <span className="text-[9px] text-secondary/40 font-bold uppercase tracking-widest">
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="p-8 border-t border-border bg-card/5">
                            <form onSubmit={handleSend} className="relative">
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder={selectedChannel.type === 'SUPPORT' ? "Répondre au support..." : "Répondre sur le projet..."}
                                    className="w-full bg-background/50 border border-border rounded-2xl py-5 pl-8 pr-16 text-primary placeholder:text-secondary/30 focus:border-primary outline-none transition-all shadow-sm font-medium resize-none"
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
                                    disabled={!message.trim()}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-4 bg-primary text-background rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/10 disabled:grayscale disabled:opacity-50"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-secondary/20">
                        <MessageSquare className="w-12 h-12 mb-4 opacity-5" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Sélectionnez un canal opérationnel</span>
                    </div>
                )}
            </div>
        </div>
    );
}
