"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/utils/adminAuth";
import { recordManualPayment } from "@/lib/payments";

/**
 * Encaisse un règlement hors plateforme (virement, espèces, chèque).
 * Réservé à l'administration. Le reçu PDF est généré automatiquement.
 */
export async function recordManualPaymentAction(input: {
  invoiceId: string;
  amount: number;
  method: string;
  note?: string;
}) {
  try {
    const admin = await requireAdmin();
    if (!admin) return { success: false as const, error: "Accès réservé à l'administration." };

    const result = await recordManualPayment({
      invoiceId: input.invoiceId,
      amount: input.amount,
      method: input.method,
      note: input.note,
    });

    revalidatePath("/admin/invoices");
    revalidatePath("/dashboard/invoices");
    revalidatePath(`/dashboard/projects`);

    return {
      success: true as const,
      invoiceStatus: result.invoiceStatus,
      amountPaid: result.amountPaid,
    };
  } catch (error) {
    console.error("[manual-payment] Échec :", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Encaissement impossible.",
    };
  }
}
