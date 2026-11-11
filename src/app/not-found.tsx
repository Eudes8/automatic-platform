import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-background px-5">
      <div className="w-full max-w-[440px] text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-[14px] border border-border bg-card">
          <Compass size={22} className="text-accent" aria-hidden="true" />
        </span>

        <p className="mt-5 text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">Erreur 404</p>
        <h1 className="mt-1 text-2xl">Cette page n&apos;existe pas</h1>
        <p className="mt-2 text-[14px] text-secondary">
          Le lien est peut-être obsolète, ou la page a été déplacée.
        </p>

        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Link href="/dashboard" className="btn btn-primary h-11 px-5">
            Mon espace
          </Link>
          <Link href="/" className="btn btn-outline h-11 px-5">
            Accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
