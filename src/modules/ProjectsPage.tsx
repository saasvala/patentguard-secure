import { useState } from 'react';
import { getProjects, getClients, saveProjects } from '@/lib/store';
import type { Project } from '@/types';
import { Plus, Search } from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState(getProjects);
  const clients = getClients();
  const [search, setSearch] = useState('');

  const filtered = projects.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const addProject = () => {
    const newP: Project = {
      id: crypto.randomUUID(),
      client_id: clients[0]?.id || '',
      title: `New Patent Project ${projects.length + 1}`,
      status: 'draft',
      created_by: 'current',
      created_at: new Date().toISOString().split('T')[0],
    };
    const updated = [...projects, newP];
    saveProjects(updated);
    setProjects(updated);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Patent Search Projects</h1>
          <p className="text-sm text-muted-foreground">{projects.length} projects</p>
        </div>
        <button onClick={addProject} className="flex items-center gap-2 px-4 py-2 gradient-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

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
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{p.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{clients.find(c => c.id === p.client_id)?.name || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-semibold uppercase px-2 py-1 rounded-full ${
                    p.status === 'active' ? 'bg-success/10 text-success' :
                    p.status === 'completed' ? 'bg-accent/10 text-accent' :
                    p.status === 'on-hold' ? 'bg-warning/10 text-warning' :
                    'bg-muted text-muted-foreground'
                  }`}>{p.status}</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
