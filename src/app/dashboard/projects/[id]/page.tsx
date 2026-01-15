import { getClientProjects } from "@/lib/actions/projects";
import ProjectStats from "@/components/dashboard/ProjectStats";
import ChatSidebar from "@/components/dashboard/ChatSidebar";
import Deliverables from "@/components/dashboard/Deliverables";
import ContractBarrier from "@/components/dashboard/ContractBarrier";
import { Zap, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const projects = await getClientProjects();
    const project = projects.find(p => p.id === id);

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
        <div className="max-w-7xl mx-auto space-y-12 pb-20">
            {/* Header: Project Summary */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-4">
                <div className="space-y-6">
                    <Link
                        href="/dashboard/projects"
                        className="flex items-center gap-2 text-secondary hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest"
                    >
                        <ChevronLeft className="w-4 h-4" /> Retour aux projets
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-blue-500 font-bold uppercase text-[10px] tracking-[0.2em] inline-block py-1.5 px-4 bg-blue-500/10 rounded-full border border-blue-500/10">Session Active</span>
                            <span className="text-secondary/60 font-medium text-[11px] uppercase tracking-wider">/ Ref: {project.id.slice(0, 8).toUpperCase()}</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-heading font-bold text-primary tracking-tight leading-[0.9] mb-2">
                            {project.title.split(' - ')[0]} <br />
                            <span className="text-blue-500">{project.title.split(' - ')[1] || "Pilotage."}</span>
                        </h1>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button className="px-8 py-3.5 border border-border bg-card hover:bg-secondary/5 text-primary font-bold uppercase text-[11px] tracking-widest rounded-2xl transition-all h-fit">Export Report</button>
                    <button className="px-8 py-3.5 bg-primary text-background font-bold uppercase text-[11px] tracking-widest rounded-2xl hover:opacity-90 transition-all h-fit">Update Status</button>
                </div>
            </div>

            {/* Main Grid Section */}
            <ProjectStats project={project} />

            <div className="grid lg:grid-cols-12 gap-10">
                {/* Real-time Collaboration */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <ChatSidebar projectId={project.id} />
                </div>

                {/* Logistics and Deliverables */}
                <div className="lg:col-span-4 space-y-10">
                    <Deliverables
                        projectId={project.id}
                        projectName={project.title}
                        projectAssets={project.assets}
                        contracts={project.contracts}
                        clientName={project.client?.name || "Client"}
                        budget={project.budget ? `${project.budget}€` : "Non spécifié"}
                        description={project.description || undefined}
                    />
                </div>
            </div>
        </div>
    );
}
