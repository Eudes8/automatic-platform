import { redirect } from "next/navigation";

/**
 * La messagerie admin n'a plus d'écran propre : les échanges avec un client
 * se lisent et se répondent depuis l'onglet Échanges de son projet, dans le
 * même fil que ses demandes et ses problèmes.
 */
export default async function AdminChatRedirect() {
  redirect("/admin/projects");
}
