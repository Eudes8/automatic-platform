import Kanban from "@/components/admin/Kanban";
import { getProjectsByStatus } from "@/lib/actions/admin";
import ProjectCRUDModal from "@/components/admin/projects/ProjectCRUDModal";

export default async function AdminProjectsPage() {
    const projects = await getProjectsByStatus();

    return (
        <div className="space-y-8 p-8 min-h-[calc(100vh-100px)] flex flex-col">
            <header className="flex justify-between items-end mb-4">
                <div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Gestion des <span className="text-blue-500">Projets</span></h1>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2 ml-1 italic">Flux de travail global</p>
                </div>
                <ProjectCRUDModal />
            </header>

            <div className="flex-1">
                <Kanban initialProjects={projects} />
            </div>
        </div>
    );
}
