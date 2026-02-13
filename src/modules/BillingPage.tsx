import { getBillings, getClients } from '@/lib/store';

export default function BillingPage() {
  const billings = getBillings();
  const clients = getClients();

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Billing & Invoicing</h1>
        <p className="text-sm text-muted-foreground">{billings.length} invoices</p>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Description</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Client</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Amount</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {billings.map(b => (
              <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{b.description}</td>
                <td className="px-4 py-3 text-muted-foreground">{clients.find(c => c.id === b.client_id)?.name || '—'}</td>
                <td className="px-4 py-3 font-semibold text-foreground">${b.amount.toLocaleString()}</td>
                <td className="px-4 py-3 text-muted-foreground">{b.date}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-semibold uppercase px-2 py-1 rounded-full ${
                    b.status === 'paid' ? 'bg-success/10 text-success' :
                    b.status === 'overdue' ? 'bg-destructive/10 text-destructive' :
                    'bg-warning/10 text-warning'
                  }`}>{b.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
