import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/users";
import AppShell from "@/components/shell/AppShell";

// Layout serveur : contrôle d'accès ADMIN côté serveur (défense en profondeur).
// Les actions serveur vérifient en outre requireAdmin().
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }
  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <AppShell variant="admin" user={{ name: user.name, email: user.email, role: user.role }}>
      {children}
    </AppShell>
  );
}
