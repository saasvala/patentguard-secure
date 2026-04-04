import { useState } from 'react';
import { getBillings, getClients, saveBillings, addAuditLog, getCurrentUser } from '@/lib/store';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/rbac';
import type { Billing } from '@/types';
import { Plus, Pencil, Archive } from 'lucide-react';

export default function BillingPage() {
  const [billings, setBillings] = useState(getBillings);
  const clients = getClients();
  const { currentRole } = useAuth();
  const roleName = currentRole?.name || '';
  const canCreate = hasPermission(roleName, 'billing', 'create');
  const canUpdate = hasPermission(roleName, 'billing', 'update');
  const canDelete = hasPermission(roleName, 'billing', 'delete');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ client_id: '', amount: 0, tax_rate: 18, date: '', description: '', status: 'pending' as Billing['status'] });

  const persist = (updated: Billing[]) => { saveBillings(updated); setBillings(updated); };
  const active = billings.filter(b => !b.archived);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim() || form.amount <= 0) return;
    const newBilling: Billing = {
      id: crypto.randomUUID(),
      client_id: form.client_id || clients[0]?.id || '',
      amount: form.amount,
      tax_rate: form.tax_rate,
      date: form.date || new Date().toISOString().split('T')[0],
      description: form.description.trim(),
      status: form.status,
    };
    persist([...billings, newBilling]);
    addAuditLog(getCurrentUser()?.id || 'system', 'billing', `Created invoice: ${newBilling.description} - $${newBilling.amount}`);
    setForm({ client_id: '', amount: 0, tax_rate: 18, date: '', description: '', status: 'pending' });
    setShowAdd(false);
  };

  const handleUpdate = () => {
    if (!editId) return;
    persist(billings.map(b => b.id === editId ? { ...b, client_id: form.client_id, amount: form.amount, tax_rate: form.tax_rate, date: form.date, description: form.description, status: form.status } : b));
    addAuditLog(getCurrentUser()?.id || 'system', 'billing', `Updated invoice: ${form.description}`);
    setEditId(null);
  };

  const handleArchive = (id: string) => {
    persist(billings.map(b => b.id === id ? { ...b, archived: true } : b));
    addAuditLog(getCurrentUser()?.id || 'system', 'billing', `Archived invoice: ${billings.find(b => b.id === id)?.description}`);
  };

  const startEdit = (b: Billing) => {
    setEditId(b.id);
    setForm({ client_id: b.client_id, amount: b.amount, tax_rate: b.tax_rate || 18, date: b.date, description: b.description, status: b.status });
    setShowAdd(false);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Billing & Invoicing</h1>
          <p className="text-sm text-muted-foreground">{active.length} invoices</p>
        </div>
        {canCreate && (
          <button onClick={() => { setShowAdd(!showAdd); setEditId(null); }} className="flex items-center gap-2 px-4 py-2 gradient-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> Add Invoice
          </button>
        )}
      </div>

      {(showAdd || editId) && (
        <form onSubmit={editId ? (e) => { e.preventDefault(); handleUpdate(); } : handleAdd} className="bg-card rounded-xl border border-border p-5 shadow-card space-y-3 animate-slide-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
            <select value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })} className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30">
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} placeholder="Amount" className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground whitespace-nowrap">Tax %:</label>
              <input type="number" min={0} max={100} value={form.tax_rate} onChange={e => setForm({ ...form, tax_rate: Number(e.target.value) })} className="w-20 px-2 py-1 bg-background border border-border rounded-lg text-sm text-foreground" />
            </div>
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Billing['status'] })} className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30">
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 gradient-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">{editId ? 'Update' : 'Add'}</button>
            {editId && <button type="button" onClick={() => setEditId(null)} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm">Cancel</button>}
          </div>
        </form>
      )}

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Description</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Client</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Amount</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Tax</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
              {(canUpdate || canDelete) && <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {active.map(b => (
              <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{b.description}</td>
                <td className="px-4 py-3 text-muted-foreground">{clients.find(c => c.id === b.client_id)?.name || '—'}</td>
                <td className="px-4 py-3 font-semibold text-foreground">${b.amount.toLocaleString()}</td>
                <td className="px-4 py-3 text-muted-foreground">{b.tax_rate || 0}%</td>
                <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{b.date}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-semibold uppercase px-2 py-1 rounded-full ${
                    b.status === 'paid' ? 'bg-success/10 text-success' :
                    b.status === 'overdue' ? 'bg-destructive/10 text-destructive' :
                    'bg-warning/10 text-warning'
                  }`}>{b.status}</span>
                </td>
                {(canUpdate || canDelete) && (
                  <td className="px-4 py-3 flex gap-1">
                    {canUpdate && <button onClick={() => startEdit(b)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><Pencil className="w-3.5 h-3.5" /></button>}
                    {canDelete && <button onClick={() => handleArchive(b.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"><Archive className="w-3.5 h-3.5" /></button>}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
