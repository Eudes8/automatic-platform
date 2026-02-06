import { getClientProjects } from "@/lib/actions/projects";
import { FileText, Shield, CheckCircle, Zap } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ContractsPage() {
    const projects = await getClientProjects();

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="mb-14">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-accent font-bold uppercase text-[10px] tracking-widest inline-block py-2 px-6 bg-accent/5 rounded-full border border-accent/10 shadow-inner">Service Juridique</span>
                </div>
                <h1 className="text-6xl md:text-8xl font-bold text-primary tracking-tight uppercase leading-[0.8]">
                    Documents & <br /><span className="text-secondary/20">Légalité</span>
                </h1>
                <p className="text-secondary/40 font-bold text-[10px] uppercase tracking-widest mt-8 ml-1 leading-relaxed max-w-xl">
                    Consultez vos contrats, garanties et engagements. <br />
                    Tous vos documents sont archivés en toute sécurité.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                {/* LEFT: Project Contracts List */}
                <div className="p-12 bg-card/30 border border-border/50 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none group-hover:bg-primary/10 transition-all duration-1000" />
                    <Shield className="absolute -bottom-16 -right-16 w-64 h-64 text-primary/5 rotate-12" />

                    <h3 className="text-2xl font-bold text-primary uppercase tracking-tight mb-10 group-hover:translate-x-2 transition-transform duration-500">Mes contrats</h3>

                    <div className="space-y-6 relative z-10">
                        {projects.length === 0 ? (
                            <div className="p-12 border border-dashed border-border/50 rounded-[2rem] text-center bg-background/20">
                                <FileText size={40} className="mx-auto text-secondary/10 mb-4" />
                                <p className="text-[10px] font-bold text-secondary/30 uppercase tracking-widest">Aucun contrat pour le moment</p>
                            </div>
                        ) : (
                            projects.map(project => (
                                <div key={project.id} className="p-8 bg-background/50 border border-border/50 rounded-[2rem] flex items-center justify-between group/item hover:bg-white hover:shadow-2xl hover:scale-[1.02] transition-all duration-500">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shadow-inner group-hover/item:bg-primary group-hover/item:text-background transition-all duration-500">
                                            <FileText className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-primary text-base uppercase tracking-tight mb-1">{project.title}</h4>
                                            <p className="text-[10px] text-secondary/40 uppercase tracking-widest font-bold">Réf : {project.id.slice(-8).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    {project.contractSigned ? (
                                        <div className="flex items-center gap-3 text-emerald-600 text-[9px] font-bold uppercase tracking-widest bg-emerald-500/5 px-6 py-3 rounded-full border border-emerald-500/10">
                                            <CheckCircle className="w-4 h-4" /> Signé
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 text-accent text-[9px] font-bold uppercase tracking-widest bg-accent/5 px-6 py-3 rounded-full border border-accent/10">
                                            <Zap className="w-4 h-4" /> En attente
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* RIGHT: Contractual Guarantees */}
                <div className="p-12 bg-background/80 border border-border/50 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-[80px] -ml-24 -mb-24 pointer-events-none" />

                    <h3 className="text-2xl font-bold text-primary uppercase tracking-tight mb-8 flex items-center gap-4">
                        <span className="w-8 h-1 bg-primary rounded-full group-hover:w-16 transition-all duration-700" />
                        Vos garanties
                    </h3>

                    <ul className="space-y-5 relative z-10">
                        {[
                            { text: "Propriété intégrale du code source dès le paiement final.", label: "PROPRIÉTÉ" },
                            { text: "Hébergement managé avec 99.9% de disponibilité réseau.", label: "DISPONIBILITÉ" },
                            { text: "Maintenance corrective gratuite incluse pendant 90 jours.", label: "MAINTENANCE" },
                            { text: "Non-divulgation stricte (NDA) activée par défaut.", label: "CONFIDENTIALITÉ" },
                            { text: "Accès prioritaire à l'unité de réponse technique 24/7.", label: "SUPPORT" }
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-6 p-6 rounded-[2rem] bg-card/30 border border-transparent hover:border-border/50 hover:bg-card/50 transition-all duration-500 group/list shadow-sm hover:shadow-xl">
                                <div className="p-3 bg-primary/5 rounded-xl text-primary group-hover/list:scale-110 transition-transform">
                                    <CheckCircle size={20} />
                                </div>
                                <div>
                                    <p className="text-secondary/60 text-[8px] font-bold uppercase tracking-widest mb-1 transition-colors group-hover/list:text-primary leading-none">{item.label}</p>
                                    <p className="text-primary font-bold text-sm tracking-tight leading-relaxed">{item.text}</p>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-12 p-8 bg-primary/5 rounded-[2rem] border border-primary/10 group-hover:bg-primary/10 transition-colors">
                        <p className="text-[10px] text-primary font-bold uppercase tracking-widest leading-relaxed text-center">
                            Les données sont synchronisées avec le registre officiel Automatic.<br />
                            Origine : Abidjan, Côte d'Ivoire
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
