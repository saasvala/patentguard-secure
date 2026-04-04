import { useState } from 'react';
import { getPriorArt, getProjects, savePriorArt, addAuditLog, getCurrentUser } from '@/lib/store';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/rbac';
import type { PriorArt } from '@/types';
import { Plus, Pencil, Archive, AlertTriangle } from 'lucide-react';

export default function PriorArtPage() {
  const [items, setItems] = useState(getPriorArt);
  const projects = getProjects();
  const { currentRole } = useAuth();
  const roleName = currentRole?.name || '';
  const canCreate = hasPermission(roleName, 'prior_art', 'create');
  const canUpdate = hasPermission(roleName, 'prior_art', 'update');
  const canDelete = hasPermission(roleName, 'prior_art', 'delete');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ reference: '', project_id: '', summary: '', novelty_score: 50 });

  const persist = (updated: PriorArt[]) => { savePriorArt(updated); setItems(updated); };
  const active = items.filter(i => !i.archived);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.reference.trim()) return;
    const newItem: PriorArt = {
      id: crypto.randomUUID(),
      project_id: form.project_id || projects[0]?.id || '',
      reference: form.reference.trim(),
      summary: form.summary.trim(),
      novelty_score: form.novelty_score,
      duplicate_risk: form.novelty_score < 50,
    };
    persist([...items, newItem]);
    addAuditLog(getCurrentUser()?.id || 'system', 'prior_art', `Created prior art: ${newItem.reference}`);
    setForm({ reference: '', project_id: '', summary: '', novelty_score: 50 });
    setShowAdd(false);
  };

  const handleUpdate = () => {
    if (!editId) return;
    persist(items.map(i => i.id === editId ? {
      ...i, reference: form.reference, summary: form.summary,
      project_id: form.project_id, novelty_score: form.novelty_score,
      duplicate_risk: form.novelty_score < 50
    } : i));
    addAuditLog(getCurrentUser()?.id || 'system', 'prior_art', `Updated prior art: ${form.reference}`);
    setEditId(null);
  };

  const handleArchive = (id: string) => {
    persist(items.map(i => i.id === id ? { ...i, archived: true } : i));
    addAuditLog(getCurrentUser()?.id || 'system', 'prior_art', `Archived prior art: ${items.find(i => i.id === id)?.reference}`);
  };

  const startEdit = (item: PriorArt) => {
    setEditId(item.id);
    setForm({ reference: item.reference, project_id: item.project_id, summary: item.summary, novelty_score: item.novelty_score || 50 });
    setShowAdd(false);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Prior Art Analysis</h1>
          <p className="text-sm text-muted-foreground">{active.length} references</p>
        </div>
        {canCreate && (
          <button onClick={() => { setShowAdd(!showAdd); setEditId(null); }} className="flex items-center gap-2 px-4 py-2 gradient-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> Add Reference
          </button>
        )}
      </div>

      {(showAdd || editId) && (
        <form onSubmit={editId ? (e) => { e.preventDefault(); handleUpdate(); } : handleAdd} className="bg-card rounded-xl border border-border p-5 shadow-card space-y-3 animate-slide-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} placeholder="Patent Reference (e.g. US20210034901A1)" className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
            <select value={form.project_id} onChange={e => setForm({ ...form, project_id: e.target.value })} className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30">
              {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
            <input value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} placeholder="Summary" className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 md:col-span-2" />
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">Novelty Score:</label>
              <input type="number" min={0} max={100} value={form.novelty_score} onChange={e => setForm({ ...form, novelty_score: Number(e.target.value) })} className="w-20 px-2 py-1 bg-background border border-border rounded-lg text-sm text-foreground" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 gradient-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              {editId ? 'Update' : 'Add'}
            </button>
            {editId && <button type="button" onClick={() => setEditId(null)} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm">Cancel</button>}
          </div>
        </form>
      )}

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Reference</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Project</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Summary</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Novelty</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Risk</th>
              {(canUpdate || canDelete) && <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {active.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No prior art references</td></tr>
            ) : active.map(i => (
              <tr key={i.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-medium text-foreground">{i.reference}</td>
                <td className="px-4 py-3 text-muted-foreground">{projects.find(p => p.id === i.project_id)?.title || '—'}</td>
                <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{i.summary}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold ${(i.novelty_score || 0) >= 70 ? 'text-success' : (i.novelty_score || 0) >= 40 ? 'text-warning' : 'text-destructive'}`}>
                    {i.novelty_score ?? '—'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {i.duplicate_risk && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-destructive">
                      <AlertTriangle className="w-3 h-3" /> DUPLICATE
                    </span>
                  )}
                </td>
                {(canUpdate || canDelete) && (
                  <td className="px-4 py-3 flex gap-1">
                    {canUpdate && <button onClick={() => startEdit(i)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><Pencil className="w-3.5 h-3.5" /></button>}
                    {canDelete && <button onClick={() => handleArchive(i.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"><Archive className="w-3.5 h-3.5" /></button>}
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
