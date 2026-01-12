import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/users";

export default async function DashboardPage() {
    const user = await getCurrentUser();

    if (user?.role === "ADMIN") {
        redirect("/admin");
    }

    // Following user request: signature after selection from list.
    // Redirect to the projects list so user can select which one to view/sign.
    redirect("/dashboard/projects");
}
