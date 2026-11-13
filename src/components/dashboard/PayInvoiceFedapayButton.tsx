"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Smartphone } from "lucide-react";

interface PayInvoiceFedapayButtonProps {
  invoiceId: string;
}

/**
 * Bouton « Payer par FedaPay » : initialise une transaction FedaPay côté
 * serveur, puis redirige vers sa page de paiement hébergée (Mobile Money,
 * cartes). Montants facturés en FCFA, devise native de FedaPay.
 */
export default function PayInvoiceFedapayButton({ invoiceId }: PayInvoiceFedapayButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetch("/api/payments/fedapay/initialize", {
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

      toast.info("Redirection vers FedaPay", {
        description: "Choisissez Mobile Money ou carte bancaire.",
      });
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
      className="btn btn-outline h-11 w-full px-4 text-[13px]"
    >
      {loading ? <Loader2 size={15} className="animate-spin" /> : <Smartphone size={15} />}
      Payer par FedaPay
    </button>
  );
}
