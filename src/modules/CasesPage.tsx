import { useState } from 'react';
import { getCases, getProjects, saveCases, addAuditLog, getCurrentUser } from '@/lib/store';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/rbac';
import type { Case } from '@/types';
import { Plus, Pencil, Archive } from 'lucide-react';

export default function CasesPage() {
  const [cases, setCases] = useState(getCases);
  const projects = getProjects();
  const { currentRole } = useAuth();
  const roleName = currentRole?.name || '';
  const canCreate = hasPermission(roleName, 'cases', 'create');
  const canUpdate = hasPermission(roleName, 'cases', 'update');
  const canDelete = hasPermission(roleName, 'cases', 'delete');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ project_id: '', stage: '', date: '', hearing_notes: '', outcome_probability: 50 });

  const persist = (updated: Case[]) => { saveCases(updated); setCases(updated); };
  const active = cases.filter(c => !c.archived);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.stage.trim()) return;
    const newCase: Case = {
      id: crypto.randomUUID(),
      project_id: form.project_id || projects[0]?.id || '',
      stage: form.stage.trim(),
      date: form.date || new Date().toISOString().split('T')[0],
      hearing_notes: form.hearing_notes,
      outcome_probability: form.outcome_probability,
    };
    persist([...cases, newCase]);
    addAuditLog(getCurrentUser()?.id || 'system', 'cases', `Created case: ${newCase.stage}`);
    setForm({ project_id: '', stage: '', date: '', hearing_notes: '', outcome_probability: 50 });
    setShowAdd(false);
  };

  const handleUpdate = () => {
    if (!editId) return;
    persist(cases.map(c => c.id === editId ? { ...c, ...form } : c));
    addAuditLog(getCurrentUser()?.id || 'system', 'cases', `Updated case: ${form.stage}`);
    setEditId(null);
  };

  const handleArchive = (id: string) => {
    persist(cases.map(c => c.id === id ? { ...c, archived: true } : c));
    addAuditLog(getCurrentUser()?.id || 'system', 'cases', `Archived case: ${cases.find(c => c.id === id)?.stage}`);
  };

  const startEdit = (c: Case) => {
    setEditId(c.id);
    setForm({ project_id: c.project_id, stage: c.stage, date: c.date, hearing_notes: c.hearing_notes || '', outcome_probability: c.outcome_probability || 50 });
    setShowAdd(false);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Case Tracking</h1>
          <p className="text-sm text-muted-foreground">{active.length} tracked cases</p>
        </div>
        {canCreate && (
          <button onClick={() => { setShowAdd(!showAdd); setEditId(null); }} className="flex items-center gap-2 px-4 py-2 gradient-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> Add Case
          </button>
        )}
      </div>

      {(showAdd || editId) && (
        <form onSubmit={editId ? (e) => { e.preventDefault(); handleUpdate(); } : handleAdd} className="bg-card rounded-xl border border-border p-5 shadow-card space-y-3 animate-slide-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select value={form.project_id} onChange={e => setForm({ ...form, project_id: e.target.value })} className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30">
              {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
            <input value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })} placeholder="Stage (e.g. Hearing, Objection)" className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground whitespace-nowrap">Outcome %:</label>
              <input type="number" min={0} max={100} value={form.outcome_probability} onChange={e => setForm({ ...form, outcome_probability: Number(e.target.value) })} className="w-20 px-2 py-1 bg-background border border-border rounded-lg text-sm text-foreground" />
            </div>
            <input value={form.hearing_notes} onChange={e => setForm({ ...form, hearing_notes: e.target.value })} placeholder="Hearing notes" className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 md:col-span-2" />
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
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Project</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Stage</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Outcome %</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Notes</th>
              {(canUpdate || canDelete) && <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {active.map(c => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{projects.find(p => p.id === c.project_id)?.title || '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.stage}</td>
                <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{c.date}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold ${(c.outcome_probability || 0) >= 70 ? 'text-success' : (c.outcome_probability || 0) >= 40 ? 'text-warning' : 'text-destructive'}`}>
                    {c.outcome_probability ?? '—'}%
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs max-w-xs truncate">{c.hearing_notes || '—'}</td>
                {(canUpdate || canDelete) && (
                  <td className="px-4 py-3 flex gap-1">
                    {canUpdate && <button onClick={() => startEdit(c)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><Pencil className="w-3.5 h-3.5" /></button>}
                    {canDelete && <button onClick={() => handleArchive(c.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"><Archive className="w-3.5 h-3.5" /></button>}
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
