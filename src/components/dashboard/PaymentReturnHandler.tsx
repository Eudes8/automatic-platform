"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * Gestionnaire de retour Moneroo.
 *
 * Après un paiement, Moneroo redirige le client vers /dashboard/invoices avec
 * les paramètres `paymentId` et `paymentStatus`. Ce composant interroge alors
 * l'API de vérification (source de vérité : API Moneroo) pour synchroniser la
 * base et afficher un toast de confirmation, puis nettoie l'URL.
 */
export default function PaymentReturnHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    const paymentId = searchParams.get("paymentId");
    if (!paymentId) return;
    handled.current = true;

    async function verifyReturn() {
      try {
        const response = await fetch(
          `/api/payments/moneroo/verify?paymentId=${encodeURIComponent(paymentId ?? "")}`
        );
        const data = (await response.json().catch(() => null)) as
          | { invoiceStatus?: string; paymentStatus?: string; warning?: string; error?: string }
          | null;

        if (!response.ok) {
          toast.error("Vérification du paiement impossible", {
            description: data?.error ?? "Réessayez en rechargeant la page.",
          });
          return;
        }

        if (data?.invoiceStatus === "PAID") {
          toast.success("Paiement confirmé", {
            description: "Merci ! Votre facture est réglée et vos documents sont à jour.",
            duration: 8000,
          });
        } else if (data?.paymentStatus === "FAILED") {
          toast.error("Paiement échoué", {
            description: "La transaction n'a pas abouti. Vous pouvez retenter à tout moment.",
            duration: 8000,
          });
        } else if (data?.paymentStatus === "CANCELLED") {
          toast.info("Paiement annulé", {
            description: "Aucun montant n'a été débité. Vous pouvez relancer le paiement.",
          });
        } else if (data?.warning) {
          toast.info("Paiement en cours de vérification", {
            description: data.warning,
          });
        } else {
          toast.info("Paiement en attente de confirmation", {
            description: "Le statut sera mis à jour dès validation par Moneroo.",
          });
        }

        // Nettoie les paramètres de requête et rafraîchit les données serveur.
        router.replace("/dashboard/invoices");
        router.refresh();
      } catch {
        toast.error("Vérification impossible", {
          description: "Connexion au serveur impossible. Rechargez la page.",
        });
      }
    }

    verifyReturn();
  }, [searchParams, router]);

  return null;
}
