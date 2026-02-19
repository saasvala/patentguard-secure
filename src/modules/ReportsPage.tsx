import { useState } from 'react';
import { getProjects, getClients, getBillings, getApplications, getCases, getAuditLogs } from '@/lib/store';
import { exportToCSV } from '@/lib/csv-export';
import { Download, FileText, Filter } from 'lucide-react';

type ReportType = 'projects' | 'clients' | 'billing' | 'applications' | 'cases' | 'audit';

export default function ReportsPage() {
  const projects = getProjects();
  const clients = getClients();
  const billings = getBillings();
  const applications = getApplications();
  const cases = getCases();
  const auditLogs = getAuditLogs();

  const [selectedReport, setSelectedReport] = useState<ReportType>('projects');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const totalRevenue = billings.reduce((s, b) => s + b.amount, 0);
  const paidRevenue = billings.filter(b => b.status === 'paid').reduce((s, b) => s + b.amount, 0);

  const handleExportCSV = () => {
    const dataMap: Record<ReportType, { data: Record<string, unknown>[]; name: string }> = {
      projects: { data: projects, name: 'projects_report' },
      clients: { data: clients, name: 'clients_report' },
      billing: { data: billings, name: 'billing_report' },
      applications: { data: applications, name: 'applications_report' },
      cases: { data: cases, name: 'cases_report' },
      audit: { data: auditLogs, name: 'audit_report' },
    };

    let { data, name } = dataMap[selectedReport];

    // Apply date filter if set
    if (dateFrom || dateTo) {
      data = data.filter((row: any) => {
        const dateField = row.date || row.created_at;
        if (!dateField) return true;
        const d = dateField.split('T')[0];
        if (dateFrom && d < dateFrom) return false;
        if (dateTo && d > dateTo) return false;
        return true;
      });
    }

    if (data.length === 0) {
      alert('No data to export for the selected filters.');
      return;
    }

    exportToCSV(data, name);
  };

  const reportOptions: { value: ReportType; label: string }[] = [
    { value: 'projects', label: 'Projects' },
    { value: 'clients', label: 'Clients' },
    { value: 'billing', label: 'Billing' },
    { value: 'applications', label: 'Applications' },
    { value: 'cases', label: 'Cases' },
    { value: 'audit', label: 'Audit Logs' },
  ];

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports & Export</h1>
          <p className="text-sm text-muted-foreground">System analytics and data export</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 shadow-card">
          <h3 className="text-xs font-semibold text-muted-foreground mb-1">Total Projects</h3>
          <p className="text-2xl font-bold text-foreground">{projects.length}</p>
          <p className="text-xs text-success mt-1">{projects.filter(p => p.status === 'active').length} active</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 shadow-card">
          <h3 className="text-xs font-semibold text-muted-foreground mb-1">Total Revenue</h3>
          <p className="text-2xl font-bold text-foreground">${totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-success mt-1">${paidRevenue.toLocaleString()} collected</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 shadow-card">
          <h3 className="text-xs font-semibold text-muted-foreground mb-1">Applications</h3>
          <p className="text-2xl font-bold text-foreground">{applications.length}</p>
          <p className="text-xs text-success mt-1">{applications.filter(a => a.status === 'granted').length} granted</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 shadow-card">
          <h3 className="text-xs font-semibold text-muted-foreground mb-1">Clients</h3>
          <p className="text-2xl font-bold text-foreground">{clients.length}</p>
          <p className="text-xs text-muted-foreground mt-1">{cases.length} active cases</p>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-card rounded-xl border border-border p-5 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-card-foreground">Export Data</h3>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Report Type</label>
            <select
              value={selectedReport}
              onChange={e => setSelectedReport(e.target.value as ReportType)}
              className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            >
              {reportOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 gradient-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}
