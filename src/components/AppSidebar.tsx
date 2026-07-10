import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAccessibleModules } from '@/lib/rbac';
import { ROLE_PERMISSIONS } from '@/types';
import {
  LayoutDashboard, Search, FileText, FilePlus, Users, Briefcase,
  Scale, Receipt, BarChart3, ClipboardList, Database, UserCog, LogOut, Shield, Clock, ChevronsUpDown, Eye, Check
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'projects', label: 'Patent Projects', icon: Search },
  { id: 'prior_art', label: 'Prior Art', icon: FileText },
  { id: 'applications', label: 'Applications', icon: FilePlus },
  { id: 'clients', label: 'Client Management', icon: Users },
  { id: 'cases', label: 'Case Tracking', icon: Briefcase },
  { id: 'deadlines', label: 'Deadlines & Alerts', icon: Clock },
  { id: 'billing', label: 'Billing & Invoicing', icon: Receipt },
  { id: 'reports', label: 'Reports & Export', icon: BarChart3 },
  { id: 'audit', label: 'Audit Logs', icon: ClipboardList },
  { id: 'backup', label: 'Backup / Restore', icon: Database },
];

const ADMIN_ITEMS = [
  { id: 'users', label: 'User Management', icon: UserCog },
];

interface Props {
  activePage: string;
  onNavigate: (page: string) => void;
}

export default function AppSidebar({ activePage, onNavigate }: Props) {
  const { currentUser, currentRole, logout, effectiveRoleName, viewAsRoleName, setViewAsRole } = useAuth();

  const roleName = effectiveRoleName || currentRole?.name || '';
  const allowedModules = getAccessibleModules(roleName);
  const isSuperAdmin = currentRole?.name === 'Super Admin';
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setSwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const allRoleNames = Object.keys(ROLE_PERMISSIONS);

  const handleSwitchRole = (name: string | null) => {
    setViewAsRole(name);
    setSwitcherOpen(false);
    onNavigate('dashboard');
  };

  return (
    <aside className="w-64 gradient-sidebar flex flex-col border-r border-sidebar-border shrink-0">
      {/* Header */}
      <div className="px-4 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-sidebar-primary-foreground leading-tight">PRFMS</h1>
            <p className="text-[10px] text-sidebar-foreground/50">No 13</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-auto py-3 px-2 space-y-0.5">
        {NAV_ITEMS.filter(item => allowedModules.includes(item.id)).map(item => {
          const Icon = item.icon;
          const active = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </button>
          );
        })}

        {isSuperAdmin && (
          <>
            <div className="pt-3 pb-1 px-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">Admin</p>
            </div>
            {ADMIN_ITEMS.map(item => {
              const Icon = item.icon;
              const active = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center justify-between mb-2 gap-1">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-sidebar-foreground truncate">{currentUser?.username}</p>
            <p className="text-[10px] text-sidebar-foreground/50 truncate">
              {currentRole?.name}
              {viewAsRoleName && <span className="text-sidebar-primary"> · viewing {viewAsRoleName}</span>}
            </p>
          </div>
          {isSuperAdmin && (
            <div className="relative" ref={switcherRef}>
              <button
                onClick={() => setSwitcherOpen(v => !v)}
                className="p-1.5 rounded-md text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                title="Switch role view"
              >
                <ChevronsUpDown className="w-4 h-4" />
              </button>
              {switcherOpen && (
                <div className="absolute bottom-full right-0 mb-2 w-56 bg-sidebar-accent border border-sidebar-border rounded-lg shadow-elevated py-1 z-50 max-h-80 overflow-auto">
                  <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                    View Dashboard As
                  </div>
                  <button
                    onClick={() => handleSwitchRole(null)}
                    className="w-full flex items-center justify-between gap-2 px-3 py-1.5 text-xs text-sidebar-foreground/80 hover:bg-sidebar-accent-foreground/10 transition-colors"
                  >
                    <span className="flex items-center gap-2"><Shield className="w-3 h-3" /> Super Admin (default)</span>
                    {!viewAsRoleName && <Check className="w-3 h-3 text-sidebar-primary" />}
                  </button>
                  <div className="my-1 border-t border-sidebar-border" />
                  {allRoleNames.filter(n => n !== 'Super Admin').map(name => (
                    <button
                      key={name}
                      onClick={() => handleSwitchRole(name)}
                      className="w-full flex items-center justify-between gap-2 px-3 py-1.5 text-xs text-sidebar-foreground/80 hover:bg-sidebar-accent-foreground/10 transition-colors"
                    >
                      <span className="flex items-center gap-2"><Eye className="w-3 h-3" /> {name}</span>
                      {viewAsRoleName === name && <Check className="w-3 h-3 text-sidebar-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <button
            onClick={logout}
            className="p-1.5 rounded-md text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[9px] text-sidebar-foreground/30 text-center">
          Powered by <span className="font-semibold">Software Vala™</span>
        </p>
      </div>
    </aside>
  );
}
