import Sidebar from "@/components/dashboard/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto custom-scrollbar">
                {children}
            </main>
        </div>
    );
}
