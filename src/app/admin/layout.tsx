import Sidebar from "@/components/dashboard/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen bg-background text-primary overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
                {children}
            </main>
        </div>
    );
}
