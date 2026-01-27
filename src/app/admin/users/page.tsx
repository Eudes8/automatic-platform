import { getAllUsers } from "@/lib/actions/adminValues";
import { User as UserIcon, Mail, Shield, Calendar, Search } from "lucide-react";
import UserCRUDModal from "@/components/admin/users/UserCRUDModal";
import Link from "next/link";
import { User, Project } from "@prisma/client";

type UserWithProjects = User & {
    projects: Project[];
};

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage({
    searchParams
}: {
    searchParams: Promise<{ page?: string }>
}) {
    const resolvedParams = await searchParams;
    const page = parseInt(resolvedParams.page || "1");
    const { users, total, totalPages } = await getAllUsers(page);

    return (
        <div className="space-y-12 p-10 lg:p-14 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-border/50 pb-12">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-10 h-px bg-primary/30" />
                        <span className="text-[10px] font-black text-primary/40 uppercase tracking-[0.5em] italic">GESTION CLIENTÈLE // FICHIER CENTRAL</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-primary italic uppercase tracking-tighter leading-none">
                        CRM <span className="text-secondary/20">Clients.</span>
                    </h1>
                </div>
                <UserCRUDModal />
            </header>

            <div className="bg-white/40 backdrop-blur-3xl border border-border/50 rounded-[3rem] overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/2 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none" />

                <div className="p-10 border-b border-border/50 flex flex-col md:flex-row gap-6 relative z-10">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/20 group-focus-within:text-primary transition-colors duration-500" />
                        <input
                            type="text"
                            placeholder="Rechercher un client ou une entreprise..."
                            className="w-full bg-background border border-border/50 rounded-[1.5rem] py-5 pl-16 pr-6 text-xs text-primary focus:outline-none focus:border-primary/50 focus:ring-8 focus:ring-primary/5 transition-all duration-500 font-black uppercase italic tracking-widest shadow-inner placeholder:text-secondary/10"
                        />
                    </div>
                    <div className="flex items-center gap-4 px-6 border-l border-border/50 hidden md:flex">
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black text-secondary/20 uppercase tracking-widest italic">TOTAL_DOSSIERS</span>
                            <span className="text-sm font-black text-primary italic">{total} CLIENTS</span>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto relative z-10">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-secondary/5 text-secondary/40 text-[9px] font-black uppercase tracking-[0.2em] italic">
                                <th className="p-10">IDENTITÉ CLIENT</th>
                                <th className="p-10">ENTREPRISE / SECTEUR</th>
                                <th className="p-10">NIVEAU D'ACCÈS</th>
                                <th className="p-10">PROJETS</th>
                                <th className="p-10">INSCRIPTION</th>
                                <th className="p-10 text-right">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                            {users.map((user: UserWithProjects) => (
                                <tr key={user.id} className="hover:bg-primary/[0.02] transition-all duration-500 group/row">
                                    <td className="p-10">
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary font-black uppercase italic text-xs shadow-inner group-hover/row:scale-110 transition-transform duration-500">
                                                {user.name ? user.name[0].toUpperCase() : <UserIcon className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <p className="font-black text-primary text-sm uppercase italic tracking-tight">{user.name || "CLIENT NON IDENTIFIÉ"}</p>
                                                <div className="flex items-center gap-2 text-secondary/40 text-[10px] font-bold uppercase tracking-widest mt-1">
                                                    <Mail className="w-3 h-3 opacity-30" /> {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-10">
                                        <p className="font-black text-secondary text-[11px] uppercase italic tracking-tight">{user.companyName || "INDÉPENDANT"}</p>
                                        <p className="text-[9px] font-bold text-secondary/40 uppercase tracking-widest mt-1">{user.industry || "N/A"}</p>
                                    </td>
                                    <td className="p-10">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.3em] border italic ${user.role === "ADMIN"
                                            ? "bg-accent/5 text-accent border-accent/20"
                                            : "bg-emerald-500/5 text-emerald-600 border-emerald-500/20"
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-10">
                                        <div className="flex items-center gap-3">
                                            {user.projects && user.projects.length > 0 ? (
                                                <>
                                                    <div className="flex -space-x-3">
                                                        {user.projects.slice(0, 3).map((_: Project, i: number) => (
                                                            <div key={i} className="w-8 h-8 rounded-lg bg-primary border-2 border-white shadow-lg" />
                                                        ))}
                                                        {user.projects.length > 3 && (
                                                            <div className="w-8 h-8 rounded-lg bg-secondary/10 border-2 border-white flex items-center justify-center text-[10px] font-black text-secondary">
                                                                +{user.projects.length - 3}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-secondary/20 font-black text-[9px] uppercase tracking-widest italic">{user.projects.length} UNITÉS</span>
                                                </>
                                            ) : (
                                                <span className="text-secondary/10 font-black text-[9px] uppercase tracking-widest italic opacity-50">// AUCUN PROJET</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-10">
                                        <div className="flex items-center gap-3 text-secondary/40 text-[10px] font-black uppercase tracking-widest italic group-hover/row:text-primary transition-colors">
                                            <Calendar className="w-4 h-4 opacity-30" />
                                            {new Date(user.createdAt).toLocaleDateString().replace(/\//g, '.')}
                                        </div>
                                    </td>
                                    <td className="p-10 text-right">
                                        <UserCRUDModal editingUser={user} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 p-10 border-t border-border/50 bg-secondary/2 relative z-10">
                        <div className="text-[10px] font-black text-secondary/20 uppercase tracking-[0.3em] italic">
                            XFER_STATS: {(page - 1) * 20 + 1} TO {Math.min(page * 20, total)} // DEPTH: {total} RECORDS
                        </div>
                        <div className="flex gap-4">
                            {page > 1 && (
                                <Link
                                    href={`/admin/users?page=${page - 1}`}
                                    className="px-6 py-3 bg-white border border-border/50 hover:border-primary/30 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest italic transition-all shadow-inner"
                                >
                                    PRÉCÉDENT
                                </Link>
                            )}
                            <div className="flex gap-2">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                                    return (
                                        <Link
                                            key={pageNum}
                                            href={`/admin/users?page=${pageNum}`}
                                            className={`w-10 h-10 flex items-center justify-center rounded-xl text-[10px] font-black italic transition-all ${pageNum === page
                                                ? "bg-primary text-background shadow-xl shadow-primary/20 scale-110"
                                                : "bg-white border border-border/50 text-secondary/40 hover:text-primary"
                                                }`}
                                        >
                                            {pageNum}
                                        </Link>
                                    );
                                })}
                            </div>
                            {page < totalPages && (
                                <Link
                                    href={`/admin/users?page=${page + 1}`}
                                    className="px-6 py-3 bg-primary text-background rounded-xl text-[10px] font-black uppercase tracking-widest italic transition-all shadow-xl shadow-primary/20 hover:scale-[1.05]"
                                >
                                    SUIVANT
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
