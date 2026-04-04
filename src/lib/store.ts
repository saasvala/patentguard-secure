import { DEFAULT_ROLES, type User, type Role, type Client, type Project, type PriorArt, type Application, type Case, type Billing, type AuditLog, type Backup, type License } from '@/types';
import { generateHashSync } from '@/lib/security';
import { addDeadline } from '@/lib/deadlines';

const PREFIX = 'prfms_';

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function set(key: string, value: unknown) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

// License
export function getLicense(): License | null {
  return get<License | null>('license', null);
}

export function setLicense(license: License) {
  set('license', license);
}

export function validateLicenseKey(key: string): boolean {
  return /^PRFMS-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(key);
}

export function activateLicense(key: string): License {
  const license: License = {
    id: crypto.randomUUID(),
    key,
    device: navigator.userAgent.slice(0, 50),
    expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    modules: ['all'],
    seats: 25,
  };
  setLicense(license);
  if (getRoles().length === 0) {
    set('roles', DEFAULT_ROLES);
  }
  initDummyData();
  return license;
}

// Auth
export function getCurrentUser(): User | null {
  return get<User | null>('current_user', null);
}

export function setCurrentUser(user: User | null) {
  set('current_user', user);
}

export function isFirstRun(): boolean {
  return get<boolean>('first_run', true);
}

export function setFirstRunComplete() {
  set('first_run', false);
}

// Roles
export function getRoles(): Role[] {
  return get<Role[]>('roles', []);
}

// Users
export function getUsers(): User[] {
  return get<User[]>('users', []);
}

export function saveUsers(users: User[]) {
  set('users', users);
}

export function createUser(user: Omit<User, 'id'>): User {
  const users = getUsers();
  const newUser: User = { ...user, id: crypto.randomUUID() };
  users.push(newUser);
  saveUsers(users);
  addAuditLog(getCurrentUser()?.id || 'system', 'users', `Created user: ${user.username}`);
  return newUser;
}

export function login(username: string, password: string): User | null {
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password && u.status === 'active');
  if (user) {
    setCurrentUser(user);
    addAuditLog(user.id, 'auth', 'Logged in');
  }
  return user || null;
}

export function logout() {
  const user = getCurrentUser();
  if (user) addAuditLog(user.id, 'auth', 'Logged out');
  setCurrentUser(null);
}

export function getUserRole(user: User): Role | undefined {
  return getRoles().find(r => r.id === user.role_id);
}

// Clients
export function getClients(): Client[] {
  return get<Client[]>('clients', []);
}

export function saveClients(clients: Client[]) {
  set('clients', clients);
}

// Projects
export function getProjects(): Project[] {
  return get<Project[]>('projects', []);
}

export function saveProjects(projects: Project[]) {
  set('projects', projects);
}

// Prior Art
export function getPriorArt(): PriorArt[] {
  return get<PriorArt[]>('prior_art', []);
}

export function savePriorArt(items: PriorArt[]) {
  set('prior_art', items);
}

// Applications
export function getApplications(): Application[] {
  return get<Application[]>('applications', []);
}

export function saveApplications(apps: Application[]) {
  set('applications', apps);
}

// Cases
export function getCases(): Case[] {
  return get<Case[]>('cases', []);
}

export function saveCases(cases: Case[]) {
  set('cases', cases);
}

// Billing
export function getBillings(): Billing[] {
  return get<Billing[]>('billings', []);
}

export function saveBillings(billings: Billing[]) {
  set('billings', billings);
}

// Audit (forensic-level)
export function getAuditLogs(): AuditLog[] {
  return get<AuditLog[]>('audit_logs', []);
}

export function addAuditLog(userId: string, module: string, action: string, before?: string, after?: string) {
  const logs = getAuditLogs();
  const entry = { id: crypto.randomUUID(), user_id: userId, module, action, before, after, date: new Date().toISOString() };
  const hashData = `${entry.id}|${entry.user_id}|${entry.module}|${entry.action}|${entry.date}`;
  const log: AuditLog = { ...entry, hash: generateHashSync(hashData) };
  logs.unshift(log);
  set('audit_logs', logs.slice(0, 1000));
}

// Backups
export function getBackups(): Backup[] {
  return get<Backup[]>('backups', []);
}

export function createBackup(): Backup {
  const allData = JSON.stringify(localStorage);
  const backup: Backup = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    size: `${(new Blob([allData]).size / 1024).toFixed(1)} KB`,
    integrity_hash: generateHashSync(allData),
  };
  const backups = getBackups();
  backups.unshift(backup);
  set('backups', backups);
  set(`backup_${backup.id}`, allData);
  addAuditLog(getCurrentUser()?.id || 'system', 'backup', 'Created backup');
  return backup;
}

// Dummy data init
function initDummyData() {
  if (getClients().length > 0) return;

  const clients: Client[] = [
    { id: 'c1', name: 'TechNova Inc.', industry: 'Technology', contact: 'john@technova.com', risk_category: 'low' },
    { id: 'c2', name: 'BioPharm Solutions', industry: 'Pharmaceuticals', contact: 'sarah@biopharm.com', risk_category: 'medium' },
    { id: 'c3', name: 'GreenEnergy Corp', industry: 'Energy', contact: 'mike@greenenergy.com', risk_category: 'low' },
    { id: 'c4', name: 'AutoDrive Systems', industry: 'Automotive', contact: 'lisa@autodrive.com', risk_category: 'high' },
    { id: 'c5', name: 'MedDevice Labs', industry: 'Medical Devices', contact: 'raj@meddevice.com', risk_category: 'medium' },
  ];
  saveClients(clients);

  const projects: Project[] = [
    { id: 'p1', client_id: 'c1', title: 'AI-Based Image Recognition Patent', status: 'active', lifecycle_stage: 'drafting', version: 1, created_by: 'system', created_at: '2025-01-15' },
    { id: 'p2', client_id: 'c2', title: 'Novel Drug Delivery Mechanism', status: 'active', lifecycle_stage: 'research', version: 1, created_by: 'system', created_at: '2025-02-01' },
    { id: 'p3', client_id: 'c3', title: 'Solar Panel Efficiency Patent', status: 'completed', lifecycle_stage: 'granted', version: 3, created_by: 'system', created_at: '2024-11-20' },
    { id: 'p4', client_id: 'c4', title: 'Autonomous Braking System', status: 'on-hold', lifecycle_stage: 'examination', version: 2, created_by: 'system', created_at: '2025-01-08' },
    { id: 'p5', client_id: 'c5', title: 'Wearable Health Monitor', status: 'draft', lifecycle_stage: 'idea', version: 1, created_by: 'system', created_at: '2025-02-10' },
  ];
  saveProjects(projects);

  savePriorArt([
    { id: 'pa1', project_id: 'p1', reference: 'US20210034901A1', summary: 'CNN-based image classification method', novelty_score: 72, duplicate_risk: false },
    { id: 'pa2', project_id: 'p1', reference: 'EP3425523B1', summary: 'Deep learning feature extraction', novelty_score: 45, duplicate_risk: true },
    { id: 'pa3', project_id: 'p2', reference: 'WO2020089012A1', summary: 'Liposomal drug delivery system', novelty_score: 88, duplicate_risk: false },
  ]);

  saveApplications([
    { id: 'a1', project_id: 'p1', filing_no: 'US2025/001234', status: 'pending', country: 'US', deadline: '2025-06-15' },
    { id: 'a2', project_id: 'p3', filing_no: 'US2024/009876', status: 'granted', country: 'US' },
    { id: 'a3', project_id: 'p2', filing_no: 'EP2025/005678', status: 'filed', country: 'EP', deadline: '2025-08-01' },
  ]);

  saveCases([
    { id: 'cs1', project_id: 'p1', stage: 'Prior Art Search', date: '2025-01-20', outcome_probability: 85 },
    { id: 'cs2', project_id: 'p1', stage: 'Drafting', date: '2025-02-01', outcome_probability: 78 },
    { id: 'cs3', project_id: 'p3', stage: 'Granted', date: '2024-12-15', outcome_probability: 100 },
  ]);

  saveBillings([
    { id: 'b1', client_id: 'c1', amount: 15000, tax_rate: 18, date: '2025-01-30', description: 'Patent search & analysis', status: 'paid' },
    { id: 'b2', client_id: 'c2', amount: 22000, tax_rate: 18, date: '2025-02-05', description: 'Application drafting', status: 'pending' },
    { id: 'b3', client_id: 'c3', amount: 8500, tax_rate: 18, date: '2024-12-20', description: 'Filing fees', status: 'paid' },
    { id: 'b4', client_id: 'c4', amount: 12000, tax_rate: 18, date: '2025-01-15', description: 'Prior art analysis', status: 'overdue' },
  ]);

  // Init deadlines
  const { addDeadline } = require('@/lib/deadlines');
  addDeadline({ project_id: 'p1', type: 'filing', title: 'US Patent Filing Deadline', due_date: '2025-06-15' });
  addDeadline({ project_id: 'p2', type: 'objection_response', title: 'EP Objection Response', due_date: '2025-05-01' });
  addDeadline({ project_id: 'p4', type: 'renewal', title: 'Patent Renewal Due', due_date: '2025-04-20' });
}
