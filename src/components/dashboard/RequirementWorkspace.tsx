"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
    MessageSquare,
    Plus,
    Send,
    CheckCircle2,
    Clock,
    AlertCircle,
    User,
    Shield,
    ChevronDown,
    ChevronUp,
    Loader2,
    FileText,
    History,
    Paperclip,
    Download,
    LayoutTemplate
} from "lucide-react";
import {
    createRequirement,
    addRequirementComment,
    updateRequirementStatus,
    getProjectRequirements
} from "@/lib/actions/requirements";
import { RequirementStatus, RequirementCategory } from "@prisma/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { estimateBudget } from "@/lib/utils/budgetEstimator";
import { generateApprovedRequirementsPDF } from "@/lib/utils/pdf-requirements";
import { downloadBlob } from "@/lib/utils/pdf";
import { REQUIREMENT_TEMPLATES } from "@/lib/requirementTemplates";
import { RequirementAttachmentUploader } from "./RequirementAttachmentUploader";
import { useRequirementsRealtime } from "@/hooks/useRequirementsRealtime";

interface RequirementWorkspaceProps {
    projectId: string;
    initialRequirements: any[];
    currentUser: any;
}

export default function RequirementWorkspace({
    projectId,
    initialRequirements,
    currentUser
}: RequirementWorkspaceProps) {
    const [requirements, setRequirements] = useState(initialRequirements);
    const [isAdding, setIsAdding] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [newCategory, setNewCategory] = useState<RequirementCategory>("OTHER");
    const [categoryFilter, setCategoryFilter] = useState<RequirementCategory | "ALL">("ALL");
    const [statusFilter, setStatusFilter] = useState<RequirementStatus | "ALL">("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [isPending, setIsPending] = useState(false);
    const [expandedIds, setExpandedIds] = useState<string[]>([]);

    const refreshRequirements = useCallback(async () => {
        try {
            const updated = await getProjectRequirements(projectId);
            setRequirements(updated);
        } catch (error) {
            console.error("Failed to refresh requirements:", error);
        }
    }, [projectId]);

    // Hook temps réel
    useRequirementsRealtime(projectId, refreshRequirements);

    const toggleExpand = (id: string) => {
        setExpandedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const estimatedBudget = useMemo(() => estimateBudget(requirements), [requirements]);

    const filteredRequirements = useMemo(() => {
        return requirements.filter(req => {
            const matchesCategory = categoryFilter === "ALL" || req.category === categoryFilter;
            const matchesStatus = statusFilter === "ALL" || req.status === statusFilter;
            const matchesSearch = req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                req.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesStatus && matchesSearch;
        });
    }, [requirements, categoryFilter, statusFilter, searchQuery]);

    const handleCreate = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newTitle || !newDesc) return;
        setIsPending(true);
        try {
            await createRequirement(projectId, newTitle, newDesc, newCategory);
            // On attend que le hook realtime fasse le refresh ou on le fait manuellement
            await refreshRequirements();
            setIsAdding(false);
            setNewTitle("");
            setNewDesc("");
            setNewCategory("OTHER");
            toast.success("Point ajouté au cahier des charges");
        } catch (error) {
            toast.error("Erreur lors de l'ajout");
        } finally {
            setIsPending(false);
        }
    };

    const applyTemplate = (tpl: any) => {
        setNewTitle(tpl.title);
        setNewDesc(tpl.description);
        setNewCategory(tpl.category);
        setShowTemplates(false);
        setIsAdding(true);
        toast.success(`Template "${tpl.title}" appliqué`);
    };

    const handleExportPDF = async () => {
        try {
            toast.promise(
                async () => {
                    const pdfBytes = await generateApprovedRequirementsPDF("Projet", requirements, projectId);
                    // Use any to bypass strict SharedArrayBuffer checks in certain environments
                    const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
                    downloadBlob(blob, `Cahier_Des_Charges_Valide_${projectId.slice(-4)}.pdf`);
                },
                {
                    loading: 'Génération du PDF...',
                    success: 'PDF téléchargé !',
                    error: 'Erreur lors de la génération'
                }
            );
        } catch (e) {
            console.error(e);
        }
    };

    const handleComment = async (reqId: string, text: string, attachments: string[]) => {
        if (!text.trim() && attachments.length === 0) return;
        try {
            await addRequirementComment(reqId, text, attachments);
            await refreshRequirements();
        } catch (error) {
            toast.error("Erreur lors de l'envoi du commentaire");
        }
    };

    const handleStatusUpdate = async (reqId: string, status: RequirementStatus) => {
        try {
            await updateRequirementStatus(reqId, status);
            await refreshRequirements();
            toast.success(`Statut mis à jour : ${status}`);
        } catch (error) {
            toast.error("Erreur de mise à jour");
        }
    };

    const getStatusIcon = (status: RequirementStatus) => {
        switch (status) {
            case "APPROVED": return <CheckCircle2 className="text-emerald-500" size={16} />;
            case "IN_REVIEW": return <Clock className="text-amber-500" size={16} />;
            case "REJECTED": return <AlertCircle className="text-rose-500" size={16} />;
            default: return <MessageSquare className="text-primary/40" size={16} />;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-8 border-b border-border/50">
                <div>
                    <h3 className="text-3xl font-black text-primary italic uppercase tracking-tighter leading-none mb-3">
                        WORKSPACE <span className="text-secondary/20">CAHIER DES CHARGES.</span>
                    </h3>
                    <p className="text-[9px] font-black text-secondary/30 uppercase tracking-[0.3em] italic">Espace d'échange et de validation des spécifications</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setShowTemplates(!showTemplates)}
                        className="flex items-center gap-3 px-6 py-4 bg-white border border-border/50 text-secondary/60 font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl hover:border-primary/30 transition-all italic shadow-sm"
                    >
                        <LayoutTemplate size={14} /> TEMPLATES
                    </button>
                    <button
                        onClick={handleExportPDF}
                        className="flex items-center gap-3 px-6 py-4 bg-white border border-border/50 text-primary font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl hover:border-primary/30 transition-all italic shadow-sm"
                    >
                        <FileText size={14} /> EXPORT_PDF
                    </button>
                    <button
                        onClick={() => { setIsAdding(!isAdding); setShowTemplates(false); }}
                        className="flex items-center gap-3 px-8 py-4 bg-primary text-background font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all italic"
                    >
                        {isAdding ? "ANNULER" : <><Plus size={14} /> NOUVEAU_POINT</>}
                    </button>
                </div>
            </div>

            {/* Templates Quick View */}
            {showTemplates && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-8 bg-slate-50 border border-dashed border-border/50 rounded-[2.5rem] animate-in slide-in-from-top-4 duration-500">
                    <div className="col-span-full flex justify-between items-center mb-4">
                        <p className="text-[10px] font-black text-secondary/30 uppercase tracking-[0.4em] italic font-heading">// SÉLECTIONNEZ_UN_MODÈLE</p>
                        <button onClick={() => setShowTemplates(false)} className="text-secondary/20 hover:text-primary transition-colors"><X size={20} /></button>
                    </div>
                    {REQUIREMENT_TEMPLATES.map((tpl, i) => (
                        <button
                            key={i}
                            onClick={() => applyTemplate(tpl)}
                            className="p-6 bg-white border border-border/50 rounded-2xl text-left hover:border-primary/30 hover:shadow-xl transition-all group"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h5 className="text-[10px] font-black text-primary uppercase italic group-hover:text-primary transition-colors">{tpl.title}</h5>
                                <span className="text-[7px] font-black px-2 py-0.5 bg-secondary/5 text-secondary/30 rounded uppercase tracking-tighter">{tpl.category}</span>
                            </div>
                            <p className="text-[9px] text-secondary/50 italic leading-relaxed line-clamp-2">{tpl.description}</p>
                        </button>
                    ))}
                </div>
            )}

            {/* Filters & Search */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-4">
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value as any)}
                        className="h-10 px-4 bg-white border border-border/50 rounded-xl text-[10px] uppercase font-bold text-secondary/70 focus:outline-none focus:border-primary/30"
                    >
                        <option value="ALL">Toutes Catégories</option>
                        {Object.keys(RequirementCategory).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="h-10 px-4 bg-white border border-border/50 rounded-xl text-[10px] uppercase font-bold text-secondary/70 focus:outline-none focus:border-primary/30"
                    >
                        <option value="ALL">Tous Statuts</option>
                        {Object.keys(RequirementStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="relative w-full md:w-64">
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Rechercher un point..."
                        className="h-10 px-4 w-full bg-white border border-border/50 rounded-xl text-[10px] font-bold text-secondary/70 focus:outline-none focus:border-primary/30 placeholder:text-secondary/20 uppercase tracking-wide"
                    />
                </div>
            </div>

            {/* Price Note */}
            <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-[2rem] flex items-start gap-4">
                <AlertCircle className="text-amber-500 shrink-0 mt-1" size={18} />
                <div>
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest italic mb-1">NOTE SUR LA RÉMUNÉRATION</p>
                    <p className="text-[9px] text-secondary/50 font-bold leading-relaxed italic">
                        Le montant du contrat est une estimation basée sur {requirements.filter(r => r.status === 'APPROVED').length} points validés. <br />
                        Budget Estimé actuel : <span className="text-primary font-black">{estimatedBudget.toLocaleString()} XOF</span>
                    </p>
                </div>
            </div>

            {/* Add Form */}
            {isAdding && (
                <form onSubmit={handleCreate} className="p-8 bg-white border border-primary/20 rounded-[2.5rem] shadow-2xl animate-in slide-in-from-top-4 duration-500 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[9px] font-black text-secondary/30 uppercase tracking-[0.4em] ml-4 italic font-heading">Titre du besoin</label>
                            <input
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="Ex: Système de parrainage..."
                                className="w-full h-16 bg-background border border-border/50 rounded-2xl px-6 text-sm font-bold focus:border-primary/50 outline-none transition-all placeholder:text-secondary/20 italic"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-secondary/30 uppercase tracking-[0.4em] ml-4 italic font-heading">Catégorie</label>
                            <div className="relative">
                                <select
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value as RequirementCategory)}
                                    className="w-full h-16 bg-background border border-border/50 rounded-2xl px-6 text-xs font-bold focus:border-primary/50 outline-none transition-all text-secondary/70 appearance-none uppercase"
                                >
                                    {Object.keys(RequirementCategory).map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-secondary/20 pointer-events-none" size={16} />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-secondary/30 uppercase tracking-[0.4em] ml-4 italic font-heading">Description détaillée</label>
                        <textarea
                            value={newDesc}
                            onChange={(e) => setNewDesc(e.target.value)}
                            rows={4}
                            placeholder="Décrivez précisément ce que vous attendez..."
                            className="w-full bg-background border border-border/50 rounded-3xl p-6 text-sm font-bold focus:border-primary/50 outline-none transition-all placeholder:text-secondary/20 italic resize-none"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-6 bg-primary text-background font-black uppercase text-[11px] tracking-[0.4em] rounded-[1.8rem] flex items-center justify-center gap-4 transition-all hover:shadow-2xl hover:scale-[1.02] disabled:opacity-50"
                    >
                        {isPending ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                        PROPOSER_POINT_TECHNIQUE
                    </button>
                </form>
            )}

            {/* List */}
            <div className="space-y-4">
                {filteredRequirements.length === 0 ? (
                    <div className="p-20 text-center bg-background/30 border border-dashed border-border/50 rounded-[3rem]">
                        <MessageSquare className="w-12 h-12 text-secondary/10 mx-auto mb-6" />
                        <p className="text-[10px] font-black text-secondary/30 uppercase tracking-[0.4em] italic leading-relaxed">
                            Aucun point technique ne correspond aux filtres.<br />
                            Commencez par ajouter un nouveau point ou utilisez un modèle.
                        </p>
                    </div>
                ) : (
                    filteredRequirements.map((req) => (
                        <div
                            key={req.id}
                            className={cn(
                                "group bg-white/40 border transition-all duration-700 rounded-[2.5rem] overflow-hidden",
                                expandedIds.includes(req.id) ? "border-primary/20 shadow-xl" : "border-border/50 hover:border-primary/20"
                            )}
                        >
                            {/* Card Header */}
                            <div
                                onClick={() => toggleExpand(req.id)}
                                className="p-8 flex items-center justify-between cursor-pointer"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-white border border-border/50 flex items-center justify-center shadow-inner">
                                        {getStatusIcon(req.status)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h4 className="text-sm font-black text-primary uppercase italic tracking-tight">{req.title}</h4>
                                            <span className="px-2 py-0.5 rounded-md bg-secondary/5 text-[8px] font-black text-secondary/40 uppercase tracking-widest border border-secondary/10">
                                                {req.category || 'OTHER'}
                                            </span>
                                        </div>
                                        <p className="text-[9px] font-black text-secondary/30 uppercase tracking-widest italic mt-1 font-heading">
                                            Status: {req.status} // {new Date(req.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    {expandedIds.includes(req.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>
                            </div>

                            {/* Card Content (Expanded) */}
                            {expandedIds.includes(req.id) && (
                                <div className="px-8 pb-8 pt-0 space-y-8 animate-in slide-in-from-top-2 duration-500">
                                    <div className="p-8 bg-background/50 rounded-[2rem] border border-border/30">
                                        <p className="text-[11px] text-secondary/70 font-bold italic leading-relaxed whitespace-pre-wrap">
                                            {req.description}
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-3">
                                        {["APPROVED", "IN_REVIEW", "REJECTED"].map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => handleStatusUpdate(req.id, s as RequirementStatus)}
                                                className={cn(
                                                    "px-6 py-2.5 rounded-full text-[8px] font-black uppercase tracking-widest italic border transition-all",
                                                    req.status === s
                                                        ? "bg-primary text-background border-primary"
                                                        : "bg-white text-secondary/40 border-border/50 hover:border-primary hover:text-primary"
                                                )}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>

                                    {/* History & Comments Section */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t border-border/30">

                                        {/* History Column */}
                                        <div className="space-y-6">
                                            <p className="text-[9px] font-black text-secondary/20 uppercase tracking-[0.4em] italic mb-6">// HISTORIQUE_STATUTS</p>
                                            <div className="space-y-4 pl-4 border-l-2 border-dashed border-border/30">
                                                {req.statusHistory?.map((h: any) => (
                                                    <div key={h.id} className="relative">
                                                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-white border-2 border-secondary/20" />
                                                        <p className="text-[9px] font-bold text-secondary/60">
                                                            Passé de <span className="text-secondary/40">{h.from || '...'}</span> à <span className={cn(
                                                                "text-primary",
                                                                h.to === "APPROVED" && "text-emerald-500",
                                                                h.to === "REJECTED" && "text-rose-500"
                                                            )}>{h.to}</span>
                                                        </p>
                                                        <p className="text-[8px] text-secondary/30 mt-1 uppercase tracking-wider">{new Date(h.createdAt).toLocaleDateString()} à {new Date(h.createdAt).toLocaleTimeString()}</p>
                                                    </div>
                                                ))}
                                                {(!req.statusHistory || req.statusHistory.length === 0) && (
                                                    <p className="text-[8px] text-secondary/20 italic">Aucun changement de statut enregistré.</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Comments Column */}
                                        <div className="space-y-6">
                                            <p className="text-[9px] font-black text-secondary/20 uppercase tracking-[0.4em] italic mb-6">// CONVERSATION_FILTRÉE</p>

                                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                {req.comments?.length === 0 ? (
                                                    <p className="text-[8px] font-black text-secondary/10 uppercase italic text-center py-4 tracking-[0.2em]">Aucun message sur ce point</p>
                                                ) : (
                                                    req.comments.map((comment: any) => (
                                                        <div key={comment.id} className={cn(
                                                            "flex flex-col gap-2 p-5 rounded-2xl max-w-[90%]",
                                                            comment.authorId === currentUser.id
                                                                ? "bg-primary/5 border border-primary/10 ml-auto"
                                                                : "bg-slate-50 border border-slate-200"
                                                        )}>
                                                            <div className="flex gap-4">
                                                                <div className="shrink-0 w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-border/20">
                                                                    <User size={14} className="text-secondary/30" />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <p className="text-[10px] font-bold text-secondary/60 italic leading-relaxed">{comment.text}</p>
                                                                    {/* Attachments if any */}
                                                                    {comment.attachments && comment.attachments.length > 0 && (
                                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                                            {comment.attachments.map((att: string, i: number) => (
                                                                                <a key={i} href={att} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-border/20 rounded-lg hover:border-primary/20 transition-all group">
                                                                                    <Paperclip size={10} className="text-secondary/40 group-hover:text-primary transition-colors" />
                                                                                    <span className="text-[8px] font-bold text-secondary/50 group-hover:text-primary transition-colors uppercase tracking-wider">Doc {i + 1}</span>
                                                                                </a>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <p className="text-[7px] font-black text-secondary/20 uppercase tracking-widest text-right">{new Date(comment.createdAt).toLocaleTimeString()} // ID_{comment.authorId.slice(0, 4)}</p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>

                                            <CommentInput onSend={(text, attachments) => handleComment(req.id, text, attachments)} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function CommentInput({ onSend }: { onSend: (text: string, attachments: string[]) => void }) {
    const [text, setText] = useState("");
    const [attachments, setAttachments] = useState<string[]>([]);

    const handleSend = () => {
        if (!text.trim() && attachments.length === 0) return;
        onSend(text, attachments);
        setText("");
        setAttachments([]);
    };

    const addAttachment = (url: string) => {
        setAttachments(prev => [...prev, url]);
    };

    const removeAttachment = (url: string) => {
        setAttachments(prev => prev.filter(a => a !== url));
    };

    return (
        <div className="space-y-4 mt-6">
            {/* Display current attachments */}
            {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-dashed border-border/50 rounded-xl">
                    {attachments.map((url, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-border/20 rounded-lg">
                            <Paperclip size={10} className="text-primary" />
                            <span className="text-[8px] font-black text-secondary/30 uppercase tracking-wider flex-1 truncate max-w-[100px]">FICHIER_{i + 1}</span>
                            <button onClick={() => removeAttachment(url)} className="text-rose-500 hover:scale-110 transition-transform"><X size={10} /></button>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                    <input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                        placeholder="Ajouter un détail ou poser une question..."
                        className="flex-1 h-12 bg-white border border-border/50 rounded-xl px-6 text-[10px] font-bold outline-none focus:border-primary/30 italic"
                    />
                    <button
                        onClick={handleSend}
                        className="w-12 h-12 bg-primary text-background rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                    >
                        <Send size={16} />
                    </button>
                </div>
                <div className="flex items-center justify-end">
                    <RequirementAttachmentUploader onUploadSuccess={addAttachment} />
                </div>
            </div>
        </div>
    );
}

interface XProps {
    size: number;
    className?: string;
    onClick?: () => void;
}
function X({ size, className, onClick }: XProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            onClick={onClick}
        >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    )
}
