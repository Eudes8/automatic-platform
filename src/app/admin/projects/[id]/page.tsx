import { getProjectDetails } from "@/lib/actions/adminProjectOps";
import { notFound } from "next/navigation";
import { ChevronLeft, Calendar, User, CreditCard, Clock, FileText, Globe, Code } from "lucide-react";
import Link from "next/link";
import SmsSender from "@/components/admin/projects/SmsSender";
import AssetUploader from "@/components/admin/projects/AssetUploader";

export const dynamic = 'force-dynamic';

export default async function AdminProjectDetails({ params }: { params: { id: string } }) {
    const { id } = await params;
    const project = await getProjectDetails(id);

    if (!project) return notFound();

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                <div className="space-y-4">
                    <Link
                        href="/admin/projects"
                        className="flex items-center gap-2 text-slate-500 hover:text-blue-400 transition-colors text-[10px] font-black uppercase tracking-widest"
                    >
                        <ChevronLeft className="w-4 h-4" /> Retour au Kanban
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] inline-block py-1 px-3 rounded-full border ${project.status === "DONE" ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                }`}>
                                {project.status}
                            </span>
                            <span className="text-slate-700 font-bold text-[10px] uppercase tracking-widest">ID: {project.id}</span>
                        </div>
                        <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">
                            {project.title}
                        </h1>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Client Card */}
                    <div className="bg-slate-900 border border-white/5 rounded-3xl p-8">
                        <h3 className="text-white font-bold mb-6 uppercase text-xs tracking-widest flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-500" /> Informations Client
                        </h3>
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-1">Nom du client</p>
                                <p className="text-white font-medium text-lg">{project.client?.name || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-1">Email</p>
                                <p className="text-white font-medium text-lg">{project.client?.email || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-1">Budget</p>
                                <p className="text-white font-medium text-lg">{project.budget}€</p>
                            </div>
                            <div>
                                <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-1">Contrat</p>
                                <p className={`font-medium text-lg ${project.contractSigned ? "text-green-500" : "text-amber-500"}`}>
                                    {project.contractSigned ? "Signé" : "En attente"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Deliverables Management */}
                    <div className="bg-slate-900 border border-white/5 rounded-3xl p-8">
                        <h3 className="text-white font-bold mb-6 uppercase text-xs tracking-widest flex items-center gap-2">
                            <FileText className="w-4 h-4 text-purple-500" /> Gestion des Livrables
                        </h3>
                        <div className="space-y-4 mb-8">
                            {project.assets.length === 0 ? (
                                <p className="text-slate-600 text-sm italic">Aucun livrable publié pour le moment.</p>
                            ) : (
                                project.assets.map(asset => (
                                    <div key={asset.id} className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            {asset.type === 'code' ? <Code className="w-4 h-4 text-blue-400" /> : asset.type === 'pdf' ? <FileText className="w-4 h-4 text-orange-400" /> : <Globe className="w-4 h-4 text-green-400" />}
                                            <span className="text-sm text-slate-300 font-bold">{asset.name}</span>
                                        </div>
                                        <a href={asset.url} target="_blank" className="text-[10px] text-blue-500 uppercase tracking-widest font-bold hover:underline">Voir</a>
                                    </div>
                                ))
                            )}
                        </div>
                        <AssetUploader projectId={project.id} />
                    </div>
                </div>

                {/* Sidebar Actions */}
                <div className="space-y-6">
                    <SmsSender projectId={project.id} />

                    <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
                        <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-500" /> Activité récente
                        </h4>
                        <div className="space-y-4">
                            {project.messages.length === 0 ? (
                                <p className="text-slate-600 text-xs">Aucune activité récente.</p>
                            ) : (
                                project.messages.map(msg => (
                                    <div key={msg.id} className="text-xs">
                                        <p className="text-slate-300 mb-1 line-clamp-2">"{msg.text}"</p>
                                        <p className="text-slate-600 font-bold uppercase text-[8px] tracking-widest">{new Date(msg.createdAt).toLocaleDateString()}</p>
                                    </div>
                                ))
                            )}
                        </div>
                        <Link href={`/admin/chat`} className="block mt-4 text-center text-[10px] font-bold uppercase tracking-widest text-blue-500 hover:text-white transition-colors">
                            Voir toute la conversation
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
