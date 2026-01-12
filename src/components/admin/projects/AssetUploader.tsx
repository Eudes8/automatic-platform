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
                className="w-full py-4 border-2 border-dashed border-slate-700 rounded-xl text-slate-500 font-bold uppercase text-xs tracking-widest hover:border-blue-500 hover:text-blue-500 transition-all flex items-center justify-center gap-2"
            >
                <UploadCloud className="w-4 h-4" /> Ajouter un livrable
            </button>
        );
    }

    return (
        <div className="bg-slate-900 border border-white/10 rounded-xl p-6 relative">
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
            </button>
            <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Nouveau Livrable</h4>
            <form onSubmit={handleUpload} className="space-y-4">
                <div>
                    <label className="text-xs text-slate-500 font-bold uppercase tracking-widest block mb-1">Nom du fichier</label>
                    <input
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none"
                        placeholder="Ex: Maquette Home v2"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                    />
                </div>

                {/* File Input for Real Upload */}
                <div>
                    <label className="text-xs text-slate-500 font-bold uppercase tracking-widest block mb-1">Fichier (Max 10MB)</label>
                    <div className="relative group">
                        <input
                            type="file"
                            name="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={(e) => {
                                // Optional: auto-fill name if empty
                                if (e.target.files?.[0] && !name) {
                                    setName(e.target.files[0].name);
                                }
                            }}
                        />
                        <div className="w-full bg-slate-950 border border-white/10 border-dashed group-hover:border-blue-500 rounded-lg p-3 text-sm text-slate-400 flex items-center gap-2">
                            <UploadCloud className="w-4 h-4" />
                            <span>Glisser-déposer ou cliquer pour choisir</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    {[
                        { id: 'pdf', label: 'PDF', icon: FileText },
                        { id: 'code', label: 'Code', icon: Code },
                        { id: 'link', label: 'Lien', icon: Globe },
                    ].map(t => (
                        <div
                            key={t.id}
                            onClick={() => setType(t.id)}
                            className={`cursor-pointer p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${type === t.id
                                ? "bg-blue-600/20 border-blue-500 text-blue-400"
                                : "bg-slate-950 border-white/5 text-slate-500 hover:bg-slate-900"
                                }`}
                        >
                            <t.icon className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase">{t.label}</span>
                        </div>
                    ))}
                </div>

                {type === 'link' && (
                    <div>
                        <label className="text-xs text-slate-500 font-bold uppercase tracking-widest block mb-1">URL (si Lien externe)</label>
                        <input
                            className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none"
                            placeholder="https://..."
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                        />
                    </div>
                )}

                <button
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 rounded-lg text-white font-bold uppercase text-xs tracking-widest hover:bg-blue-500 transition-all flex items-center justify-center gap-2"
                >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Publier le livrable
                </button>
            </form>
        </div>
    );
}
