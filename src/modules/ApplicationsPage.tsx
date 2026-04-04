import { useState } from 'react';
import { getApplications, getProjects, saveApplications, addAuditLog, getCurrentUser } from '@/lib/store';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/rbac';
import type { Application } from '@/types';
import { Plus, Pencil, Archive } from 'lucide-react';

export default function ApplicationsPage() {
  const [apps, setApps] = useState(getApplications);
  const projects = getProjects();
  const { currentRole } = useAuth();
  const roleName = currentRole?.name || '';
  const canCreate = hasPermission(roleName, 'applications', 'create');
  const canUpdate = hasPermission(roleName, 'applications', 'update');
  const canDelete = hasPermission(roleName, 'applications', 'delete');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ filing_no: '', project_id: '', status: 'filed' as Application['status'], country: '', deadline: '' });

  const persist = (updated: Application[]) => { saveApplications(updated); setApps(updated); };
  const active = apps.filter(a => !a.archived);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.filing_no.trim()) return;
    const newApp: Application = {
      id: crypto.randomUUID(),
      project_id: form.project_id || projects[0]?.id || '',
      filing_no: form.filing_no.trim(),
      status: form.status,
      country: form.country,
      deadline: form.deadline || undefined,
    };
    persist([...apps, newApp]);
    addAuditLog(getCurrentUser()?.id || 'system', 'applications', `Created application: ${newApp.filing_no}`);
    setForm({ filing_no: '', project_id: '', status: 'filed', country: '', deadline: '' });
    setShowAdd(false);
  };

  const handleUpdate = () => {
    if (!editId) return;
    persist(apps.map(a => a.id === editId ? { ...a, filing_no: form.filing_no, project_id: form.project_id, status: form.status, country: form.country, deadline: form.deadline || undefined } : a));
    addAuditLog(getCurrentUser()?.id || 'system', 'applications', `Updated application: ${form.filing_no}`);
    setEditId(null);
  };

  const handleArchive = (id: string) => {
    persist(apps.map(a => a.id === id ? { ...a, archived: true } : a));
    addAuditLog(getCurrentUser()?.id || 'system', 'applications', `Archived application: ${apps.find(a => a.id === id)?.filing_no}`);
  };

  const startEdit = (a: Application) => {
    setEditId(a.id);
    setForm({ filing_no: a.filing_no, project_id: a.project_id, status: a.status, country: a.country || '', deadline: a.deadline || '' });
    setShowAdd(false);
  };

  const statusColors: Record<string, string> = {
    granted: 'bg-success/10 text-success',
    rejected: 'bg-destructive/10 text-destructive',
    filed: 'bg-accent/10 text-accent',
    pending: 'bg-warning/10 text-warning',
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Patent Applications</h1>
          <p className="text-sm text-muted-foreground">{active.length} applications</p>
        </div>
        {canCreate && (
          <button onClick={() => { setShowAdd(!showAdd); setEditId(null); }} className="flex items-center gap-2 px-4 py-2 gradient-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> Add Application
          </button>
        )}
      </div>

      {(showAdd || editId) && (
        <form onSubmit={editId ? (e) => { e.preventDefault(); handleUpdate(); } : handleAdd} className="bg-card rounded-xl border border-border p-5 shadow-card space-y-3 animate-slide-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input value={form.filing_no} onChange={e => setForm({ ...form, filing_no: e.target.value })} placeholder="Filing No" className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
            <select value={form.project_id} onChange={e => setForm({ ...form, project_id: e.target.value })} className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30">
              {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Application['status'] })} className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30">
              <option value="filed">Filed</option>
              <option value="pending">Pending</option>
              <option value="granted">Granted</option>
              <option value="rejected">Rejected</option>
            </select>
            <input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} placeholder="Country (e.g. US, EP)" className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
            <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
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
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Filing No</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Project</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Country</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Deadline</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
              {(canUpdate || canDelete) && <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {active.map(a => (
              <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-medium text-foreground">{a.filing_no}</td>
                <td className="px-4 py-3 text-muted-foreground">{projects.find(p => p.id === a.project_id)?.title || '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{a.country || '—'}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{a.deadline || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-semibold uppercase px-2 py-1 rounded-full ${statusColors[a.status]}`}>{a.status}</span>
                </td>
                {(canUpdate || canDelete) && (
                  <td className="px-4 py-3 flex gap-1">
                    {canUpdate && <button onClick={() => startEdit(a)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><Pencil className="w-3.5 h-3.5" /></button>}
                    {canDelete && <button onClick={() => handleArchive(a.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"><Archive className="w-3.5 h-3.5" /></button>}
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
