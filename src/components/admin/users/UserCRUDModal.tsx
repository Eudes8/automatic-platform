"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { createClientUser, updateUser } from "@/lib/actions/adminUserCRUD";
import { User } from "@prisma/client";

interface UserCRUDModalProps {
  editingUser?: User;
  onClose?: () => void;
}

const KNOWN_ERRORS: Record<string, string> = {
  "Failed to create user": "Création du compte impossible. Cet e-mail est peut-être déjà utilisé.",
  "Failed to update user": "Mise à jour impossible. Réessayez.",
};

/**
 * Fenêtre de création / modification d'un compte client. Champs attendus par
 * les actions : name, email, phone, companyName, industry, role (édition).
 */
export default function UserCRUDModal({ editingUser, onClose }: UserCRUDModalProps) {
  const [isOpen, setIsOpen] = useState(!editingUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditing = !!editingUser;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const result = isEditing && editingUser
      ? await updateUser(editingUser.id, formData)
      : await createClientUser(formData);
    setLoading(false);
    if (result && result.success === false) {
      setError(KNOWN_ERRORS[result.error ?? ""] ?? "Opération impossible. Réessayez.");
      return;
    }
    if (onClose) onClose();
    setIsOpen(false);
  }

  function handleClose() {
    setIsOpen(false);
    if (onClose) onClose();
  }

  if (!isOpen && !isEditing) {
    return (
      <button type="button" onClick={() => setIsOpen(true)} className="btn btn-primary h-11 px-5">
        <Plus size={15} aria-hidden="true" />
        Nouveau client
      </button>
    );
  }

  if (isEditing && !isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-[8px] border border-border px-2.5 py-1.5 text-[12px] text-secondary transition-colors hover:border-primary/40 hover:text-foreground"
      >
        Modifier
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-foreground/40" onClick={handleClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-titre"
        className="surface relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8"
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-[10px] text-muted transition-colors hover:bg-card-hover hover:text-foreground"
        >
          <X size={16} aria-hidden="true" />
        </button>

        <h3 id="client-titre" className="text-xl font-semibold">
          {isEditing ? "Modifier le client" : "Nouveau client"}
        </h3>
        <p className="mt-1 text-[13px] text-secondary">
          {isEditing
            ? "Les modifications sont visibles immédiatement par le client."
            : "Un compte lui permettra de suivre son projet, payer et récupérer ses livrables."}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="label">Nom complet</span>
              <input
                name="name"
                required
                defaultValue={editingUser?.name || ""}
                className="field text-[14px]"
                placeholder="Ex. Awa Koné"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="label">E-mail</span>
              <input
                name="email"
                type="email"
                required
                defaultValue={editingUser?.email || ""}
                className="field text-[14px]"
                placeholder="client@exemple.com"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="label">Téléphone</span>
              <input
                name="phone"
                defaultValue={editingUser?.phone || ""}
                className="field text-[14px]"
                placeholder="+225 00 00 00 00"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="label">Société</span>
              <input
                name="companyName"
                defaultValue={editingUser?.companyName || ""}
                className="field text-[14px]"
                placeholder="Ex. Koné Distribution"
              />
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="label">Secteur d&apos;activité</span>
            <input
              name="industry"
              defaultValue={editingUser?.industry || ""}
              className="field text-[14px]"
              placeholder="Ex. tech, commerce, BTP…"
            />
          </label>

          {isEditing && (
            <label className="block space-y-1.5">
              <span className="label">Rôle du compte</span>
              <select name="role" defaultValue={editingUser?.role || "CLIENT"} className="field text-[14px]">
                <option value="CLIENT">Client</option>
                <option value="STAFF">Membre de l&apos;équipe</option>
                <option value="ADMIN">Administrateur</option>
              </select>
            </label>
          )}

          {error && <p className="text-[13px] font-medium text-danger">{error}</p>}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={handleClose} className="btn btn-outline h-11 px-5">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary h-11 min-w-40 px-5">
              {loading ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <Plus size={15} aria-hidden="true" />}
              {isEditing ? "Enregistrer" : "Créer le compte"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
