import { getCurrentUser } from "@/lib/actions/users";
import { User, Lock, Bell, CreditCard, LogOut } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    const user = await getCurrentUser();

    return (
        <div className="max-w-4xl space-y-8">
            <header className="mb-10">
                <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Configuration <span className="text-blue-500">Profil.</span></h1>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2 ml-1 italic">Personnalisez votre expérience de pilotage</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <aside className="md:col-span-1 space-y-2">
                    {[
                        { name: "Compte", icon: User, active: true },
                        { name: "Sécurité", icon: Lock },
                        { name: "Notifications", icon: Bell },
                        { name: "Facturation", icon: CreditCard },
                    ].map((item, i) => (
                        <button
                            key={i}
                            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] uppercase font-black tracking-widest transition-all ${item.active ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20" : "text-slate-500 hover:text-white hover:bg-white/5"}`}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.name}
                        </button>
                    ))}
                </aside>

                <div className="md:col-span-3 p-10 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-8">
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-white italic">Information Personnelles</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Nom Complet</label>
                                <div className="p-4 rounded-2xl bg-slate-900 border border-white/5 text-slate-300 font-bold">{user?.name || "Non défini"}</div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Email</label>
                                <div className="p-4 rounded-2xl bg-slate-900 border border-white/5 text-slate-300 font-bold">{user?.email || "Non défini"}</div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 space-y-6">
                        <h3 className="text-xl font-bold text-white italic">Préférences de Notification</h3>
                        <div className="space-y-3">
                            {["Mises à jour de sprint", "Messages d'experts", "Rapports hebdomadaires"].map((l, i) => (
                                <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-slate-900/50">
                                    <span className="text-sm font-medium text-slate-400">{l}</span>
                                    <div className="w-12 h-6 bg-blue-600 rounded-full flex items-center px-1">
                                        <div className="w-4 h-4 bg-white rounded-full ml-auto" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-8 flex justify-between">
                        <button className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all">
                            Enregistrer les modifications
                        </button>
                        <button className="px-8 py-4 bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                            Supprimer mon compte
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
