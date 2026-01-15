'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-4">
          <AlertTriangle className="w-16 h-16 text-destructive mx-auto" />
          <h1 className="text-4xl font-heading font-bold text-primary">Erreur</h1>
          <p className="text-secondary/60">
            Une erreur inattendue s'est produite. Nos équipes ont été notifiées.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>

          <p className="text-xs text-secondary/40">
            Si le problème persiste, contactez notre support.
          </p>
        </div>
      </div>
    </div>
  );
}