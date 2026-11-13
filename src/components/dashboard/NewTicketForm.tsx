"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import { createTicket } from "@/lib/actions/tickets";

interface NewTicketFormProps {
  projects: { id: string; title: string }[];
}

const PRIORITIES = [
  { value: "LOW", label: "Basse" },
  { value: "MEDIUM", label: "Moyenne" },
  { value: "HIGH", label: "Haute" },
  { value: "URGENT", label: "Urgente" },
];

export default function NewTicketForm({ projects }: NewTicketFormProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function submit(formData: FormData) {
    setError(null);
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();

    if (title.length < 3) {
      setError("Donnez un titre à votre demande.");
      return;
    }
    if (description.length < 10) {
      setError("Décrivez le problème en quelques mots.");
      return;
    }

    startTransition(async () => {
      try {
        await createTicket(formData);
        setOpen(false);
        router.refresh();
      } catch {
        setError("L'envoi a échoué. Réessayez.");
      }
    });
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn btn-primary h-11 px-5">
        <Plus size={15} aria-hidden="true" /> Nouvelle demande
      </button>
    );
  }

  return (
    <form
      action={submit}
      className="surface space-y-4 p-4 md:p-5"
    >
      <div className="flex items-start justify-between">
        <p className="text-[14px] font-semibold">Nouvelle demande</p>
        <button type="button" onClick={() => setOpen(false)} aria-label="Fermer">
          <X size={15} className="text-muted" />
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5 md:col-span-2">
          <label htmlFor="title" className="block text-[13px] font-medium">
            Objet
          </label>
          <input id="title" name="title" required minLength={3} className="field" placeholder="Ex. Erreur lors de la connexion" />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="projectId" className="block text-[13px] font-medium">
            Projet concerné
          </label>
          <select id="projectId" name="projectId" className="field">
            <option value="">Aucun projet en particulier</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="priority" className="block text-[13px] font-medium">
            Priorité
          </label>
          <select id="priority" name="priority" defaultValue="MEDIUM" className="field">
            {PRIORITIES.map((priority) => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label htmlFor="description" className="block text-[13px] font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            required
            minLength={10}
            rows={4}
            className="field resize-none"
            placeholder="Ce qui se passe, ce que vous attendiez, et sur quel écran."
          />
        </div>
      </div>

      {error && <p className="text-[12px] text-danger">{error}</p>}

      <button type="submit" disabled={pending} className="btn btn-primary h-11 px-5">
        {pending ? <Loader2 size={15} className="animate-spin" /> : null}
        Envoyer la demande
      </button>
    </form>
  );
}
