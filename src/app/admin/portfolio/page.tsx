import { getPortfolioItemsAdmin } from "@/lib/actions/adminPortfolio";
import PortfolioCRUDModal from "@/components/admin/portfolio/PortfolioCRUDModal";
import Image from "next/image";
import { ExternalLink, Github, Terminal, Grid2X2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PortfolioProject } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminPortfolio() {
    const projects = await getPortfolioItemsAdmin();

    return (
        <div className="space-y-14 p-10 lg:p-14 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-border/50 pb-10">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <Terminal className="w-5 h-5 text-accent" />
                        <p className="text-[10px] text-primary/40 font-black uppercase tracking-[0.5em] italic">RECORDS_ARCHIVE // ALPHA_NODE</p>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-primary italic uppercase tracking-tighter leading-none">
                        GESTION <span className="text-secondary/20">Archives.</span>
                    </h1>
                    <p className="text-secondary/40 font-black text-[10px] uppercase tracking-[0.3em] mt-3 italic max-w-lg">
                        // CONTRÔLE_ET_DÉPLOIEMENT_DES_PREUVES_D_EXÉCUTION.
                    </p>
                </div>
                <PortfolioCRUDModal mode="CREATE" />
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {projects.map((project: PortfolioProject) => (
                    <div key={project.id} className="group bg-white/40 backdrop-blur-3xl border border-border/50 rounded-[3rem] p-10 flex flex-col sm:flex-row gap-10 items-start hover:border-primary/50 transition-all duration-700 shadow-xl hover:shadow-2xl relative overflow-hidden group/item">
                        {/* Background identifier */}
                        <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none uppercase font-black text-6xl italic group-hover/item:opacity-[0.05] transition-opacity duration-700">
                            {project.category}
                        </div>

                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/2 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                        <div className="relative w-48 h-48 flex-shrink-0 rounded-[2rem] overflow-hidden border border-border/50 shadow-inner group/img">
                            <Image
                                src={project.image}
                                alt={project.title}
                                fill
                                className="object-cover grayscale group-hover/img:grayscale-0 group-hover/img:scale-110 transition-all duration-1000"
                            />
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/img:opacity-100 transition-opacity" />
                        </div>

                        <div className="flex-grow space-y-6 min-w-0">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-[9px] font-black text-accent uppercase tracking-[0.2em] italic mb-3 block border-l-2 border-accent/30 pl-3">
                                        UNIT_TYPE: {project.category}
                                    </span>
                                    <h3 className="text-3xl font-black text-primary uppercase italic tracking-tighter group-hover:text-accent transition-colors duration-500">
                                        {project.title}
                                    </h3>
                                </div>
                                <PortfolioCRUDModal mode="EDIT" project={project} />
                            </div>

                            <p className="text-secondary/40 text-[11px] font-bold uppercase italic tracking-tight line-clamp-3 leading-relaxed">
                                // {project.description}
                            </p>

                            <div className="flex flex-wrap gap-3 pt-2">
                                {project.tech.map((t) => (
                                    <span key={t} className="text-[8px] font-black text-secondary/20 uppercase tracking-widest border border-border/50 bg-background/50 px-3 py-1 rounded-lg italic group-hover:bg-primary/5 group-hover:text-primary transition-all duration-500">
                                        {t}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center gap-8 pt-8 border-t border-border/30">
                                {project.url && (
                                    <a href={project.url} target="_blank" className="flex items-center gap-2 text-[9px] font-black uppercase text-secondary/20 hover:text-primary transition-all duration-500 group/link">
                                        <ExternalLink size={14} className="group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 transition-transform" />
                                        LIVE_NODES
                                    </a>
                                )}
                                {project.github && (
                                    <a href={project.github} target="_blank" className="flex items-center gap-2 text-[9px] font-black uppercase text-secondary/20 hover:text-primary transition-all duration-500 group/link">
                                        <Github size={14} className="group-hover/link:scale-110 transition-transform" />
                                        SOURCE_XFER
                                    </a>
                                )}
                                <div className="ml-auto flex items-center gap-3">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        project.featured ? 'bg-primary animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.5)]' : 'bg-secondary/20'
                                    )} />
                                    <span className="text-[8px] font-black uppercase text-secondary/20 tracking-widest italic pt-0.5">
                                        {project.featured ? 'UNIT_FEATURED_ACTIVE' : 'UNIT_ARCHIVE_STD'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Scanline Effect */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 group-hover:opacity-[0.03] transition-opacity duration-700">
                            <div className="w-full h-[1px] bg-primary animate-scan-line" />
                        </div>
                    </div>
                ))}

                {projects.length === 0 && (
                    <div className="col-span-full py-48 text-center bg-white/40 backdrop-blur-3xl border border-dashed border-border/50 rounded-[3rem] shadow-inner relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary/2 pointer-events-none" />
                        <Grid2X2 className="w-20 h-20 text-primary/5 mx-auto mb-10" />
                        <p className="text-secondary/20 font-black uppercase tracking-[0.4em] italic leading-relaxed">
                            // AUCUNE_ARCHIVE_DÉTECTÉE_DANS_LE_MAINFRAME. <br />
                            EN_ATTENTE_D_IMAGE_DISK_POUR_INDEXATION.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
