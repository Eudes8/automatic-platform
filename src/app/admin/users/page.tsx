import { getAllUsers } from "@/lib/actions/adminValues";
import { User, Mail, Shield, Calendar, Search } from "lucide-react";

import UserCRUDModal from "@/components/admin/users/UserCRUDModal";

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage({
    searchParams
}: {
    searchParams: { page?: string }
}) {
    const page = parseInt(searchParams.page || "1");
    const { users, total, totalPages } = await getAllUsers(page);

    return (
        <div className="space-y-8 p-8">
            <header className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">CRM <span className="text-blue-500">Clients</span></h1>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2 ml-1 italic">Base de données utilisateurs</p>
                </div>
                <UserCRUDModal />
            </header>

            <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Rechercher un client..."
                            className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                <th className="p-6">Utilisateur</th>
                                <th className="p-6">Rôle</th>
                                <th className="p-6">Projets</th>
                                <th className="p-6">Date d'inscription</th>
                                <th className="p-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold">
                                                {user.name ? user.name[0].toUpperCase() : <User className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-sm">{user.name || "Sans nom"}</p>
                                                <div className="flex items-center gap-2 text-slate-500 text-xs">
                                                    <Mail className="w-3 h-3" /> {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${user.role === "ADMIN"
                                            ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex -space-x-2">
                                            {user.projects.length > 0 ? (
                                                <span className="text-white font-bold">{user.projects.length} Projets</span>
                                            ) : (
                                                <span className="text-slate-600 italic text-sm">Aucun</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                                            <Calendar className="w-4 h-4 text-slate-600" />
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="p-6 text-right">
                                        <UserCRUDModal editingUser={user} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-6 px-6 py-4 border-t border-white/5">
                        <div className="text-sm text-slate-400">
                            Affichage de {(page - 1) * 20 + 1} à {Math.min(page * 20, total)} sur {total} utilisateurs
                        </div>
                        <div className="flex gap-2">
                            {page > 1 && (
                                <a
                                    href={`/admin/users?page=${page - 1}`}
                                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors"
                                >
                                    Précédent
                                </a>
                            )}
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                                return (
                                    <a
                                        key={pageNum}
                                        href={`/admin/users?page=${pageNum}`}
                                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                            pageNum === page
                                                ? "bg-blue-500 text-white"
                                                : "bg-slate-800 hover:bg-slate-700 text-white"
                                        }`}
                                    >
                                        {pageNum}
                                    </a>
                                );
                            })}
                            {page < totalPages && (
                                <a
                                    href={`/admin/users?page=${page + 1}`}
                                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors"
                                >
                                    Suivant
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
