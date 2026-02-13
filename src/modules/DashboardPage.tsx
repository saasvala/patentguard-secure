import { getProjects, getClients, getBillings, getApplications, getUsers } from '@/lib/store';
import { BarChart3, Users, FileText, Receipt, TrendingUp, Briefcase } from 'lucide-react';

export default function DashboardPage() {
  const projects = getProjects();
  const clients = getClients();
  const billings = getBillings();
  const applications = getApplications();
  const users = getUsers();

  const totalRevenue = billings.reduce((s, b) => s + b.amount, 0);
  const activeProjects = projects.filter(p => p.status === 'active').length;

  const stats = [
    { label: 'Active Projects', value: activeProjects, icon: Briefcase, color: 'text-accent' },
    { label: 'Total Clients', value: clients.length, icon: Users, color: 'text-success' },
    { label: 'Applications', value: applications.length, icon: FileText, color: 'text-warning' },
    { label: 'Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: Receipt, color: 'text-accent' },
    { label: 'Team Members', value: users.length, icon: Users, color: 'text-primary' },
    { label: 'Total Projects', value: projects.length, icon: TrendingUp, color: 'text-success' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Patent Research Firm Overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-card rounded-xl border border-border p-5 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 shadow-card">
          <h3 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-accent" />
            Recent Projects
          </h3>
          <div className="space-y-3">
            {projects.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-card-foreground">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{clients.find(c => c.id === p.client_id)?.name}</p>
                </div>
                <span className={`text-[10px] font-semibold uppercase px-2 py-1 rounded-full ${
                  p.status === 'active' ? 'bg-success/10 text-success' :
                  p.status === 'completed' ? 'bg-accent/10 text-accent' :
                  p.status === 'on-hold' ? 'bg-warning/10 text-warning' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 shadow-card">
          <h3 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-accent" />
            Recent Billing
          </h3>
          <div className="space-y-3">
            {billings.slice(0, 5).map(b => (
              <div key={b.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-card-foreground">{b.description}</p>
                  <p className="text-xs text-muted-foreground">{clients.find(c => c.id === b.client_id)?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-card-foreground">${b.amount.toLocaleString()}</p>
                  <span className={`text-[10px] font-semibold uppercase ${
                    b.status === 'paid' ? 'text-success' : b.status === 'overdue' ? 'text-destructive' : 'text-warning'
                  }`}>
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
