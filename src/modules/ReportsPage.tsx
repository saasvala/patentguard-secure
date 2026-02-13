import { getProjects, getClients, getBillings, getApplications } from '@/lib/store';

export default function ReportsPage() {
  const projects = getProjects();
  const clients = getClients();
  const billings = getBillings();
  const applications = getApplications();

  const totalRevenue = billings.reduce((s, b) => s + b.amount, 0);
  const paidRevenue = billings.filter(b => b.status === 'paid').reduce((s, b) => s + b.amount, 0);

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports & Export</h1>
        <p className="text-sm text-muted-foreground">System analytics and data export</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 shadow-card">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Project Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Total Projects</span><span className="font-semibold text-foreground">{projects.length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Active</span><span className="font-semibold text-success">{projects.filter(p => p.status === 'active').length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Completed</span><span className="font-semibold text-accent">{projects.filter(p => p.status === 'completed').length}</span></div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 shadow-card">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Financial Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Total Revenue</span><span className="font-semibold text-foreground">${totalRevenue.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Collected</span><span className="font-semibold text-success">${paidRevenue.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Outstanding</span><span className="font-semibold text-warning">${(totalRevenue - paidRevenue).toLocaleString()}</span></div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 shadow-card">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Applications</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Total Filed</span><span className="font-semibold text-foreground">{applications.length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Granted</span><span className="font-semibold text-success">{applications.filter(a => a.status === 'granted').length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Pending</span><span className="font-semibold text-warning">{applications.filter(a => a.status === 'pending').length}</span></div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 shadow-card">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Client Overview</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Total Clients</span><span className="font-semibold text-foreground">{clients.length}</span></div>
            {clients.slice(0, 3).map(c => (
              <div key={c.id} className="flex justify-between"><span className="text-muted-foreground">{c.name}</span><span className="text-xs text-accent">{c.industry}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
