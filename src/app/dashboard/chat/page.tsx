import { redirect } from "next/navigation";

/**
 * Ancienne page de messagerie autonome. Les messages sont désormais un onglet
 * du projet, pour éviter deux endroits différents pour la même conversation.
 */
export default function ChatRedirect() {
  redirect("/dashboard/projects");
}
