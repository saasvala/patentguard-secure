import { getCases, getProjects } from '@/lib/store';

export default function CasesPage() {
  const cases = getCases();
  const projects = getProjects();

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Case Tracking</h1>
        <p className="text-sm text-muted-foreground">{cases.length} tracked cases</p>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Project</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Stage</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Date</th>
            </tr>
          </thead>
          <tbody>
            {cases.map(c => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{projects.find(p => p.id === c.project_id)?.title || '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.stage}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
