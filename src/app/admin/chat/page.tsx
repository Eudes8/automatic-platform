import { getAllChatChannels } from "@/lib/actions/adminChat";
import AdminChatInterface from "@/components/admin/chat/AdminChatInterface";

export const dynamic = 'force-dynamic';

export default async function AdminChatPage() {
    const channels = await getAllChatChannels();

    return (
        <div className="p-8 h-screen flex flex-col">
            <header className="mb-6 shrink-0">
                <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Messagerie <span className="text-blue-500">Interne</span></h1>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2 ml-1 italic">Canal direct avec les clients</p>
            </header>

            <div className="flex-1 min-h-0">
                <AdminChatInterface projects={channels} />
            </div>
        </div>
    );
}
