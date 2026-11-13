import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Receipt, Download, CheckCircle2 } from "lucide-react";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/actions/users";
import { formatMoney, formatDate } from "@/lib/format";
import { INVOICE_STATUS_LABEL, toneFor } from "@/lib/labels";
import PaymentPanel from "@/components/dashboard/PaymentPanel";
import PaymentReturnHandler from "@/components/dashboard/PaymentReturnHandler";

export const dynamic = "force-dynamic";

const PROVIDER_LABEL: Record<string, string> = {
  MONEROO: "Moneroo",
  FEDAPAY: "FedaPay",
  MANUAL: "Encaissement manuel",
};

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  PENDING: "En attente",
  SUCCESS: "Confirmé",
  FAILED: "Échoué",
  CANCELLED: "Annulé",
};

export default async function ClientInvoicesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const invoices = await prisma.invoice.findMany({
    where: { clientId: user.id },
    include: {
      project: { select: { title: true } },
      payments: { orderBy: { createdAt: "desc" } },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const totalBilled = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const totalPaid = invoices.reduce((sum, invoice) => sum + invoice.amountPaid, 0);
  const totalDue = Math.max(0, totalBilled - totalPaid);

  return (
    <div className="space-y-8">
      <Suspense fallback={null}>
        <PaymentReturnHandler />
      </Suspense>

      <header>
        <h1 className="text-3xl sm:text-[2.2rem]">Mes factures</h1>
        <p className="mt-2 text-[15px] text-secondary">
          Réglez en FCFA par Mobile Money ou carte. Les acomptes sont acceptés.
        </p>
      </header>

      {invoices.length > 0 && (
        <section className="grid gap-3 sm:grid-cols-3">
          <div className="surface px-5 py-4">
            <p className="text-[12px] text-muted">Total facturé</p>
            <p className="numeric mt-1 text-xl font-semibold">{formatMoney(totalBilled)}</p>
          </div>
          <div className="surface px-5 py-4">
            <p className="text-[12px] text-muted">Total encaissé</p>
            <p className="numeric mt-1 text-xl font-semibold text-ok">{formatMoney(totalPaid)}</p>
          </div>
          <div className="surface px-5 py-4">
            <p className="text-[12px] text-muted">Reste à payer</p>
            <p className="numeric mt-1 text-xl font-semibold text-foreground">{formatMoney(totalDue)}</p>
          </div>
        </section>
      )}

      {invoices.length === 0 ? (
        <div className="surface flex flex-col items-start gap-3 px-6 py-10">
          <span className="grid h-11 w-11 place-items-center rounded-[12px] border border-border bg-background">
            <Receipt size={20} className="text-accent" aria-hidden="true" />
          </span>
          <h2 className="text-xl">Aucune facture pour l&apos;instant</h2>
          <p className="max-w-[52ch] text-[14px] text-secondary">
            Vos factures apparaîtront ici dès qu&apos;un projet sera cadré et devisé.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {invoices.map((invoice) => {
            const remaining = Math.max(0, Math.round(invoice.amount - invoice.amountPaid));
            const partiallyPaid = invoice.amountPaid > 0 && remaining > 0;
            const payable = invoice.status !== "PAID" && invoice.status !== "CANCELLED" && remaining > 0;

            return (
              <li key={invoice.id} className="surface overflow-hidden">
                <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-4 md:px-5">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[15px] font-semibold">
                        Facture #{invoice.id.slice(-6).toUpperCase()}
                      </span>
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${toneFor(invoice.status)}`}>
                        {invoice.status === "PAID"
                          ? "Payée"
                          : partiallyPaid
                            ? "Partiellement payée"
                            : INVOICE_STATUS_LABEL[invoice.status]}
                      </span>
                    </div>
                    <p className="mt-1 text-[13px] text-secondary">
                      {invoice.project?.title ?? "Sans projet"}
                      {invoice.description ? ` · ${invoice.description}` : ""}
                    </p>
                    <p className="mt-0.5 text-[12px] text-muted">Échéance {formatDate(invoice.dueDate)}</p>
                  </div>

                  <div className="text-right">
                    <p className="numeric text-lg font-semibold">{formatMoney(invoice.amount)}</p>
                    {invoice.amountPaid > 0 && (
                      <p className="text-[12px] text-ok">
                        Encaissé : {formatMoney(invoice.amountPaid)}
                        {remaining > 0 ? ` · reste ${formatMoney(remaining)}` : ""}
                      </p>
                    )}
                    {invoice.receiptUrl && (
                      <a
                        href={invoice.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-[12px] font-medium text-accent hover:underline"
                      >
                        <Download size={12} aria-hidden="true" /> Reçu
                      </a>
                    )}
                  </div>
                </div>

                {invoice.payments.length > 0 && (
                  <div className="border-t border-border bg-background/40 px-4 py-3 md:px-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                      Historique des paiements
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {invoice.payments.map((payment) => (
                        <li
                          key={payment.id}
                          className="flex flex-wrap items-center justify-between gap-2 text-[12px]"
                        >
                          <span className="text-secondary">
                            {formatDate(payment.createdAt)} · {PROVIDER_LABEL[payment.provider] ?? payment.provider}
                            {payment.method ? ` · ${payment.method}` : ""}
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="numeric text-foreground">{formatMoney(payment.amount)}</span>
                            <span
                              className={
                                payment.status === "SUCCESS"
                                  ? "text-ok"
                                  : payment.status === "PENDING"
                                    ? "text-warn"
                                    : "text-danger"
                              }
                            >
                              {PAYMENT_STATUS_LABEL[payment.status] ?? payment.status}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {payable ? (
                  <div className="border-t border-border px-4 py-4 md:px-5">
                    <PaymentPanel invoiceId={invoice.id} remaining={remaining} />
                  </div>
                ) : invoice.status === "PAID" ? (
                  <div className="flex items-center gap-2 border-t border-border px-4 py-3 text-[13px] text-ok md:px-5">
                    <CheckCircle2 size={15} aria-hidden="true" /> Facture intégralement réglée.
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
