"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, CreditCard, Smartphone } from "lucide-react";

interface PaymentPanelProps {
  invoiceId: string;
  remaining: number;
  disabled?: boolean;
}

type Provider = "moneroo" | "fedapay";

/**
 * Choix du montant puis du fournisseur. Un acompte est accepté : le montant
 * est plafonné au reste à payer côté serveur.
 */
export default function PaymentPanel({ invoiceId, remaining, disabled = false }: PaymentPanelProps) {
  const [amount, setAmount] = useState<string>(String(Math.round(remaining)));
  const [loading, setLoading] = useState<Provider | null>(null);

  const parsed = Number(String(amount).replace(/\s/g, "").replace(",", "."));
  const invalid = !Number.isFinite(parsed) || parsed <= 0 || parsed > remaining;

  async function pay(provider: Provider) {
    if (invalid || loading) return;
    setLoading(provider);

    try {
      const response = await fetch(`/api/payments/${provider}/initialize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId, amount: parsed }),
      });

      const data = (await response.json().catch(() => null)) as
        | { checkoutUrl?: string; error?: string }
        | null;

      if (!response.ok || !data?.checkoutUrl) {
        toast.error("Paiement impossible", {
          description: data?.error ?? "Une erreur est survenue. Réessayez plus tard.",
        });
        setLoading(null);
        return;
      }

      toast.info("Redirection vers le paiement", {
        description: "Choisissez votre moyen de paiement sur la page sécurisée.",
      });
      window.location.href = data.checkoutUrl;
    } catch {
      toast.error("Paiement impossible", {
        description: "Connexion au serveur impossible. Vérifiez votre réseau.",
      });
      setLoading(null);
    }
  }

  if (disabled) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-3">
        <div className="space-y-1.5">
          <label htmlFor={`amount-${invoiceId}`} className="block text-[12px] font-medium text-foreground">
            Montant à payer
          </label>
          <input
            id={`amount-${invoiceId}`}
            type="text"
            inputMode="numeric"
            value={amount}
            onChange={(event) => setAmount(event.target.value.replace(/[^\d]/g, ""))}
            className="field numeric h-10 w-40 text-[13px]"
          />
        </div>
        <p className="pb-2.5 text-[12px] text-muted">
          Reste {new Intl.NumberFormat("fr-FR").format(remaining)} F CFA
        </p>
      </div>

      {invalid && (
        <p className="text-[12px] text-danger">
          Saisissez un montant compris entre 1 et {new Intl.NumberFormat("fr-FR").format(remaining)} F CFA.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => pay("moneroo")}
          disabled={invalid || loading !== null}
          className="btn btn-primary h-10 px-4 text-[13px]"
        >
          {loading === "moneroo" ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
          Payer par Moneroo
        </button>
        <button
          type="button"
          onClick={() => pay("fedapay")}
          disabled={invalid || loading !== null}
          className="btn btn-outline h-10 px-4 text-[13px]"
        >
          {loading === "fedapay" ? <Loader2 size={14} className="animate-spin" /> : <Smartphone size={14} />}
          Payer par FedaPay
        </button>
      </div>
    </div>
  );
}
