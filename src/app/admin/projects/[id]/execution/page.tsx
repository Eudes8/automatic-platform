import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, KanbanSquare, Users2, Flag, Package } from "lucide-react";
import prisma from "@/lib/prisma";
import { getProjectExecution, getAssignableUsers } from "@/lib/actions/execution";
import TaskBoard from "@/components/projects/TaskBoard";
import MilestonePanel from "@/components/projects/MilestonePanel";
import DeliverableManager from "@/components/projects/DeliverableManager";
import TeamPanel from "@/components/projects/TeamPanel";
import { formatDay } from "@/types/execution";

export const dynamic = "force-dynamic";

export default async function ProjectExecutionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const project = await prisma.project.findUnique({
        where: { id },
        select: {
            id: true,
            title: true,
            status: true,
            progress: true,
            client: { select: { name: true, email: true } },
        },
    });

    if (!project) notFound();

    const [{ tasks, milestones, deliverables, members }, assignableUsers] = await Promise.all([
        getProjectExecution(id),
        getAssignableUsers(),
    ]);

    const doneTasks = tasks.filter((task) => task.status === "DONE").length;
    const validatedMilestones = milestones.filter((milestone) => milestone.status === "VALIDATED").length;

    return (
        <div className="space-y-10 pb-24">
            <header className="space-y-5">
                <Link
                    href={`/admin/projects/${id}`}
                    className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-secondary/40 hover:text-primary transition-colors"
                >
                    <ChevronLeft size={14} /> Retour au projet
                </Link>

                <div className="flex flex-wrap items-end justify-between gap-6">
                    <div>
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-secondary/40">
                            Exécution · {project.client?.name ?? project.client?.email ?? "Client"}
                        </span>
                        <h1 className="mt-2 text-4xl font-bold text-primary tracking-tight">{project.title}</h1>
                        <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-secondary/40">
                            {project.status} · avancement {project.progress}%
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <Stat icon={<KanbanSquare size={13} />} label="Tâches" value={`${doneTasks}/${tasks.length}`} />
                        <Stat icon={<Flag size={13} />} label="Jalons" value={`${validatedMilestones}/${milestones.length}`} />
                        <Stat icon={<Package size={13} />} label="Livrables" value={String(deliverables.length)} />
                    </div>
                </div>
            </header>

            <section className="rounded-[2rem] border border-border/60 bg-card/40 p-6 md:p-8">
                <TaskBoard
                    projectId={id}
                    tasks={tasks}
                    members={members}
                    milestones={milestones}
                    canEdit
                />
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <section className="rounded-[2rem] border border-border/60 bg-card/40 p-6 md:p-8">
                    <MilestonePanel projectId={id} milestones={milestones} canEdit />
                </section>

                <section className="rounded-[2rem] border border-border/60 bg-card/40 p-6 md:p-8">
                    <div className="flex items-center gap-2 mb-4 text-secondary/40">
                        <Users2 size={13} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Collaboration</span>
                    </div>
                    <TeamPanel
                        projectId={id}
                        members={members}
                        availableUsers={assignableUsers}
                        canEdit
                        client={{
                            name: project.client?.name ?? null,
                            email: project.client?.email ?? "client@automatic",
                        }}
                    />
                </section>
            </div>

            <section className="rounded-[2rem] border border-border/60 bg-card/40 p-6 md:p-8">
                <DeliverableManager
                    projectId={id}
                    deliverables={deliverables}
                    milestones={milestones}
                    canEdit
                    clientName={project.client?.name ?? "le client"}
                />
            </section>

            <p className="text-[9px] font-bold uppercase tracking-widest text-secondary/30 text-center">
                Dernière synchronisation · {formatDay(new Date())}
            </p>
        </div>
    );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-border/60 bg-card/60 px-4 py-3 min-w-[92px]">
            <div className="flex items-center gap-1.5 text-secondary/40">{icon}</div>
            <p className="mt-1 text-lg font-bold text-primary leading-none">{value}</p>
            <p className="text-[8px] font-black uppercase tracking-widest text-secondary/40 mt-1">{label}</p>
        </div>
    );
}
