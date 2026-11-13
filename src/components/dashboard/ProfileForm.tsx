"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { updateProfile } from "@/lib/actions/profile";

interface ProfileFormProps {
  user: {
    name: string | null;
    companyName: string | null;
    phone: string | null;
    industry: string | null;
  };
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function submit(formData: FormData) {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(result.error ?? "Enregistrement impossible.");
      }
    });
  }

  return (
    <form action={submit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="name" className="block text-[13px] font-medium">
            Nom complet
          </label>
          <input id="name" name="name" defaultValue={user.name ?? ""} required className="field" />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="companyName" className="block text-[13px] font-medium">
            Entreprise
          </label>
          <input
            id="companyName"
            name="companyName"
            defaultValue={user.companyName ?? ""}
            className="field"
            placeholder="Nom de votre structure"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="phone" className="block text-[13px] font-medium">
            Téléphone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={user.phone ?? ""}
            className="field"
            placeholder="+225 ..."
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="industry" className="block text-[13px] font-medium">
            Secteur d&apos;activité
          </label>
          <input
            id="industry"
            name="industry"
            defaultValue={user.industry ?? ""}
            className="field"
            placeholder="Commerce, agriculture, services…"
          />
        </div>
      </div>

      {error && <p className="text-[12px] text-danger">{error}</p>}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn btn-primary h-11 px-5">
          {pending ? <Loader2 size={15} className="animate-spin" /> : null}
          Enregistrer
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-[13px] text-ok">
            <Check size={14} aria-hidden="true" /> Profil mis à jour
          </span>
        )}
      </div>
    </form>
  );
}
