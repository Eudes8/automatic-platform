import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/users";
import AdminShell from "@/components/admin/AdminShell";

// Layout serveur : contrôle d'accès ADMIN côté serveur (défense en profondeur).
// Le middleware ne gérant plus les rôles, cette barrière fait foi — les pages
// admin restent inaccessibles aux sessions CLIENT même en appelant l'URL
// directement. Les actions serveur vérifient en outre requireAdmin().
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }
    if (user.role !== "ADMIN") {
        redirect("/dashboard");
    }

    return <AdminShell>{children}</AdminShell>;
}
