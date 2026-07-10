import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { isSessionExpired, updateSessionActivity } from '@/lib/security';
import AppSidebar from '@/components/AppSidebar';
import DashboardPage from '@/modules/DashboardPage';
import ProjectsPage from '@/modules/ProjectsPage';
import PriorArtPage from '@/modules/PriorArtPage';
import ApplicationsPage from '@/modules/ApplicationsPage';
import ClientsPage from '@/modules/ClientsPage';
import CasesPage from '@/modules/CasesPage';
import DeadlinesPage from '@/modules/DeadlinesPage';
import BillingPage from '@/modules/BillingPage';
import ReportsPage from '@/modules/ReportsPage';
import AuditPage from '@/modules/AuditPage';
import BackupPage from '@/modules/BackupPage';
import UsersPage from '@/modules/UsersPage';
import { isReadOnly } from '@/lib/rbac';

const PAGES: Record<string, React.FC> = {
  dashboard: DashboardPage,
  projects: ProjectsPage,
  prior_art: PriorArtPage,
  applications: ApplicationsPage,
  clients: ClientsPage,
  cases: CasesPage,
  deadlines: DeadlinesPage,
  billing: BillingPage,
  reports: ReportsPage,
  audit: AuditPage,
  backup: BackupPage,
  users: UsersPage,
};

export default function AppShell() {
  const [activePage, setActivePage] = useState('dashboard');
  const { effectiveRoleName, logout } = useAuth();

  const readOnly = effectiveRoleName ? isReadOnly(effectiveRoleName) : false;
  const PageComponent = PAGES[activePage] || DashboardPage;

  // Session timeout check
  useEffect(() => {
    updateSessionActivity();
    const interval = setInterval(() => {
      if (isSessionExpired()) {
        logout();
      }
    }, 60_000);

    const handleActivity = () => updateSessionActivity();
    window.addEventListener('click', handleActivity);
    window.addEventListener('keydown', handleActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, [logout]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar activePage={activePage} onNavigate={setActivePage} />
      <main className="flex-1 overflow-auto">
        {readOnly && (
          <div className="bg-warning/10 border-b border-warning/20 px-4 py-2 text-xs font-medium text-warning">
            READ-ONLY MODE — External Auditor Access
          </div>
        )}
        <PageComponent />
      </main>
    </div>
  );
}
