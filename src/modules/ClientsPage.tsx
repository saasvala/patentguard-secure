import { useState } from 'react';
import { getClients, saveClients } from '@/lib/store';
import { useAuth } from '@/contexts/AuthContext';
import type { Client } from '@/types';
import { Plus, Pencil, Trash2, Search, X, Check } from 'lucide-react';

export default function ClientsPage() {
  const [clients, setClients] = useState(getClients);
  const [search, setSearch] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', industry: '', contact: '' });
  const [showAdd, setShowAdd] = useState(false);
  const { currentRole } = useAuth();

  const isReadOnly = currentRole?.name === 'External Auditor';
  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.industry.toLowerCase().includes(search.toLowerCase())
  );

  const persist = (updated: Client[]) => {
    saveClients(updated);
    setClients(updated);
  };

  const handleAdd = () => {
    if (!form.name.trim()) return;
    const newClient: Client = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      industry: form.industry.trim(),
      contact: form.contact.trim(),
    };
    persist([...clients, newClient]);
    setForm({ name: '', industry: '', contact: '' });
    setShowAdd(false);
  };

  const handleUpdate = () => {
    if (!editId || !form.name.trim()) return;
    persist(clients.map(c => c.id === editId ? { ...c, name: form.name.trim(), industry: form.industry.trim(), contact: form.contact.trim() } : c));
    setEditId(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this client?')) return;
    persist(clients.filter(c => c.id !== id));
  };

  const startEdit = (c: Client) => {
    setEditId(c.id);
    setForm({ name: c.name, industry: c.industry, contact: c.contact });
    setShowAdd(false);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Client Management</h1>
          <p className="text-sm text-muted-foreground">{clients.length} clients</p>
        </div>
        {!isReadOnly && (
          <button onClick={() => { setShowAdd(true); setEditId(null); setForm({ name: '', industry: '', contact: '' }); }} className="flex items-center gap-2 px-4 py-2 gradient-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> Add Client
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(showAdd || editId) && !isReadOnly && (
        <div className="bg-card rounded-xl border border-border p-5 shadow-card space-y-3">
          <h3 className="text-sm font-semibold text-card-foreground">{editId ? 'Edit Client' : 'New Client'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Company Name" className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
            <input value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} placeholder="Industry" className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
            <input value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} placeholder="Contact Email" className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
          </div>
          <div className="flex gap-2">
            <button onClick={editId ? handleUpdate : handleAdd} className="flex items-center gap-1 px-4 py-2 gradient-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              <Check className="w-4 h-4" /> {editId ? 'Update' : 'Create'}
            </button>
            <button onClick={() => { setShowAdd(false); setEditId(null); }} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm hover:bg-muted/80 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients..." className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => (
          <div key={c.id} className="bg-card rounded-xl border border-border p-5 shadow-card hover:shadow-elevated transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-card-foreground mb-1">{c.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{c.industry}</p>
                <p className="text-xs text-accent">{c.contact}</p>
              </div>
              {!isReadOnly && (
                <div className="flex gap-1">
                  <button onClick={() => startEdit(c)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
