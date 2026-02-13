import { getAuditLogs, getUsers } from '@/lib/store';

export default function AuditPage() {
  const logs = getAuditLogs();
  const users = getUsers();

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">{logs.length} entries</p>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">User</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Action</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Date</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No audit logs yet</td></tr>
            ) : logs.map(l => (
              <tr key={l.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{users.find(u => u.id === l.user_id)?.username || l.user_id}</td>
                <td className="px-4 py-3 text-muted-foreground">{l.action}</td>
                <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{new Date(l.date).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
