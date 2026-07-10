import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { isAccountLocked, recordFailedLogin, clearFailedLogins, getLockRemainingTime } from '@/lib/security';
import { resetSuperAdminWithBackupKey } from '@/lib/store';
import { z } from 'zod';
import { LogIn, Shield, Lock, KeyRound, X } from 'lucide-react';

const resetSchema = z.object({
  backupKey: z.string().trim().min(1, 'Backup key required').max(64),
  username: z.string().trim().min(3, 'Username must be at least 3 characters').max(120),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [lockMsg, setLockMsg] = useState('');
  const [resetOpen, setResetOpen] = useState(false);
  const [rBackup, setRBackup] = useState('');
  const [rUser, setRUser] = useState('');
  const [rPass, setRPass] = useState('');
  const [rErr, setRErr] = useState('');
  const [rOk, setROk] = useState('');

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setRErr(''); setROk('');
    const parsed = resetSchema.safeParse({ backupKey: rBackup, username: rUser, password: rPass });
    if (!parsed.success) {
      setRErr(parsed.error.issues[0].message);
      return;
    }
    const res = resetSuperAdminWithBackupKey(parsed.data.backupKey, parsed.data.username, parsed.data.password);
    if (!res.ok) { setRErr(res.error || 'Reset failed.'); return; }
    clearFailedLogins(parsed.data.username);
    clearFailedLogins(username);
    setROk('Super Admin credentials reset. You can now sign in.');
    setUsername(parsed.data.username);
    setPassword('');
    setError(''); setLockMsg('');
    setTimeout(() => { setResetOpen(false); setRBackup(''); setRUser(''); setRPass(''); setROk(''); }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLockMsg('');

    if (isAccountLocked(username)) {
      const remaining = Math.ceil(getLockRemainingTime(username) / 60000);
      setLockMsg(`Account locked. Try again in ${remaining} minute(s).`);
      return;
    }

    if (!login(username, password)) {
      const result = recordFailedLogin(username);
      if (result.locked) {
        setLockMsg('Account locked for 5 minutes due to too many failed attempts.');
      } else {
        setError(`Invalid credentials. ${result.remainingAttempts} attempt(s) remaining.`);
      }
    } else {
      clearFailedLogins(username);
    }
  };

  return (
    <div className="min-h-screen gradient-license flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-license-foreground tracking-tight">
            Patent Research Firm
          </h1>
          <p className="text-sm text-license-foreground/60 mt-1">Management System</p>
        </div>

        <div className="bg-license-card border border-sidebar-border rounded-xl p-6 shadow-elevated">
          <div className="flex items-center gap-2 mb-6">
            <LogIn className="w-4 h-4 text-license-accent" />
            <h2 className="text-sm font-semibold text-license-foreground uppercase tracking-wider">
              System Login
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-license-foreground/70 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-license-bg border border-sidebar-border rounded-lg text-license-foreground text-sm focus:outline-none focus:ring-2 focus:ring-license-accent/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-license-foreground/70 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-license-bg border border-sidebar-border rounded-lg text-license-foreground text-sm focus:outline-none focus:ring-2 focus:ring-license-accent/50 transition-all"
              />
            </div>

            {lockMsg && (
              <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-3 rounded-lg">
                <Lock className="w-4 h-4 shrink-0" />
                {lockMsg}
              </div>
            )}
            {error && !lockMsg && <p className="text-xs text-destructive">{error}</p>}

            <button type="submit" className="w-full py-3 gradient-primary text-primary-foreground rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity">
              Sign In
            </button>

            <button
              type="button"
              onClick={() => setResetOpen(true)}
              className="w-full text-[11px] text-license-foreground/60 hover:text-license-accent transition-colors flex items-center justify-center gap-1.5 pt-1"
            >
              <KeyRound className="w-3 h-3" />
              Forgot password? Reset Super Admin with Backup Key
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-license-foreground/30 mt-6">
          Powered by <span className="font-semibold">Software Vala™</span>
        </p>
      </div>

      {resetOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-license-card border border-sidebar-border rounded-xl p-6 shadow-elevated animate-slide-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-license-accent" />
                <h2 className="text-sm font-semibold text-license-foreground uppercase tracking-wider">
                  Super Admin Recovery
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setResetOpen(false)}
                className="p-1 rounded-md text-license-foreground/50 hover:text-license-foreground hover:bg-license-bg transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-license-foreground/60 mb-4">
              Enter your Backup Key to reset the Super Admin credentials. Failed-login lockouts on the new username will be cleared.
            </p>

            <form onSubmit={handleReset} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-license-foreground/70 mb-1.5">Backup Key</label>
                <input
                  type="text"
                  value={rBackup}
                  onChange={e => setRBackup(e.target.value)}
                  placeholder="XXXX-XXXX-XXXX"
                  maxLength={64}
                  className="w-full px-4 py-2.5 bg-license-bg border border-sidebar-border rounded-lg text-license-foreground font-mono text-sm tracking-widest placeholder:text-license-foreground/30 focus:outline-none focus:ring-2 focus:ring-license-accent/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-license-foreground/70 mb-1.5">New Username</label>
                <input
                  type="text"
                  value={rUser}
                  onChange={e => setRUser(e.target.value)}
                  maxLength={120}
                  className="w-full px-4 py-2.5 bg-license-bg border border-sidebar-border rounded-lg text-license-foreground text-sm focus:outline-none focus:ring-2 focus:ring-license-accent/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-license-foreground/70 mb-1.5">New Password</label>
                <input
                  type="password"
                  value={rPass}
                  onChange={e => setRPass(e.target.value)}
                  maxLength={128}
                  className="w-full px-4 py-2.5 bg-license-bg border border-sidebar-border rounded-lg text-license-foreground text-sm focus:outline-none focus:ring-2 focus:ring-license-accent/50 transition-all"
                />
                <p className="text-[10px] text-license-foreground/40 mt-1">Minimum 8 characters.</p>
              </div>

              {rErr && <p className="text-xs text-destructive">{rErr}</p>}
              {rOk && <p className="text-xs text-success">{rOk}</p>}

              <button
                type="submit"
                className="w-full py-2.5 gradient-primary text-primary-foreground rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity mt-2"
              >
                Reset Credentials
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
