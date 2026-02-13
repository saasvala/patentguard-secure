import { useState } from 'react';
import { getBackups, createBackup } from '@/lib/store';
import type { Backup } from '@/types';
import { Database, Plus } from 'lucide-react';

export default function BackupPage() {
  const [backups, setBackups] = useState<Backup[]>(getBackups);

  const handleBackup = () => {
    const b = createBackup();
    setBackups([b, ...backups]);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Backup / Restore</h1>
          <p className="text-sm text-muted-foreground">{backups.length} backups</p>
        </div>
        <button onClick={handleBackup} className="flex items-center gap-2 px-4 py-2 gradient-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Create Backup
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Size</th>
            </tr>
          </thead>
          <tbody>
            {backups.length === 0 ? (
              <tr><td colSpan={2} className="px-4 py-8 text-center text-muted-foreground">
                <Database className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                No backups yet
              </td></tr>
            ) : backups.map(b => (
              <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-foreground">{new Date(b.date).toLocaleString()}</td>
                <td className="px-4 py-3 text-muted-foreground">{b.size}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
