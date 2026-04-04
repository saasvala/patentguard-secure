import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Search, FileText, FilePlus, Users, Briefcase,
  Scale, Receipt, BarChart3, ClipboardList, Database, UserCog, LogOut, Shield
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'projects', label: 'Patent Projects', icon: Search },
  { id: 'prior_art', label: 'Prior Art', icon: FileText },
  { id: 'applications', label: 'Applications', icon: FilePlus },
  { id: 'clients', label: 'Client Management', icon: Users },
  { id: 'cases', label: 'Case Tracking', icon: Briefcase },
  { id: 'billing', label: 'Billing & Invoicing', icon: Receipt },
  { id: 'reports', label: 'Reports & Export', icon: BarChart3 },
  { id: 'audit', label: 'Audit Logs', icon: ClipboardList },
  { id: 'backup', label: 'Backup / Restore', icon: Database },
];

// Role-based module access mapping
const ROLE_ACCESS: Record<string, string[]> = {
  'Super Admin': ['dashboard', 'projects', 'prior_art', 'applications', 'clients', 'cases', 'billing', 'reports', 'audit', 'backup', 'users'],
  'Patent Director': ['dashboard', 'projects', 'prior_art', 'applications', 'clients', 'cases', 'reports'],
  'Senior Patent Analyst': ['dashboard', 'projects', 'prior_art', 'applications', 'cases'],
  'Patent Research Analyst': ['dashboard', 'projects', 'prior_art'],
  'Legal Advisor': ['dashboard', 'projects', 'applications', 'cases'],
  'Client Manager': ['dashboard', 'clients', 'billing', 'reports'],
  'Documentation Officer': ['dashboard', 'projects', 'prior_art', 'applications'],
  'Finance Officer': ['dashboard', 'billing', 'reports'],
  'External Auditor': ['dashboard', 'projects', 'prior_art', 'applications', 'clients', 'cases', 'billing', 'reports', 'audit'],
};

const ADMIN_ITEMS = [
  { id: 'users', label: 'User Management', icon: UserCog },
];

interface Props {
  activePage: string;
  onNavigate: (page: string) => void;
}

export default function AppSidebar({ activePage, onNavigate }: Props) {
  const { currentUser, currentRole, logout } = useAuth();

  const isSuperAdmin = currentRole?.name === 'Super Admin';

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
        <div className="flex items-center justify-between mb-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-sidebar-foreground truncate">{currentUser?.username}</p>
            <p className="text-[10px] text-sidebar-foreground/50 truncate">{currentRole?.name}</p>
          </div>
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
