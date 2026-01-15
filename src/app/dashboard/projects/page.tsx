import { getClientProjects } from "@/lib/actions/projects";
import Link from "next/link";
import { Lock, FileSignature, ChevronRight } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
    const projects = await getClientProjects();

    if (projects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                <p className="text-slate-500 font-bold uppercase tracking-widest italic">Aucun projet en cours</p>
                <Link href="/onboarding" className="text-blue-500 font-black uppercase text-[10px] tracking-widest hover:underline">
                    Initialiser un projet →
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            <header>
                <h1 className="text-4xl font-heading font-bold text-primary tracking-tight">Mes <span className="text-blue-500">Projets.</span></h1>
                <p className="text-secondary font-medium text-sm mt-2">Suivi détaillé de vos actifs numériques</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project) => (
                    <Link
                        key={project.id}
                        href={`/dashboard/projects/${project.id}`}
                        className="p-8 glass-premium rounded-[2.5rem] relative overflow-hidden group hover:border-primary/20 transition-all flex flex-col"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/2 rounded-full blur-3xl group-hover:bg-primary/5 transition-all" />

                        <div className="flex justify-between items-start mb-8">
                            <span className={`px-4 py-1.5 border text-[10px] font-bold uppercase tracking-wider rounded-full ${project.contractSigned
                                ? "bg-blue-500/10 border-blue-500/20 text-blue-500"
                                : "bg-orange-500/10 border-orange-500/20 text-orange-500"
                                }`}>
                                {project.contractSigned ? project.status : "Attente Signature"}
                            </span>
                            {!project.contractSigned && <Lock className="w-4 h-4 text-orange-500" />}
                        </div>

                        <h3 className="text-2xl font-heading font-bold text-primary mb-3 group-hover:text-blue-500 transition-colors line-clamp-1">{project.title}</h3>
                        <p className="text-secondary text-sm mb-10 line-clamp-2 h-10 leading-relaxed">{project.description}</p>

                        <div className="space-y-4 flex-grow">
                            <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest mb-1">
                                <span className="text-secondary/60">Progression</span>
                                <span className="text-primary">{project.progress}%</span>
                            </div>
                            <div className="h-1.5 bg-secondary/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-1000"
                                    style={{ width: `${project.progress}%` }}
                                />
                            </div>
                        </div>

                        <div className="mt-10 flex items-center justify-between pt-8 border-t border-border">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest">Référence</span>
                                <span className="text-[11px] font-bold text-primary uppercase tracking-wider">ID-{project.id.slice(-4).toUpperCase()}</span>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-background transition-all">
                                {project.contractSigned ? <ChevronRight className="w-5 h-5" /> : <FileSignature className="w-5 h-5" />}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
