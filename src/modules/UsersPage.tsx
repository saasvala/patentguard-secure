import { useState } from 'react';
import { getUsers, saveUsers, getRoles, addAuditLog, getCurrentUser } from '@/lib/store';
import type { User } from '@/types';
import { Plus, RotateCcw, UserX } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState(getUsers);
  const roles = getRoles();
  const [showForm, setShowForm] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRoleId, setNewRoleId] = useState(roles[1]?.id || '');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) return;
    const newUser: User = {
      id: crypto.randomUUID(),
      role_id: newRoleId,
      username: newUsername,
      password: newPassword,
      status: 'active',
    };
    const updated = [...users, newUser];
    saveUsers(updated);
    setUsers(updated);
    addAuditLog(getCurrentUser()?.id || 'system', `Created user: ${newUsername}`);
    setNewUsername('');
    setNewPassword('');
    setShowForm(false);
  };

  const toggleStatus = (id: string) => {
    const updated = users.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' as const : 'active' as const } : u);
    saveUsers(updated);
    setUsers(updated);
  };

  const resetPassword = (id: string) => {
    const pwd = prompt('Enter new password:');
    if (!pwd) return;
    const updated = users.map(u => u.id === id ? { ...u, password: pwd } : u);
    saveUsers(updated);
    setUsers(updated);
    addAuditLog(getCurrentUser()?.id || 'system', `Reset password for user: ${users.find(u => u.id === id)?.username}`);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground">{users.length} users</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 gradient-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-card rounded-xl border border-border p-5 shadow-card space-y-3 animate-slide-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input value={newUsername} onChange={e => setNewUsername(e.target.value)} placeholder="Username" className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
            <input value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Password" type="password" className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
            <select value={newRoleId} onChange={e => setNewRoleId(e.target.value)} className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30">
              {roles.filter(r => r.name !== 'Super Admin').map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="px-4 py-2 gradient-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            Create User
          </button>
        </form>
      )}

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Username</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Role</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{u.username}</td>
                <td className="px-4 py-3 text-muted-foreground">{roles.find(r => r.id === u.role_id)?.name}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-semibold uppercase px-2 py-1 rounded-full ${
                    u.status === 'active' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                  }`}>{u.status}</span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => resetPassword(u.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Reset Password">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => toggleStatus(u.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Toggle Status">
                    <UserX className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
