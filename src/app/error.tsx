"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] Erreur non gérée :", error);
  }, [error]);

  return (
    <main className="grid min-h-[100dvh] place-items-center bg-background px-5">
      <div className="w-full max-w-[460px] text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-[14px] border border-danger/25 bg-danger/5">
          <AlertCircle size={22} className="text-danger" aria-hidden="true" />
        </span>

        <h1 className="mt-5 text-2xl">Une erreur inattendue</h1>
        <p className="mt-2 text-[14px] text-secondary">
          L&apos;action n&apos;a pas abouti. Vos données sont intactes. Réessayez, ou revenez à votre espace.
        </p>

        {error.digest && (
          <p className="mt-3 text-[12px] text-muted">
            Code de suivi : <span className="numeric">{error.digest}</span>
          </p>
        )}

        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <button type="button" onClick={() => reset()} className="btn btn-primary h-11 px-5">
            <RotateCcw size={15} aria-hidden="true" /> Réessayer
          </button>
          <Link href="/dashboard" className="btn btn-outline h-11 px-5">
            Retour à mon espace
          </Link>
        </div>

        <p className="mt-6 text-[12px] text-muted">
          Le problème persiste ?{" "}
          <a href="mailto:automaticbmje@gmail.com" className="text-accent hover:underline">
            écrivez-nous
          </a>
          .
        </p>
      </div>
    </main>
  );
}
