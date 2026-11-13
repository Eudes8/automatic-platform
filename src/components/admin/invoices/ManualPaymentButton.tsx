"use client";

import { useState, useTransition } from "react";
import { Banknote, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { recordManualPaymentAction } from "@/lib/actions/manualPayments";

interface ManualPaymentButtonProps {
  invoiceId: string;
  remaining: number;
}

const METHODS = ["Virement bancaire", "Espèces", "Chèque", "Mobile Money (hors plateforme)"];

/**
 * Encaissement manuel côté administration : enregistre un règlement reçu hors
 * plateforme et déclenche le reçu PDF, exactement comme un paiement en ligne.
 */
export default function ManualPaymentButton({ invoiceId, remaining }: ManualPaymentButtonProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(Math.max(0, Math.round(remaining))));
  const [method, setMethod] = useState(METHODS[0]);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError("Montant invalide.");
      return;
    }
    setError(null);

    startTransition(async () => {
      const result = await recordManualPaymentAction({ invoiceId, amount: value, method });
      if (!result.success) {
        setError(result.error);
        return;
      }
      toast.success("Encaissement enregistré", {
        description: `${value.toLocaleString("fr-FR")} F CFA · facture ${result.invoiceStatus}`,
      });
      setOpen(false);
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Encaisser un règlement hors plateforme"
        className="w-10 h-10 rounded-xl bg-background border border-border/50 flex items-center justify-center text-primary/40 hover:text-primary hover:border-primary/50 transition-all"
      >
        <Banknote size={16} />
      </button>

      {open && (
        <form
          onSubmit={submit}
          className="absolute right-0 top-12 z-30 w-[300px] rounded-[14px] border border-border bg-card p-4 shadow-xl space-y-3 text-left"
        >
          <div className="flex items-start justify-between">
            <p className="text-[12px] font-semibold text-foreground">Encaissement manuel</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Fermer">
              <X size={14} className="text-muted" />
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-muted" htmlFor={`manual-${invoiceId}`}>
              Montant reçu (F CFA)
            </label>
            <input
              id={`manual-${invoiceId}`}
              value={amount}
              onChange={(event) => setAmount(event.target.value.replace(/[^\d]/g, ""))}
              inputMode="numeric"
              className="field numeric h-9 text-[13px]"
            />
            <p className="text-[11px] text-muted">
              Reste {Math.max(0, Math.round(remaining)).toLocaleString("fr-FR")} F CFA
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-muted" htmlFor={`method-${invoiceId}`}>
              Moyen
            </label>
            <select
              id={`method-${invoiceId}`}
              value={method}
              onChange={(event) => setMethod(event.target.value)}
              className="field h-9 text-[12px]"
            >
              {METHODS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-[11px] text-danger">{error}</p>}

          <button type="submit" disabled={pending} className="btn btn-primary h-9 w-full text-[12px]">
            {pending ? <Loader2 size={13} className="animate-spin" /> : null}
            Enregistrer le règlement
          </button>
        </form>
      )}
    </div>
  );
}
