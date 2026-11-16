import { getAllInvoices } from "@/lib/actions/invoices";
import InvoiceCRUDModal from "@/components/admin/invoices/InvoiceCRUDModal";
import InvoiceTable from "@/components/admin/invoices/InvoiceTable";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminInvoicesPage() {
  const invoices = await getAllInvoices();

  const unpaid = invoices.filter(
    (invoice) => invoice.status === "SENT" || invoice.status === "OVERDUE"
  );
  const toCollect = unpaid.reduce(
    (sum, invoice) => sum + Math.max(0, invoice.amount - (invoice.amountPaid ?? 0)),
    0
  );
  const collected = invoices.reduce((sum, invoice) => sum + (invoice.amountPaid ?? 0), 0);
  const today = new Date();
  const overdue = unpaid.filter((invoice) => invoice.dueDate < today).length;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-[2.2rem]">Facturation</h1>
          <p className="mt-2 text-[15px] text-secondary">
            {formatMoney(collected)} encaissé, {formatMoney(toCollect)} à recevoir
            {overdue > 0 ? `, dont ${overdue} en retard` : ""}.
          </p>
        </div>
        <InvoiceCRUDModal />
      </header>

      <InvoiceTable invoices={invoices} />
    </div>
  );
}
