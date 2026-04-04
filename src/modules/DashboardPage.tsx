import { getProjects, getClients, getBillings, getApplications, getUsers, getCases } from '@/lib/store';
import { getOverdueDeadlines, getUpcomingDeadlines } from '@/lib/deadlines';
import { BarChart3, Users, FileText, Receipt, TrendingUp, Briefcase, AlertTriangle, Clock, Shield, Target } from 'lucide-react';

export default function DashboardPage() {
  const projects = getProjects();
  const clients = getClients();
  const billings = getBillings();
  const applications = getApplications();
  const users = getUsers();
  const cases = getCases();
  const overdueDeadlines = getOverdueDeadlines();
  const upcomingDeadlines = getUpcomingDeadlines(14);

  const totalRevenue = billings.reduce((s, b) => s + b.amount, 0);
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const grantedApps = applications.filter(a => a.status === 'granted').length;
  const filingSuccessRate = applications.length > 0 ? Math.round((grantedApps / applications.length) * 100) : 0;
  const highRiskClients = clients.filter(c => c.risk_category === 'high').length;
  const pendingBillings = billings.filter(b => b.status === 'pending' || b.status === 'overdue').reduce((s, b) => s + b.amount, 0);

  const stats = [
    { label: 'Active Patents', value: activeProjects, icon: Briefcase, color: 'text-accent' },
    { label: 'Filing Success Rate', value: `${filingSuccessRate}%`, icon: Target, color: 'text-success' },
    { label: 'Risk Score', value: highRiskClients > 0 ? 'HIGH' : 'LOW', icon: Shield, color: highRiskClients > 0 ? 'text-destructive' : 'text-success' },
    { label: 'Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: Receipt, color: 'text-accent' },
    { label: 'Pending Deadlines', value: upcomingDeadlines.length, icon: Clock, color: 'text-warning' },
    { label: 'Total Projects', value: projects.length, icon: TrendingUp, color: 'text-success' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Legal Intelligence Dashboard</h1>
        <p className="text-sm text-muted-foreground">Patent Research Firm Overview</p>
      </div>

      {/* KPI Cards */}
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

      {/* AI Risk Alerts */}
      {overdueDeadlines.length > 0 && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-destructive mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            AI Risk Alerts — {overdueDeadlines.length} Critical
          </h3>
          <div className="space-y-2">
            {overdueDeadlines.slice(0, 5).map(d => (
              <div key={d.id} className="flex items-center justify-between py-2 border-b border-destructive/10 last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{d.title}</p>
                  <p className="text-xs text-muted-foreground">Due: {d.due_date} {d.escalated && '• ESCALATED'}</p>
                </div>
                <span className="text-[10px] font-semibold uppercase px-2 py-1 rounded-full bg-destructive/10 text-destructive">
                  overdue
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filing Pipeline & Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Filing Pipeline */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-card">
          <h3 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-accent" />
            Filing Pipeline
          </h3>
          <div className="space-y-3">
            {projects.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-card-foreground">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{clients.find(c => c.id === p.client_id)?.name}</p>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-semibold uppercase px-2 py-1 rounded-full ${
                    p.lifecycle_stage === 'granted' ? 'bg-success/10 text-success' :
                    p.lifecycle_stage === 'rejected' ? 'bg-destructive/10 text-destructive' :
                    p.lifecycle_stage === 'filing' || p.lifecycle_stage === 'examination' ? 'bg-accent/10 text-accent' :
                    'bg-warning/10 text-warning'
                  }`}>
                    {(p.lifecycle_stage || p.status).replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Graph */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-card">
          <h3 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-accent" />
            Revenue Overview
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Collected</span>
              <span className="font-semibold text-success">${billings.filter(b => b.status === 'paid').reduce((s, b) => s + b.amount, 0).toLocaleString()}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-success h-2 rounded-full" style={{ width: `${totalRevenue > 0 ? (billings.filter(b => b.status === 'paid').reduce((s, b) => s + b.amount, 0) / totalRevenue * 100) : 0}%` }} />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Outstanding</span>
              <span className="font-semibold text-warning">${pendingBillings.toLocaleString()}</span>
            </div>
            <div className="mt-3 space-y-2">
              {billings.slice(0, 4).map(b => (
                <div key={b.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <div>
                    <p className="text-xs font-medium text-card-foreground">{b.description}</p>
                    <p className="text-[10px] text-muted-foreground">{clients.find(c => c.id === b.client_id)?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-card-foreground">${b.amount.toLocaleString()}</p>
                    <span className={`text-[10px] font-semibold uppercase ${
                      b.status === 'paid' ? 'text-success' : b.status === 'overdue' ? 'text-destructive' : 'text-warning'
                    }`}>{b.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Deadlines Timeline */}
      {upcomingDeadlines.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5 shadow-card">
          <h3 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-warning" />
            Upcoming Deadlines (14 days)
          </h3>
          <div className="space-y-2">
            {upcomingDeadlines.slice(0, 6).map(d => (
              <div key={d.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-card-foreground">{d.title}</p>
                  <p className="text-xs text-muted-foreground">{d.type.replace('_', ' ')}</p>
                </div>
                <span className="text-xs font-mono text-muted-foreground">{d.due_date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
