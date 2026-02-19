import { useState } from 'react';
import { getProjects, getClients, saveProjects } from '@/lib/store';
import { useAuth } from '@/contexts/AuthContext';
import type { Project } from '@/types';
import { Plus, Search, Pencil, Trash2, Check, X } from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState(getProjects);
  const clients = getClients();
  const [search, setSearch] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', client_id: '', status: 'draft' as Project['status'] });
  const { currentRole } = useAuth();

  const isReadOnly = currentRole?.name === 'External Auditor';
  const filtered = projects.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

  const persist = (updated: Project[]) => { saveProjects(updated); setProjects(updated); };

  const handleAdd = () => {
    if (!form.title.trim()) return;
    const newP: Project = {
      id: crypto.randomUUID(),
      client_id: form.client_id || clients[0]?.id || '',
      title: form.title.trim(),
      status: form.status,
      created_by: 'current',
      created_at: new Date().toISOString().split('T')[0],
    };
    persist([...projects, newP]);
    setForm({ title: '', client_id: '', status: 'draft' });
    setShowAdd(false);
  };

  const handleUpdate = () => {
    if (!editId || !form.title.trim()) return;
    persist(projects.map(p => p.id === editId ? { ...p, title: form.title.trim(), client_id: form.client_id, status: form.status } : p));
    setEditId(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this project?')) return;
    persist(projects.filter(p => p.id !== id));
  };

  const startEdit = (p: Project) => {
    setEditId(p.id);
    setForm({ title: p.title, client_id: p.client_id, status: p.status });
    setShowAdd(false);
  };

  const statusColors: Record<string, string> = {
    active: 'bg-success/10 text-success',
    completed: 'bg-accent/10 text-accent',
    'on-hold': 'bg-warning/10 text-warning',
    draft: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Patent Search Projects</h1>
          <p className="text-sm text-muted-foreground">{projects.length} projects</p>
        </div>
        {!isReadOnly && (
          <button onClick={() => { setShowAdd(true); setEditId(null); setForm({ title: '', client_id: clients[0]?.id || '', status: 'draft' }); }} className="flex items-center gap-2 px-4 py-2 gradient-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> New Project
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(showAdd || editId) && !isReadOnly && (
        <div className="bg-card rounded-xl border border-border p-5 shadow-card space-y-3">
          <h3 className="text-sm font-semibold text-card-foreground">{editId ? 'Edit Project' : 'New Project'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Project Title" className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
            <select value={form.client_id} onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))} className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30">
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Project['status'] }))} className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30">
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
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
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..." className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Title</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Client</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Created</th>
              {!isReadOnly && <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{p.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{clients.find(c => c.id === p.client_id)?.name || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-semibold uppercase px-2 py-1 rounded-full ${statusColors[p.status] || ''}`}>{p.status}</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.created_at}</td>
                {!isReadOnly && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => startEdit(p)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
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
