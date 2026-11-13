import { redirect } from "next/navigation";

/**
 * Ancienne page « Documents ». Les contrats, reçus et livrables vivent
 * désormais dans le projet et dans Paiements.
 */
export default function DocumentsRedirect() {
  redirect("/dashboard/projects");
}
