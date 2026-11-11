import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/shared/Logo";

interface AuthShellProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const POINTS = [
  "Le cahier des charges validé, version par version",
  "L'avancement réel des tâches et des jalons",
  "Les livrables à valider et les factures à régler",
];

export default function AuthShell({ eyebrow, title, subtitle, children, footer }: AuthShellProps) {
  return (
    <main className="min-h-[100dvh] bg-background">
      <div className="grid min-h-[100dvh] lg:grid-cols-2">
        {/* Panneau de marque */}
        <aside className="relative hidden flex-col justify-between bg-primary p-10 text-background lg:flex xl:p-14">
          <Logo href="/" tone="inverse" />

          <div className="max-w-[38ch]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-background/50">
              Votre espace projet
            </p>
            <h2 className="mt-4 text-[2.4rem] leading-[1.06] text-background">
              Tout votre projet au même endroit, du cadrage à la facture.
            </h2>

            <ul className="mt-8 space-y-3">
              {POINTS.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-[14px] text-background/75">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-background/50" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[12px] text-background/45">
            Un problème d&apos;accès ? Écrivez à{" "}
            <a href="mailto:automaticbmje@gmail.com" className="text-background/80 underline underline-offset-4">
              automaticbmje@gmail.com
            </a>
          </p>
        </aside>

        {/* Formulaire */}
        <div className="flex flex-col">
          <div className="flex h-16 items-center justify-between px-5 lg:hidden">
            <Logo href="/" />
            <Link href="/" className="text-[13px] text-secondary">
              Accueil
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
            <div className="w-full max-w-[420px]">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">{eyebrow}</p>
              <h1 className="mt-2 text-3xl">{title}</h1>
              <p className="mt-2 text-[14px] text-secondary">{subtitle}</p>

              <div className="mt-8">{children}</div>

              {footer && <div className="mt-8 border-t border-border pt-6 text-[14px] text-secondary">{footer}</div>}
            </div>
          </div>

          <div className="px-5 pb-6 text-center text-[12px] text-muted sm:px-8">
            <Link href="/" className="hover:text-foreground transition-colors">
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
