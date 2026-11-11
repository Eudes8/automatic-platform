"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

const formSchema = z.object({
  name: z.string().min(2, "Indiquez votre nom (2 caractères minimum)"),
  email: z.string().email("Format d'e-mail invalide"),
  password: z.string().min(8, "8 caractères minimum"),
});

type FormValues = z.infer<typeof formSchema>;

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    try {
      const signUp = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      });

      if (signUp.error) {
        toast.error(
          signUp.error.message === "User already exists"
            ? "Un compte existe déjà avec cet e-mail. Connectez-vous."
            : signUp.error.message || "Création du compte impossible"
        );
        return;
      }

      toast.success("Compte créé");
      router.push("/dashboard");
    } catch {
      toast.error("Une erreur est survenue. Réessayez.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="name" className="block text-[13px] font-medium text-foreground">
          Nom complet
        </label>
        <input
          id="name"
          {...register("name")}
          autoComplete="name"
          placeholder="Prénom et nom"
          aria-invalid={Boolean(errors.name)}
          className="field"
        />
        {errors.name && <p className="text-[12px] text-danger">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-[13px] font-medium text-foreground">
          Adresse e-mail
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          autoComplete="email"
          placeholder="vous@entreprise.com"
          aria-invalid={Boolean(errors.email)}
          className="field"
        />
        {errors.email && <p className="text-[12px] text-danger">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-[13px] font-medium text-foreground">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          {...register("password")}
          autoComplete="new-password"
          placeholder="8 caractères minimum"
          aria-invalid={Boolean(errors.password)}
          className="field"
        />
        {errors.password && <p className="text-[12px] text-danger">{errors.password.message}</p>}
      </div>

      <button type="submit" disabled={isLoading} className="btn btn-primary h-12 w-full">
        {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
        Créer mon compte
      </button>

      <p className="text-[12px] text-muted">
        En créant un compte, vous acceptez que nous utilisions vos informations pour le suivi de vos projets.
      </p>
    </form>
  );
}
