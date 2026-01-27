"use client";

import { useState } from "react";
import { UploadCloud, FileText, Code, Globe, Loader2, X } from "lucide-react";
import { createProjectAsset } from "@/lib/actions/adminProjectOps";

export default function AssetUploader({ projectId }: { projectId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [type, setType] = useState("pdf"); // pdf, code, link
    const [url, setUrl] = useState("");

    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        // Add manual states
        formData.append("name", name);
        formData.append("type", type);
        formData.append("projectId", projectId);
        if (url) formData.append("url", url); // External link fallback

        await createProjectAsset(formData);

        setLoading(false);
        setIsOpen(false);
        setName("");
        setUrl("");
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="group w-full py-8 border-2 border-dashed border-border/50 rounded-[2.5rem] bg-white/40 backdrop-blur-3xl text-primary/40 font-black uppercase text-[10px] tracking-[0.4em] hover:border-primary/50 hover:text-primary hover:bg-white transition-all duration-500 flex flex-col items-center justify-center gap-4 italic shadow-sm hover:shadow-xl"
            >
                <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-background transition-all duration-500 shadow-inner">
                    <UploadCloud className="w-6 h-6" />
                </div>
                + AJOUTER UN LIVRABLE
            </button>
        );
    }

    return (
        <div className="bg-white border border-border/50 rounded-[3rem] p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <button
                onClick={() => setIsOpen(false)}
                className="absolute top-8 right-8 text-secondary/20 hover:text-primary transition-all duration-500 hover:rotate-90"
            >
                <X className="w-5 h-5" />
            </button>

            <div className="mb-8">
                <p className="text-[9px] text-primary/40 font-black uppercase tracking-[0.5em] italic mb-2">GESTIONNAIRE DES DOCUMENTS // AJOUT</p>
                <h4 className="text-xl font-black text-primary italic uppercase tracking-tighter">PARAMÈTRES LIVRABLE.</h4>
            </div>

            <form onSubmit={handleUpload} className="space-y-8">
                <div className="space-y-3">
                    <label className="text-[9px] font-black text-secondary/40 uppercase tracking-[0.4em] ml-2 italic leading-relaxed">NOM DU DOCUMENT</label>
                    <input
                        className="w-full bg-background border border-border/50 rounded-[1.5rem] p-5 text-[11px] font-black uppercase italic tracking-widest text-primary focus:border-primary/50 focus:ring-8 focus:ring-primary/5 outline-none transition-all duration-500 shadow-inner placeholder:text-secondary/10"
                        placeholder="TITRE DU FICHIER..."
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-3">
                    <label className="text-[9px] font-black text-secondary/40 uppercase tracking-[0.4em] ml-2 italic leading-relaxed">SOURCE DU FICHIER (MAX 10MB)</label>
                    <div className="relative group">
                        <input
                            type="file"
                            name="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={(e) => {
                                if (e.target.files?.[0] && !name) {
                                    setName(e.target.files[0].name.toUpperCase());
                                }
                            }}
                        />
                        <div className="w-full bg-background border border-border/50 border-dashed group-hover:border-primary group-hover:bg-primary/5 rounded-[1.5rem] p-8 text-[10px] font-black uppercase italic tracking-widest text-secondary/40 flex flex-col items-center justify-center gap-4 transition-all duration-500">
                            <UploadCloud className="w-8 h-8 opacity-20 group-hover:opacity-100 transition-opacity" />
                            <span>CLIQUEZ POUR PARCOURIR</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[9px] font-black text-secondary/40 uppercase tracking-[0.4em] ml-2 italic leading-relaxed">TYPE DE LIVRABLE</label>
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { id: 'pdf', label: 'PDF', icon: FileText },
                            { id: 'code', label: 'CODE', icon: Code },
                            { id: 'link', label: 'LIEN', icon: Globe },
                        ].map(t => (
                            <div
                                key={t.id}
                                onClick={() => setType(t.id)}
                                className={`cursor-pointer p-6 rounded-[1.5rem] border flex flex-col items-center gap-3 transition-all duration-500 shadow-sm ${type === t.id
                                    ? "bg-primary border-primary text-background shadow-xl shadow-primary/20 scale-105"
                                    : "bg-background border-border/50 text-secondary/40 hover:text-primary hover:border-primary/30"
                                    }`}
                            >
                                <t.icon className={`w-5 h-5 ${type === t.id ? "animate-pulse" : "opacity-40"}`} />
                                <span className="text-[8px] font-black uppercase tracking-widest italic">{t.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {type === 'link' && (
                    <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                        <label className="text-[9px] font-black text-secondary/40 uppercase tracking-[0.4em] ml-2 italic leading-relaxed">ADRESSE URL EXTERNE</label>
                        <input
                            className="w-full bg-background border border-border/50 rounded-[1.5rem] p-5 text-[11px] font-black uppercase italic tracking-widest text-primary focus:border-primary/50 outline-none transition-all duration-500 shadow-inner"
                            placeholder="HTTPS://..."
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                        />
                    </div>
                )}

                <button
                    disabled={loading}
                    className="w-full py-6 bg-primary text-background rounded-[2rem] text-[11px] font-black uppercase tracking-[0.4em] italic flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 shadow-2xl shadow-primary/20 disabled:grayscale disabled:opacity-50 group/submit relative overflow-hidden"
                >
                    <div className="relative z-10 flex items-center gap-4">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud size={18} />}
                        {loading ? "ENVOI EN COURS..." : "PUBLIER LE LIVRABLE"}
                    </div>
                    {/* Scanline Effect inside button on hover */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 group-hover/submit:opacity-10 transition-opacity">
                        <div className="w-full h-1 bg-white animate-scan-line" />
                    </div>
                </button>
            </form>
        </div>
    );
}
