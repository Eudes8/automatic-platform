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
        <div className="space-y-8">
            <header className="mb-10">
                <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Documents & <span className="text-blue-500">Légalité.</span></h1>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2 ml-1 italic">Vérifiez vos garanties et engagements pour {project.title}</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-10 bg-white/5 border border-white/10 rounded-[2.5rem] relative overflow-hidden">
                    <Shield className="absolute -bottom-10 -right-10 w-48 h-48 text-blue-500/10" />

                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-8 italic">Contrat Cadre AUTOMATIC</h3>

                    <div className="space-y-6 relative z-10">
                        <div className="p-6 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-blue-500/20 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">{project.title}</h4>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black italic">Ref: CTR-{project.id.slice(0, 6).toUpperCase()}</p>
                                </div>
                            </div>
                            {project.contractSigned ? (
                                <div className="flex items-center gap-2">
                                    {project.contractUrl && (
                                        <a
                                            href={project.contractUrl}
                                            target="_blank"
                                            download
                                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all"
                                        >
                                            <FileText className="w-4 h-4" /> Télécharger PDF
                                        </a>
                                    )}
                                    <div className="flex items-center gap-2 text-green-500 text-[10px] font-black uppercase tracking-widest bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20">
                                        <CheckCircle className="w-4 h-4" /> Signé
                                    </div>
                                </div>
                            ) : (
                                <span className="text-amber-500 text-[10px] font-black uppercase tracking-widest bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/20 animate-pulse">En attente</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-10 bg-slate-900 border border-white/5 rounded-[2.5rem]">
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-6 underline decoration-4 decoration-blue-600 underline-offset-8">Garanties Contractuelles</h3>
                    <ul className="space-y-4">
                        {[
                            "Propriété intégrale du code source dès le paiement.",
                            "Hébergement managé avec 99.9% de disponibilité.",
                            "Maintenance corrective gratuite pendant 3 mois.",
                            "Non-divulgation stricte (NDA) automatique.",
                            "Assistance technique prioritaire 24/7."
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 text-slate-400 text-sm font-medium border border-transparent hover:border-white/5 transition-all">
                                <CheckCircle className="w-5 h-5 text-blue-500 shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
