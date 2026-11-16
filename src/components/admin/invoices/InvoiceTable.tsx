"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download, FileText, Search } from "lucide-react";
import { Invoice, User, Project, InvoiceStatus } from "@prisma/client";
import ManualPaymentButton from "@/components/admin/invoices/ManualPaymentButton";
import { INVOICE_STATUS_LABEL, toneFor } from "@/lib/labels";
import { formatDate, formatMoney } from "@/lib/format";

export type InvoiceRow = Invoice & { client: User | null; project: Project | null };

const FILTERS: { value: "ALL" | InvoiceStatus; label: string }[] = [
  { value: "ALL", label: "Tous les statuts" },
  { value: "DRAFT", label: "Brouillon" },
  { value: "SENT", label: "Envoyée" },
  { value: "PAID", label: "Payée" },
  { value: "OVERDUE", label: "En retard" },
  { value: "CANCELLED", label: "Annulée" },
];

export default function InvoiceTable({ invoices }: { invoices: InvoiceRow[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | InvoiceStatus>("ALL");

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return invoices.filter((invoice) => {
      if (status !== "ALL" && invoice.status !== status) return false;
      if (!term) return true;
      return [invoice.id, invoice.client?.name, invoice.client?.email, invoice.project?.title]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [invoices, search, status]);

  const total = rows.reduce((sum, invoice) => sum + invoice.amount, 0);
  const received = rows.reduce((sum, invoice) => sum + (invoice.amountPaid ?? 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher un client, un projet, un numéro…"
            className="field h-10 pl-9 text-[13px]"
            aria-label="Rechercher une facture"
          />
        </div>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as "ALL" | InvoiceStatus)}
          className="field h-10 w-auto text-[13px]"
          aria-label="Filtrer par statut"
        >
          {FILTERS.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </select>

        <p className="text-[12px] text-muted">
          {rows.length} facture{rows.length > 1 ? "s" : ""} · {formatMoney(total)} facturé ·{" "}
          {formatMoney(received)} encaissé
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="surface px-5 py-10 text-center text-[14px] text-secondary">
          Aucune facture ne correspond à ce filtre.
        </p>
      ) : (
        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="label px-4 py-3 font-semibold">Facture</th>
                  <th className="label px-4 py-3 font-semibold">Client</th>
                  <th className="label px-4 py-3 font-semibold">Projet</th>
                  <th className="label px-4 py-3 text-right font-semibold">Montant</th>
                  <th className="label px-4 py-3 font-semibold">Statut</th>
                  <th className="label px-4 py-3 font-semibold">Échéance</th>
                  <th className="label px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((invoice) => {
                  const remaining = Math.max(0, invoice.amount - (invoice.amountPaid ?? 0));
                  return (
                    <tr key={invoice.id} className="transition-colors hover:bg-card-hover">
                      <td className="px-4 py-3">
                        <span className="numeric text-[13px] font-medium">#{invoice.id.slice(-8)}</span>
                        <p className="text-[11px] text-muted">{formatDate(invoice.createdAt)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[13px] font-medium">{invoice.client?.name ?? "Client"}</p>
                        <p className="text-[11px] text-muted">{invoice.client?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-secondary">
                        {invoice.project?.title ?? "Sans projet"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="numeric text-[13px] font-semibold">{formatMoney(invoice.amount)}</p>
                        {(invoice.amountPaid ?? 0) > 0 && remaining > 0 && (
                          <p className="text-[11px] text-muted">{formatMoney(remaining)} restant</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-medium ${toneFor(
                            invoice.status
                          )}`}
                        >
                          {INVOICE_STATUS_LABEL[invoice.status] ?? invoice.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-secondary">{formatDate(invoice.dueDate)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {invoice.pdfUrl ? (
                            <Link
                              href={invoice.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Télécharger la facture"
                              aria-label={`Télécharger la facture ${invoice.id.slice(-8)}`}
                              className="grid h-8 w-8 place-items-center rounded-[8px] border border-border text-secondary transition-colors hover:border-primary/40 hover:text-foreground"
                            >
                              <Download size={14} aria-hidden="true" />
                            </Link>
                          ) : (
                            <span
                              title="Aucun PDF joint"
                              className="grid h-8 w-8 place-items-center rounded-[8px] border border-dashed border-border text-muted/60"
                            >
                              <FileText size={14} aria-hidden="true" />
                            </span>
                          )}

                          {invoice.status !== "PAID" && invoice.status !== "CANCELLED" && remaining > 0 && (
                            <ManualPaymentButton invoiceId={invoice.id} remaining={remaining} />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
