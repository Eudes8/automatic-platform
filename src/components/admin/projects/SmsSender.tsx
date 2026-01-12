"use client";

import { useState } from "react";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { sendProjectSMS } from "@/lib/actions/adminProjectOps";

export default function SmsSender({ projectId }: { projectId: string }) {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await sendProjectSMS(projectId, message);
        setLoading(false);
        setSent(true);
        setMessage("");
        setTimeout(() => setSent(false), 3000);
    };

    return (
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                    <MessageSquare className="w-4 h-4" />
                </div>
                <h4 className="text-white font-bold uppercase text-xs tracking-widest">SMS Gateway</h4>
            </div>

            <form onSubmit={handleSend} className="space-y-4">
                <textarea
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-green-500 outline-none min-h-[100px] font-medium resize-none"
                    placeholder="Écrivez votre message urgent ici..."
                    maxLength={160}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    required
                />
                <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{message.length}/160 caractères</span>
                    <button
                        disabled={loading || sent}
                        className={`px-6 py-2 rounded-lg font-bold uppercase text-[10px] tracking-widest transition-all flex items-center gap-2 ${sent
                                ? "bg-green-500 text-slate-950"
                                : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                            }`}
                    >
                        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : sent ? "Envoyé" : <><Send className="w-3 h-3" /> Envoyer SMS</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
