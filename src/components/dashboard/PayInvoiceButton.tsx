"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Wallet } from "lucide-react";

interface PayInvoiceButtonProps {
  invoiceId: string;
  amount: number;
  currency?: string;
}

/**
 * Bouton "Payer avec Moneroo" : demande au serveur d'initialiser un paiement
 * Moneroo pour la facture, puis redirige vers la page de checkout Moneroo
 * (Mobile Money, cartes, etc.).
 */
export default function PayInvoiceButton({ invoiceId, amount, currency = "CFA" }: PayInvoiceButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetch("/api/payments/moneroo/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      });

      const data = (await response.json().catch(() => null)) as
        | { checkoutUrl?: string; error?: string }
        | null;

      if (!response.ok || !data?.checkoutUrl) {
        toast.error("Paiement impossible", {
          description: data?.error ?? "Une erreur est survenue. Réessayez plus tard.",
        });
        setLoading(false);
        return;
      }

      toast.info("Redirection vers Moneroo…", {
        description: "Choisissez votre moyen de paiement (Mobile Money, carte, etc.).",
      });
      // La redirection complète laisse le temps au toast de s'afficher.
      window.location.href = data.checkoutUrl;
    } catch {
      toast.error("Paiement impossible", {
        description: "Connexion au serveur impossible. Vérifiez votre réseau.",
      });
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handlePay}
      disabled={loading}
      className="w-full py-5 bg-primary text-background rounded-[1.5rem] text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all duration-500 shadow-2xl shadow-primary/20 group/btn disabled:opacity-60 disabled:hover:scale-100"
    >
      {loading ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          Redirection en cours…
        </>
      ) : (
        <>
          <Wallet size={14} className="group-hover/btn:-translate-y-0.5 transition-transform" />
          Payer {new Intl.NumberFormat("fr-FR").format(amount)} {currency} · Moneroo
        </>
      )}
    </button>
  );
}
