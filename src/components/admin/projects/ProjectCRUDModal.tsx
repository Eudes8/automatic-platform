"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { createProject } from "@/lib/actions/adminProjectCRUD";

/**
 * Fenêtre de création de projet. Les champs reprennent le schéma de l'action
 * createProject : title, clientEmail, category, timeline, techStack, budget,
 * description.
 */
export default function ProjectCRUDModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const result = await createProject(formData);
    setLoading(false);
    if (result && result.success === false) {
      const knownErrors: Record<string, string> = {
        "Client not found": "Aucun compte client avec cet e-mail. Créez d'abord le client.",
        "Unauthorized": "Seuls les membres de l'équipe peuvent créer un projet.",
      };
      setError(knownErrors[result.error ?? ""] ?? "Création impossible. Réessayez.");
      return;
    }
    setIsOpen(false);
  }

  if (!isOpen) {
    return (
      <button type="button" onClick={() => setIsOpen(true)} className="btn btn-primary h-11 px-5">
        <Plus size={15} aria-hidden="true" />
        Nouveau projet
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-foreground/40" onClick={() => setIsOpen(false)} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="nouveau-projet-titre"
        className="surface relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8"
      >
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Fermer"
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-[10px] text-muted transition-colors hover:bg-card-hover hover:text-foreground"
        >
          <X size={16} aria-hidden="true" />
        </button>

        <h3 id="nouveau-projet-titre" className="text-xl font-semibold">
          Nouveau projet
        </h3>
        <p className="mt-1 text-[13px] text-secondary">
          Le client recevra l&apos;accès à son espace dès la création.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="label">Intitulé du projet</span>
              <input
                name="title"
                required
                className="field text-[14px]"
                placeholder="Ex. Boutique en ligne"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="label">Client (e-mail)</span>
              <input
                name="clientEmail"
                type="email"
                required
                className="field text-[14px]"
                placeholder="client@exemple.com"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="label">Catégorie</span>
              <select name="category" className="field text-[14px]">
                <option value="WEB">Application web</option>
                <option value="MOBILE">Application mobile</option>
                <option value="AI">Intégration IA</option>
                <option value="SAAS">Plateforme SaaS</option>
                <option value="UIUX">Refonte UI/UX</option>
              </select>
            </label>

            <label className="block space-y-1.5">
              <span className="label">Priorité</span>
              <select name="timeline" className="field text-[14px]">
                <option value="STANDARD">Standard</option>
                <option value="FAST">Accélérée</option>
                <option value="URGENT">Urgente</option>
              </select>
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="label">Stack technique (séparée par des virgules)</span>
            <input
              name="techStack"
              className="field text-[14px]"
              placeholder="Next.js, Tailwind, PostgreSQL…"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="label">Budget (F CFA)</span>
            <input
              name="budget"
              type="number"
              min="0"
              step="1000"
              required
              className="field text-[14px]"
              placeholder="5000000"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="label">Ce que veut le client</span>
            <textarea
              name="description"
              rows={3}
              className="field resize-none text-[14px]"
              placeholder="Détaillez le besoin, les fonctionnalités attendues, les délais…"
            />
          </label>

          {error && <p className="text-[13px] font-medium text-danger">{error}</p>}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn btn-outline h-11 px-5"
            >
              Annuler
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary h-11 min-w-40 px-5">
              {loading ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <Plus size={15} aria-hidden="true" />}
              Créer le projet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
