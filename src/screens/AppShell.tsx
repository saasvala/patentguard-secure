import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AppSidebar from '@/components/AppSidebar';
import DashboardPage from '@/modules/DashboardPage';
import ProjectsPage from '@/modules/ProjectsPage';
import PriorArtPage from '@/modules/PriorArtPage';
import ApplicationsPage from '@/modules/ApplicationsPage';
import ClientsPage from '@/modules/ClientsPage';
import CasesPage from '@/modules/CasesPage';
import BillingPage from '@/modules/BillingPage';
import ReportsPage from '@/modules/ReportsPage';
import AuditPage from '@/modules/AuditPage';
import BackupPage from '@/modules/BackupPage';
import UsersPage from '@/modules/UsersPage';

const PAGES: Record<string, React.FC> = {
  dashboard: DashboardPage,
  projects: ProjectsPage,
  prior_art: PriorArtPage,
  applications: ApplicationsPage,
  clients: ClientsPage,
  cases: CasesPage,
  billing: BillingPage,
  reports: ReportsPage,
  audit: AuditPage,
  backup: BackupPage,
  users: UsersPage,
};

export default function AppShell() {
  const [activePage, setActivePage] = useState('dashboard');
  const { currentRole } = useAuth();

  const isReadOnly = currentRole?.name === 'External Auditor';
  const PageComponent = PAGES[activePage] || DashboardPage;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar activePage={activePage} onNavigate={setActivePage} />
      <main className="flex-1 overflow-auto">
        {isReadOnly && (
          <div className="bg-warning/10 border-b border-warning/20 px-4 py-2 text-xs font-medium text-warning">
            READ-ONLY MODE — External Auditor Access
          </div>
        )}
        <PageComponent />
      </main>
    </div>
  );
}
