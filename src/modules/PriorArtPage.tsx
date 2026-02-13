import { getPriorArt, getProjects } from '@/lib/store';

export default function PriorArtPage() {
  const items = getPriorArt();
  const projects = getProjects();

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Prior Art Analysis</h1>
        <p className="text-sm text-muted-foreground">{items.length} references found</p>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Reference</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Project</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Summary</th>
            </tr>
          </thead>
          <tbody>
            {items.map(i => (
              <tr key={i.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-medium text-foreground">{i.reference}</td>
                <td className="px-4 py-3 text-muted-foreground">{projects.find(p => p.id === i.project_id)?.title || '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{i.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
