import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Key } from 'lucide-react';

export default function LicenseScreen() {
  const { activateLicense } = useAuth();
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!activateLicense(key.trim().toUpperCase())) {
      setError('Invalid license key. Use 2345-3456-4567 or PRFMS-XXXX-XXXX-XXXX.');
    }
  };

  return (
    <div className="min-h-screen gradient-license flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4">
            <Shield className="w-8 h-8 text-license-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-license-foreground tracking-tight">
            Patent Research Firm
          </h1>
          <p className="text-sm text-license-foreground/60 mt-1">Management System — No 13</p>
        </div>

        <div className="bg-license-card border border-sidebar-border rounded-xl p-6 shadow-elevated">
          <div className="flex items-center gap-2 mb-6">
            <Key className="w-4 h-4 text-license-accent" />
            <h2 className="text-sm font-semibold text-license-foreground uppercase tracking-wider">
              License Activation
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-license-foreground/70 mb-2">
                Enter License Key
              </label>
              <input
                type="text"
                value={key}
                onChange={e => setKey(e.target.value.toUpperCase())}
                placeholder="2345-3456-4567"
                className="w-full px-4 py-3 bg-license-bg border border-sidebar-border rounded-lg text-license-foreground font-mono text-sm tracking-widest placeholder:text-license-foreground/30 focus:outline-none focus:ring-2 focus:ring-license-accent/50 focus:border-license-accent transition-all"
                maxLength={20}
              />
            </div>

            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 gradient-primary text-primary-foreground rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Activate System
            </button>
          </form>

          <p className="mt-4 text-[10px] text-license-foreground/40 text-center">
            Device-bound activation • One key per device
          </p>
        </div>

        <p className="text-center text-[11px] text-license-foreground/30 mt-6">
          Powered by <span className="font-semibold">Software Vala™</span>
        </p>
      </div>
    </div>
  );
}
