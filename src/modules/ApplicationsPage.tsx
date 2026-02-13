import { getApplications, getProjects } from '@/lib/store';

export default function ApplicationsPage() {
  const apps = getApplications();
  const projects = getProjects();

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Patent Applications</h1>
        <p className="text-sm text-muted-foreground">{apps.length} applications</p>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Filing No</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Project</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {apps.map(a => (
              <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-medium text-foreground">{a.filing_no}</td>
                <td className="px-4 py-3 text-muted-foreground">{projects.find(p => p.id === a.project_id)?.title || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-semibold uppercase px-2 py-1 rounded-full ${
                    a.status === 'granted' ? 'bg-success/10 text-success' :
                    a.status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                    a.status === 'filed' ? 'bg-accent/10 text-accent' :
                    'bg-warning/10 text-warning'
                  }`}>{a.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
