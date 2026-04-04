import type { FailedLogin } from '@/types';

const PREFIX = 'prfms_';
const MAX_ATTEMPTS = 3;
const LOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function set(key: string, value: unknown) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

// Failed login tracking
export function getFailedLogins(): Record<string, FailedLogin> {
  return get<Record<string, FailedLogin>>('failed_logins', {});
}

export function recordFailedLogin(username: string): { locked: boolean; remainingAttempts: number } {
  const logins = getFailedLogins();
  const entry = logins[username] || { username, attempts: 0, last_attempt: '' };
  
  // Check if lock expired
  if (entry.locked_until && new Date(entry.locked_until) < new Date()) {
    entry.attempts = 0;
    entry.locked_until = undefined;
  }

  entry.attempts += 1;
  entry.last_attempt = new Date().toISOString();

  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.locked_until = new Date(Date.now() + LOCK_DURATION_MS).toISOString();
  }

  logins[username] = entry;
  set('failed_logins', logins);

  return {
    locked: entry.attempts >= MAX_ATTEMPTS,
    remainingAttempts: Math.max(0, MAX_ATTEMPTS - entry.attempts),
  };
}

export function clearFailedLogins(username: string) {
  const logins = getFailedLogins();
  delete logins[username];
  set('failed_logins', logins);
}

export function isAccountLocked(username: string): boolean {
  const logins = getFailedLogins();
  const entry = logins[username];
  if (!entry?.locked_until) return false;
  if (new Date(entry.locked_until) < new Date()) {
    clearFailedLogins(username);
    return false;
  }
  return true;
}

export function getLockRemainingTime(username: string): number {
  const logins = getFailedLogins();
  const entry = logins[username];
  if (!entry?.locked_until) return 0;
  return Math.max(0, new Date(entry.locked_until).getTime() - Date.now());
}

// Session management
export function updateSessionActivity() {
  set('last_activity', Date.now());
}

export function isSessionExpired(): boolean {
  const lastActivity = get<number>('last_activity', 0);
  if (lastActivity === 0) return false;
  return Date.now() - lastActivity > SESSION_TIMEOUT_MS;
}

// Hash generation for audit integrity
export async function generateHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateHashSync(data: string): string {
  // Simple sync hash for audit log integrity
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}
