import { getClientProjects } from "@/lib/actions/projects";
import { FileText, Shield, CheckCircle } from "lucide-react";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function ProjectContractsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const projects = await getClientProjects();
    const project = projects.find(p => p.id === id);

    if (!project) return notFound();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <header className="mb-6 sm:mb-10">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-primary italic uppercase tracking-tighter">Documents & <span className="text-accent">Légalité.</span></h1>
                <p className="text-secondary/40 font-black text-[9px] sm:text-xs uppercase tracking-widest mt-2 ml-1 italic">Vérifiez vos garanties et engagements pour {project.title}</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                <div className="p-6 sm:p-8 md:p-10 bg-card border border-border/50 rounded-[2rem] sm:rounded-[2.5rem] relative overflow-hidden shadow-xl">
                    <Shield className="absolute -bottom-10 -right-10 w-32 sm:w-48 h-32 sm:h-48 text-primary/5" />

                    <h3 className="text-xl sm:text-2xl font-black text-primary italic uppercase tracking-tighter mb-6 sm:mb-8 italic leading-none">Contrat Cadre AUTOMATIC</h3>

                    <div className="space-y-4 sm:space-y-6 relative z-10">
                        <div className="p-4 sm:p-6 bg-background border border-border/50 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:border-primary/20 transition-all shadow-inner">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                                    <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-primary text-xs sm:text-sm">{project.title}</h4>
                                    <p className="text-[8px] sm:text-[9px] text-secondary/40 uppercase tracking-widest font-black italic">Ref: CTR-{project.id.slice(0, 6).toUpperCase()}</p>
                                </div>
                            </div>
                            {project.contractSigned ? (
                                <div className="flex flex-wrap items-center gap-2">
                                    {project.contractUrl && (
                                        <a
                                            href={project.contractUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-[8px] sm:text-[10px] font-black uppercase tracking-widest bg-primary/5 text-primary px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-primary/20 hover:bg-primary hover:text-white transition-all"
                                        >
                                            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Télécharger
                                        </a>
                                    )}
                                    <div className="flex items-center gap-2 text-emerald-600 text-[8px] sm:text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-emerald-500/20">
                                        <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Signé
                                    </div>
                                </div>
                            ) : (
                                <span className="text-amber-500 text-[8px] sm:text-[10px] font-black uppercase tracking-widest bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/20 animate-pulse">En attente</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 sm:p-8 md:p-10 bg-card border border-border/50 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl">
                    <h3 className="text-lg sm:text-xl font-black text-primary italic uppercase tracking-tighter mb-6 underline decoration-4 decoration-primary/20 underline-offset-8">Garanties Contractuelles</h3>
                    <ul className="space-y-3 sm:space-y-4">
                        {[
                            "Propriété intégrale du code source dès le paiement.",
                            "Hébergement managé avec 99.9% de disponibilité.",
                            "Maintenance corrective gratuite pendant 3 mois.",
                            "Non-divulgation stricte (NDA) automatique.",
                            "Assistance technique prioritaire 24/7."
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-3 p-3 sm:p-4 rounded-xl bg-background border border-border/10 text-secondary/60 text-[11px] sm:text-xs font-bold uppercase italic tracking-tight hover:border-primary/10 transition-all shadow-sm">
                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
