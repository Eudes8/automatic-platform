"use client";

import { useEffect, useRef, useState } from "react";
import { Send, User, Building, MessageSquare, Mail } from "lucide-react";
import { sendAdminMessage } from "@/lib/actions/adminMessage";
import { supabase } from "@/lib/supabase";

interface ChatInterfaceProps {
    projects: any[];
}

export default function AdminChatInterface({ projects: initialProjects }: ChatInterfaceProps) {
    const [projects, setProjects] = useState(initialProjects);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(initialProjects[0]?.id || null);
    const [message, setMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    const selectedProject = projects.find(p => p.id === selectedProjectId);

    useEffect(() => {
        // Subscribe to NEW messages globally to update sidebar or current view
        const channel = supabase
            .channel('admin-chat-global')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'Message'
                },
                async (payload) => {
                    console.log('Admin: New message globally', payload);
                    const { getAllProjectsWithMessages } = await import("@/lib/actions/adminChat");
                    const updated = await getAllProjectsWithMessages();
                    setProjects(updated);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [selectedProjectId, selectedProject?.messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !selectedProjectId) return;

        const currentMsg = message;
        setMessage("");

        try {
            await sendAdminMessage(selectedProjectId, currentMsg);
        } catch (error) {
            console.error("Failed to send admin message:", error);
        }
    };

    const filteredProjects = projects.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.client?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!projects || projects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 glass-premium rounded-[2.5rem] text-center">
                <Building className="w-12 h-12 text-secondary/20 mb-4" />
                <p className="text-secondary font-bold uppercase text-[10px] tracking-[0.2em]">Silence Radio</p>
                <p className="text-secondary/40 text-xs mt-2">Aucune discussion active n'a été trouvée sur le réseau.</p>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-180px)] glass-premium rounded-[2.5rem] overflow-hidden">
            {/* Sidebar List */}
            <div className="w-[350px] border-r border-border bg-card/10 flex flex-col">
                <div className="p-6 border-b border-border bg-card/5">
                    <input
                        placeholder="Rechercher un client..."
                        className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-xs text-primary focus:border-primary outline-none transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
                    {filteredProjects.map((project) => (
                        <button
                            key={project.id}
                            onClick={() => setSelectedProjectId(project.id)}
                            className={`w-full p-5 text-left rounded-2xl transition-all group ${selectedProjectId === project.id
                                    ? "bg-primary text-background shadow-lg shadow-primary/10"
                                    : "hover:bg-primary/5 text-secondary"
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`font-heading font-bold text-sm truncate pr-2 ${selectedProjectId === project.id ? "text-background" : "text-primary"}`}>
                                    {project.client?.name || "Client Inconnu"}
                                </span>
                                <span className="text-[9px] font-bold opacity-40 whitespace-nowrap pt-1">
                                    {project.messages.length > 0
                                        ? new Date(project.messages[project.messages.length - 1].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                        : ""}
                                </span>
                            </div>
                            <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 opacity-60`}>{project.title.split(' - ')[0]}</p>
                            {project.messages.length > 0 && (
                                <p className={`text-xs truncate italic opacity-50`}>
                                    "{project.messages[project.messages.length - 1].text}"
                                </p>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-background/20">
                {selectedProject ? (
                    <>
                        <header className="p-8 border-b border-border flex justify-between items-center bg-card/10">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-heading font-bold text-primary text-xl tracking-tight">{selectedProject.title}</h3>
                                    <div className="px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded text-[9px] font-black uppercase border border-blue-500/10">
                                        {selectedProject.status}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-[10px] font-bold text-secondary/40 uppercase tracking-widest">
                                    <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {selectedProject.client?.name}</span>
                                    <span className="flex items-center gap-1.5 border-l border-border pl-4 ml-0"><Mail className="w-3.5 h-3.5" /> {selectedProject.client?.email}</span>
                                </div>
                            </div>
                        </header>

                        <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar" ref={scrollRef}>
                            {selectedProject.messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-secondary/20 italic text-sm text-center">
                                    <MessageSquare className="w-10 h-10 mb-4 opacity-10" />
                                    Silence opérationnel.
                                </div>
                            ) : (
                                selectedProject.messages.map((msg: any) => {
                                    const isMe = msg.sender?.role === "ADMIN" || msg.sender?.role === "STAFF";

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
                                                        <p>{msg.text}</p>
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
                                <input
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Écrire une réponse technique..."
                                    className="w-full bg-background/50 border border-border rounded-2xl py-5 pl-8 pr-16 text-primary placeholder:text-secondary/30 focus:border-primary outline-none transition-all shadow-sm font-medium"
                                />
                                <button
                                    type="submit"
                                    disabled={!message.trim()}
                                    className="absolute right-3 top-3 p-4 bg-primary text-background rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/10 disabled:grayscale disabled:opacity-50"
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
