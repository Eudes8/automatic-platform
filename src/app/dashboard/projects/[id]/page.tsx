import { getClientProjects } from "@/lib/actions/projects";
import { getCurrentUser } from "@/lib/actions/users";
import ProjectStats from "@/components/dashboard/ProjectStats";
import ChatSidebar from "@/components/dashboard/ChatSidebar";
import Deliverables from "@/components/dashboard/Deliverables";
import ContractBarrier from "@/components/dashboard/ContractBarrier";
import DeploymentTimeline from "@/components/dashboard/DeploymentTimeline";
import RequirementWorkspace from "@/components/dashboard/RequirementWorkspace";
import { Zap, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Requirement, Project, Asset, Contract, Invoice, User } from "@prisma/client";

type ProjectWithDetails = Project & {
    client: User | null;
    assets: Asset[];
    contracts: Contract[];
    invoices: (Invoice & { project?: { title: string } | null })[];
    requirements: (Requirement & {
        comments: any[];
        statusHistory: any[]
    })[];
};

export const dynamic = 'force-dynamic';

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) return notFound();

    const projects = await getClientProjects();
    const project = (projects as ProjectWithDetails[]).find(p => p.id.trim() === id.trim());

    if (!project) {
        return notFound();
    }

    // MANDATORY CONTRACT BARRIER FOR THIS SPECIFIC PROJECT
    if (!project.contractSigned) {
        return (
            <ContractBarrier
                projectName={project.title}
                projectId={project.id}
                clientName={project.client?.name || "Client"}
                budget={project.budget ? `${project.budget}€` : undefined}
                description={project.description || undefined}
            />
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Header: Project Summary */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-6 pb-10 border-b border-border/50">
                <div className="space-y-8">
                    <Link
                        href="/dashboard/projects"
                        className="group flex items-center gap-3 text-[10px] font-black text-secondary/40 uppercase tracking-[0.4em] hover:text-primary transition-colors italic"
                    >
                        <div className="w-8 h-8 rounded-xl bg-secondary/5 border border-border/50 flex items-center justify-center group-hover:bg-primary group-hover:text-background transition-all duration-500 group-hover:scale-110">
                            <ChevronLeft size={14} />
                        </div>
                        // RETOUR_LISTE
                    </Link>
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-accent font-black uppercase text-[10px] tracking-[0.5em] inline-block py-2 px-6 bg-accent/5 rounded-full border border-accent/10 italic shadow-inner animate-pulse">// SESSION_CLIENT_ACTIVE</span>
                            <span className="text-secondary/20 font-black text-[10px] uppercase tracking-[0.3em] italic">/ PROJET_ID_{project.id.slice(0, 8).toUpperCase()}</span>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-heading font-black text-primary tracking-tighter uppercase italic leading-[0.85] mb-4">
                            {project.title.split(' - ')[0]} <br />
                            <span className="text-secondary/20 tracking-[-0.05em]">{project.title.split(' - ')[1] || "PILOTAGE."}</span>
                        </h1>
                        <p className="text-secondary/40 font-black text-[10px] uppercase tracking-[0.4em] ml-1 italic leading-relaxed max-w-xl">
                            // Interface de gestion de projet. <br />
                            Suivi des étapes et des livrables de votre mission.
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-4">
                    <button className="px-8 py-5 border border-border/50 bg-background/50 hover:bg-white text-primary font-black uppercase text-[10px] tracking-[0.3em] rounded-[1.5rem] transition-all duration-500 hover:shadow-2xl hover:scale-105 active:scale-95 italic">
                        TÉLÉCHARGER_RAPPORT
                    </button>
                    <button className="px-8 py-5 bg-primary text-background font-black uppercase text-[10px] tracking-[0.3em] rounded-[1.5rem] transition-all duration-500 hover:shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 italic">
                        ACTUALISER_STATUT
                    </button>
                </div>
            </div>

            {/* Main Grid Section */}
            <ProjectStats project={project} />

            <div className="grid lg:grid-cols-12 gap-10">
                {/* Real-time Collaboration */}
                <div className="lg:col-span-8 flex flex-col gap-10">
                    <DeploymentTimeline progress={project.progress || 0} />
                    <RequirementWorkspace
                        projectId={project.id}
                        initialRequirements={project.requirements || []}
                        currentUser={user}
                    />
                    <ChatSidebar projectId={project.id} />
                </div>

                {/* Logistics and Deliverables */}
                <div className="lg:col-span-4 space-y-10">
                    <Deliverables
                        projectId={project.id}
                        projectName={project.title}
                        projectAssets={project.assets}
                        contracts={project.contracts}
                        invoices={project.invoices}
                        clientName={project.client?.name || "Client"}
                        budget={project.budget ? `${project.budget}€` : "Non spécifié"}
                        description={project.description || undefined}
                        techStack={project.techStack}
                        timeline={project.timeline || undefined}
                    />
                </div>
            </div>
        </div>
    );
}
