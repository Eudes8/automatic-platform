import Kanban from "@/components/admin/Kanban";
import { getProjectsByStatus } from "@/lib/actions/admin";
import ProjectCRUDModal from "@/components/admin/projects/ProjectCRUDModal";

export const dynamic = 'force-dynamic';

export default async function AdminProjectsPage() {
    const projects = await getProjectsByStatus();

    return (
        <div className="space-y-12 p-10 lg:p-14 min-h-[calc(100vh-100px)] flex flex-col animate-in fade-in slide-in-from-bottom-6 duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-16 pb-12 border-b border-border/50">
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.3)]" />
                        <p className="text-[10px] text-primary/40 font-black uppercase tracking-[0.2em] italic">Gestion de projets</p>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black text-primary italic uppercase tracking-tighter leading-[0.8]">
                        PROJETS <br />
                        <span className="text-accent italic">CLIENTS.</span>
                    </h1>
                    <p className="text-secondary/40 font-black text-[10px] uppercase tracking-[0.2em] max-w-xl leading-relaxed italic">
                        Suivi et gestion des opérations de développement en cours.
                    </p>
                </div>
                <div className="flex items-center gap-10">
                    <div className="hidden lg:flex flex-col items-end gap-2 px-10 border-r border-border/50">
                        <span className="text-[9px] font-black text-secondary/40 uppercase tracking-[0.2em] italic">État du service</span>
                        <span className="text-3xl font-black text-emerald-600 italic uppercase">OPÉRATIONNEL</span>
                    </div>
                    <ProjectCRUDModal />
                </div>
            </header>

            <div className="flex-1">
                <Kanban initialProjects={projects} />
            </div>
        </div>
    );
}
