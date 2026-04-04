import type { Deadline } from '@/types';

const PREFIX = 'prfms_';

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function set(key: string, value: unknown) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

export function getDeadlines(): Deadline[] {
  return get<Deadline[]>('deadlines', []);
}

export function saveDeadlines(deadlines: Deadline[]) {
  set('deadlines', deadlines);
}

export function addDeadline(deadline: Omit<Deadline, 'id' | 'status'>): Deadline {
  const deadlines = getDeadlines();
  const newDeadline: Deadline = {
    ...deadline,
    id: crypto.randomUUID(),
    status: new Date(deadline.due_date) < new Date() ? 'overdue' : 'upcoming',
  };
  deadlines.push(newDeadline);
  saveDeadlines(deadlines);
  return newDeadline;
}

export function refreshDeadlineStatuses() {
  const deadlines = getDeadlines();
  const now = new Date();
  let changed = false;
  deadlines.forEach(d => {
    if (d.status === 'completed') return;
    const due = new Date(d.due_date);
    const newStatus = due < now ? 'overdue' : 'upcoming';
    if (d.status !== newStatus) {
      d.status = newStatus;
      d.escalated = newStatus === 'overdue';
      changed = true;
    }
  });
  if (changed) saveDeadlines(deadlines);
  return deadlines;
}

export function getUpcomingDeadlines(days: number = 7): Deadline[] {
  const deadlines = refreshDeadlineStatuses();
  const cutoff = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return deadlines
    .filter(d => d.status !== 'completed' && new Date(d.due_date) <= cutoff)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
}

export function getOverdueDeadlines(): Deadline[] {
  return refreshDeadlineStatuses().filter(d => d.status === 'overdue');
}

export function completeDeadline(id: string) {
  const deadlines = getDeadlines();
  const idx = deadlines.findIndex(d => d.id === id);
  if (idx >= 0) {
    deadlines[idx].status = 'completed';
    saveDeadlines(deadlines);
  }
}
