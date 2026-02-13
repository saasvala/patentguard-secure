import { getClients } from '@/lib/store';

export default function ClientsPage() {
  const clients = getClients();

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Client Management</h1>
        <p className="text-sm text-muted-foreground">{clients.length} clients</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map(c => (
          <div key={c.id} className="bg-card rounded-xl border border-border p-5 shadow-card hover:shadow-elevated transition-shadow">
            <h3 className="text-sm font-bold text-card-foreground mb-1">{c.name}</h3>
            <p className="text-xs text-muted-foreground mb-3">{c.industry}</p>
            <p className="text-xs text-accent">{c.contact}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
