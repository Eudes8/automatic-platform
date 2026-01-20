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
                        <div className="w-4 h-4 rounded-full bg-primary animate-pulse shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
                        <p className="text-[10px] text-primary/40 font-black uppercase tracking-[0.5em] italic">AUTOMATIC_SYSTEM // LIVE_COMMAND</p>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black text-primary italic uppercase tracking-tighter leading-[0.8]">
                        COMMAND <span className="text-secondary/20">/</span> <br />
                        <span className="text-accent underline decoration-accent/20 underline-offset-8">CENTER.</span>
                    </h1>
                    <p className="text-secondary/40 font-black text-[10px] uppercase tracking-[0.4em] max-w-xl leading-relaxed italic">
                        // PILOTAGE_GRANULAIRE_DES_PROTOCOLES_D_INGÉNIERIE_ET_FLUX_DE_PRODUCTION_GLOBAUX.
                    </p>
                </div>
                <div className="flex items-center gap-10">
                    <div className="hidden lg:flex flex-col items-end gap-2 px-10 border-r border-border/50">
                        <span className="text-[9px] font-black text-secondary/40 uppercase tracking-[0.3em] italic">EFFICIENCE_SYSTEME</span>
                        <span className="text-3xl font-black text-emerald-600 italic uppercase">98.4%_OK</span>
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
