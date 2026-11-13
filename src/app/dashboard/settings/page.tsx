import { redirect } from "next/navigation";
import { Mail, ShieldCheck, CalendarDays } from "lucide-react";
import { getCurrentUser } from "@/lib/actions/users";
import { formatDate } from "@/lib/format";
import ProfileForm from "@/components/dashboard/ProfileForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl sm:text-[2.2rem]">Paramètres</h1>
        <p className="mt-2 text-[15px] text-secondary">
          Vos informations de contact et les détails de votre compte.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">Profil</h2>
        <div className="surface p-4 md:p-6">
          <ProfileForm
            user={{
              name: user.name,
              companyName: user.companyName,
              phone: user.phone,
              industry: user.industry,
            }}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">Compte</h2>
        <ul className="surface divide-y divide-border">
          <li className="flex items-center justify-between gap-3 px-4 py-4 md:px-5">
            <span className="inline-flex items-center gap-2 text-[13px] text-secondary">
              <Mail size={15} className="text-muted" aria-hidden="true" /> Adresse e-mail
            </span>
            <span className="text-[13px] font-medium">{user.email}</span>
          </li>
          <li className="flex items-center justify-between gap-3 px-4 py-4 md:px-5">
            <span className="inline-flex items-center gap-2 text-[13px] text-secondary">
              <ShieldCheck size={15} className="text-muted" aria-hidden="true" /> Type de compte
            </span>
            <span className="text-[13px] font-medium">
              {user.role === "ADMIN" ? "Administration" : "Espace client"}
            </span>
          </li>
          <li className="flex items-center justify-between gap-3 px-4 py-4 md:px-5">
            <span className="inline-flex items-center gap-2 text-[13px] text-secondary">
              <CalendarDays size={15} className="text-muted" aria-hidden="true" /> Membre depuis
            </span>
            <span className="text-[13px] font-medium">{formatDate(user.createdAt)}</span>
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">Sécurité</h2>
        <div className="surface px-5 py-4">
          <p className="text-[14px] font-medium">Mot de passe</p>
          <p className="mt-1 text-[13px] text-secondary">
            Pour changer votre mot de passe, déconnectez-vous puis utilisez « Mot de passe oublié » sur la
            page de connexion. Un code à 6 chiffres vous sera envoyé par e-mail.
          </p>
        </div>
      </section>
    </div>
  );
}
