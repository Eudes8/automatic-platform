import { getClientProjects } from "@/lib/actions/projects";
import ContractBarrier from "@/components/dashboard/ContractBarrier";
import ChatSidebar from "@/components/dashboard/ChatSidebar";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function ProjectChatPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const projects = await getClientProjects();
    const project = projects.find(p => p.id === id);

    if (!project) return notFound();

    if (!project.contractSigned) {
        return (
            <ContractBarrier
                projectName={project.title}
                projectId={project.id}
                clientName={project.client?.name || "Client"}
                budget={project.budget ? `${project.budget}€` : undefined}
            />
        );
    }

    return (
        <div className="h-[calc(100vh-12rem)]">
            <header className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Salon de <span className="text-blue-500">Pilotage.</span></h1>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2 ml-1 italic">Contexte : {project.title}</p>
                </div>
                <div className="flex gap-2">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full italic animate-pulse">Session Sécurisée</span>
                </div>
            </header>
            <ChatSidebar projectId={project.id} />
        </div>
    );
}
