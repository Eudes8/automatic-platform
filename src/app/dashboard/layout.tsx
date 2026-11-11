import { getCurrentUser } from "@/lib/actions/users";
import { redirect } from "next/navigation";
import AppShell from "@/components/shell/AppShell";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // Guard serveur : session obligatoire (Neon Auth + profil Prisma)
  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell
      variant="client"
      user={{ name: user.name, email: user.email, role: user.role }}
    >
      {children}
    </AppShell>
  );
}
