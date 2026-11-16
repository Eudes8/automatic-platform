"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { createInvoice } from "@/lib/actions/invoices";
import { getProjectsByStatus } from "@/lib/actions/admin";

interface ProjectOption {
  id: string;
  title: string;
  client: { name: string | null; email: string } | null;
}

const KNOWN_ERRORS: Record<string, string> = {
  "Project not found": "Le projet sélectionné n'existe plus. Rechargez la page.",
  "Create failed": "Création impossible. Réessayez.",
};

/**
 * Fenêtre de création de facture. Champs attendus par l'action : projectId,
 * amount, dueDate, description.
 */
export default function InvoiceCRUDModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [error, setError] = useState<string | null>(null);

  /** Ouverture : charge la liste des projets à chaque ouverture pour rester à jour. */
  function open() {
    setIsOpen(true);
    setLoadingProjects(true);
    getProjectsByStatus()
      .then((rows) => setProjects(rows))
      .catch(() => setProjects([]))
      .finally(() => setLoadingProjects(false));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const result = await createInvoice(formData);
    setLoading(false);
    if (result && result.success === false) {
      setError(KNOWN_ERRORS[result.error ?? ""] ?? "Création impossible. Réessayez.");
      return;
    }
    setIsOpen(false);
  }

  if (!isOpen) {
    return (
      <button type="button" onClick={open} className="btn btn-primary h-11 px-5">
        <Plus size={15} aria-hidden="true" />
        Nouvelle facture
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-foreground/40" onClick={() => setIsOpen(false)} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="nouvelle-facture-titre"
        className="surface relative w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8"
      >
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Fermer"
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-[10px] text-muted transition-colors hover:bg-card-hover hover:text-foreground"
        >
          <X size={16} aria-hidden="true" />
        </button>

        <h3 id="nouvelle-facture-titre" className="text-xl font-semibold">
          Nouvelle facture
        </h3>
        <p className="mt-1 text-[13px] text-secondary">
          Le client la voit dans son espace Paiements et peut payer en ligne. Montants en F CFA.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block space-y-1.5">
            <span className="label">Projet concerné</span>
            <select name="projectId" required defaultValue="" className="field text-[14px]" disabled={loadingProjects}>
              <option value="">
                {loadingProjects ? "Chargement des projets…" : "Sélectionner un projet"}
              </option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                  {project.client?.name ? ` — ${project.client.name}` : ""}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="label">Montant (F CFA)</span>
              <input
                name="amount"
                type="number"
                min="0"
                step="1"
                required
                className="field text-[14px]"
                placeholder="450000"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="label">Échéance</span>
              <input name="dueDate" type="date" required className="field text-[14px]" />
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="label">Objet de la facture</span>
            <textarea
              name="description"
              rows={3}
              className="field resize-none text-[14px]"
              placeholder="Ex. Acompte 40 % sur la refonte du catalogue…"
            />
          </label>

          {error && <p className="text-[13px] font-medium text-danger">{error}</p>}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsOpen(false)} className="btn btn-outline h-11 px-5">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary h-11 min-w-40 px-5">
              {loading ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <Plus size={15} aria-hidden="true" />}
              Créer la facture
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
