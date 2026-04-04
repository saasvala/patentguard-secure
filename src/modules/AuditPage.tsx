import { getAuditLogs, getUsers } from '@/lib/store';

export default function AuditPage() {
  const logs = getAuditLogs();
  const users = getUsers();

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">{logs.length} forensic entries — immutable, append-only</p>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Module</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Action</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Hash</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No audit logs yet</td></tr>
              ) : logs.map(l => (
                <tr key={l.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{users.find(u => u.id === l.user_id)?.username || l.user_id}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <span className="text-[10px] font-semibold uppercase px-2 py-1 rounded-full bg-accent/10 text-accent">{l.module || '—'}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{l.action}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{new Date(l.date).toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground/60">{l.hash || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
