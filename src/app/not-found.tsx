"use client";

import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-9xl font-heading font-bold text-primary">404</h1>
          <h2 className="text-2xl font-heading font-bold text-secondary">Page non trouvée</h2>
          <p className="text-secondary/60 max-w-md mx-auto">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
          >
            <Home className="w-4 h-4" />
            Retour à l'accueil
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 border border-border bg-background text-secondary rounded-full font-medium hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Page précédente
          </button>
        </div>
      </div>
    </div>
  );
}