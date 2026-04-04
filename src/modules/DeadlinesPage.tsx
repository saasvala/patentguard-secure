import { useState } from 'react';
import { getDeadlines, addDeadline, completeDeadline, refreshDeadlineStatuses } from '@/lib/deadlines';
import { getProjects } from '@/lib/store';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/rbac';
import type { Deadline } from '@/types';
import { Clock, Plus, Check, AlertTriangle, Calendar } from 'lucide-react';

export default function DeadlinesPage() {
  const [deadlines, setDeadlines] = useState<Deadline[]>(() => refreshDeadlineStatuses());
  const projects = getProjects();
  const { currentRole } = useAuth();
  const roleName = currentRole?.name || '';
  const canCreate = hasPermission(roleName, 'deadlines', 'create');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ project_id: '', type: 'filing' as Deadline['type'], title: '', due_date: '' });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.due_date) return;
    addDeadline({ project_id: form.project_id || projects[0]?.id || '', type: form.type, title: form.title.trim(), due_date: form.due_date });
    setDeadlines(refreshDeadlineStatuses());
    setForm({ project_id: '', type: 'filing', title: '', due_date: '' });
    setShowAdd(false);
  };

  const handleComplete = (id: string) => {
    completeDeadline(id);
    setDeadlines(refreshDeadlineStatuses());
  };

  const statusStyles: Record<string, string> = {
    upcoming: 'bg-warning/10 text-warning',
    overdue: 'bg-destructive/10 text-destructive',
    completed: 'bg-success/10 text-success',
  };

  const typeLabels: Record<string, string> = {
    filing: 'Filing',
    renewal: 'Renewal',
    objection_response: 'Objection Response',
    hearing: 'Hearing',
    custom: 'Custom',
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Deadlines & Alerts</h1>
          <p className="text-sm text-muted-foreground">{deadlines.filter(d => d.status !== 'completed').length} active deadlines</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 px-4 py-2 gradient-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> Add Deadline
          </button>
        )}
      </div>

      {/* Overdue alerts */}
      {deadlines.filter(d => d.status === 'overdue').length > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-sm font-semibold text-destructive">Overdue Deadlines</span>
          </div>
          <div className="space-y-1">
            {deadlines.filter(d => d.status === 'overdue').map(d => (
              <p key={d.id} className="text-xs text-destructive/80">
                • {d.title} — due {d.due_date} ({projects.find(p => p.id === d.project_id)?.title || 'Unknown'})
                {d.escalated && <span className="ml-1 text-destructive font-bold">⚠ ESCALATED</span>}
              </p>
            ))}
          </div>
        </div>
      )}

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-card rounded-xl border border-border p-5 shadow-card space-y-3 animate-slide-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Deadline title" className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
            <input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as Deadline['type'] })} className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30">
              <option value="filing">Filing</option>
              <option value="renewal">Renewal</option>
              <option value="objection_response">Objection Response</option>
              <option value="hearing">Hearing</option>
              <option value="custom">Custom</option>
            </select>
            <select value={form.project_id} onChange={e => setForm({ ...form, project_id: e.target.value })} className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30">
              {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
          <button type="submit" className="px-4 py-2 gradient-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            Add Deadline
          </button>
        </form>
      )}

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Title</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Project</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Due Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {deadlines.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                No deadlines set
              </td></tr>
            ) : deadlines.map(d => (
              <tr key={d.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{d.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{typeLabels[d.type]}</td>
                <td className="px-4 py-3 text-muted-foreground">{projects.find(p => p.id === d.project_id)?.title || '—'}</td>
                <td className="px-4 py-3 font-mono text-xs text-foreground">{d.due_date}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-semibold uppercase px-2 py-1 rounded-full ${statusStyles[d.status]}`}>
                    {d.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {d.status !== 'completed' && (
                    <button onClick={() => handleComplete(d.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-success hover:bg-muted transition-colors" title="Mark Complete">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
