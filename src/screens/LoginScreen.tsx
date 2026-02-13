import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, Shield } from 'lucide-react';

export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!login(username, password)) {
      setError('Invalid username or password');
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

            {error && <p className="text-xs text-destructive">{error}</p>}

            <button type="submit" className="w-full py-3 gradient-primary text-primary-foreground rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity">
              Sign In
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-license-foreground/30 mt-6">
          Powered by <span className="font-semibold">Software Vala™</span>
        </p>
      </div>
    </div>
  );
}
