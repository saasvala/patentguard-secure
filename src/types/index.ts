// Types for the Patent Research Firm Management System

export type Role = {
  id: string;
  name: string;
};

export const DEFAULT_ROLES: Role[] = [
  { id: 'r1', name: 'Super Admin' },
  { id: 'r2', name: 'Patent Attorney' },
  { id: 'r3', name: 'Senior Analyst' },
  { id: 'r4', name: 'Research Analyst' },
  { id: 'r5', name: 'Legal Associate' },
  { id: 'r6', name: 'Client Manager' },
  { id: 'r7', name: 'Finance Manager' },
  { id: 'r8', name: 'Compliance Officer' },
  { id: 'r9', name: 'External Auditor' },
];

export type User = {
  id: string;
  role_id: string;
  username: string;
  password: string;
  status: 'active' | 'inactive';
};

export type License = {
  id: string;
  key: string;
  device: string;
  expiry: string;
  modules: string[];
  seats: number;
};

export type Client = {
  id: string;
  name: string;
  industry: string;
  contact: string;
  risk_category?: 'low' | 'medium' | 'high';
  archived?: boolean;
};

export type PatentLifecycleStage = 
  | 'idea' | 'research' | 'drafting' | 'filing' 
  | 'examination' | 'objection' | 'granted' | 'rejected';

export type Project = {
  id: string;
  client_id: string;
  title: string;
  status: 'active' | 'completed' | 'on-hold' | 'draft';
  lifecycle_stage: PatentLifecycleStage;
  created_by: string;
  created_at: string;
  archived?: boolean;
  version: number;
  history?: ProjectHistoryEntry[];
};

export type ProjectHistoryEntry = {
  timestamp: string;
  user_id: string;
  field: string;
  old_value: string;
  new_value: string;
};

export type PriorArt = {
  id: string;
  project_id: string;
  reference: string;
  summary: string;
  novelty_score?: number;
  duplicate_risk?: boolean;
  archived?: boolean;
};

export type Application = {
  id: string;
  project_id: string;
  filing_no: string;
  status: 'filed' | 'pending' | 'granted' | 'rejected';
  country?: string;
  deadline?: string;
  archived?: boolean;
};

export type Case = {
  id: string;
  project_id: string;
  stage: string;
  date: string;
  hearing_notes?: string;
  outcome_probability?: number;
  archived?: boolean;
};

export type Billing = {
  id: string;
  client_id: string;
  amount: number;
  tax_rate?: number;
  date: string;
  description: string;
  status: 'paid' | 'pending' | 'overdue';
  archived?: boolean;
};

export type AuditLog = {
  id: string;
  user_id: string;
  module: string;
  action: string;
  before?: string;
  after?: string;
  hash: string;
  date: string;
};

export type Backup = {
  id: string;
  date: string;
  size: string;
  integrity_hash?: string;
};

export type Deadline = {
  id: string;
  project_id: string;
  type: 'filing' | 'renewal' | 'objection_response' | 'hearing' | 'custom';
  title: string;
  due_date: string;
  status: 'upcoming' | 'overdue' | 'completed';
  escalated?: boolean;
};

export type FailedLogin = {
  username: string;
  attempts: number;
  locked_until?: string;
  last_attempt: string;
};

// RBAC Permission Levels
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'export';

export type ModulePermission = {
  module: string;
  actions: PermissionAction[];
};

export const ROLE_PERMISSIONS: Record<string, ModulePermission[]> = {
  'Super Admin': [
    { module: 'dashboard', actions: ['read'] },
    { module: 'projects', actions: ['create', 'read', 'update', 'delete', 'export'] },
    { module: 'prior_art', actions: ['create', 'read', 'update', 'delete', 'export'] },
    { module: 'applications', actions: ['create', 'read', 'update', 'delete', 'export'] },
    { module: 'clients', actions: ['create', 'read', 'update', 'delete', 'export'] },
    { module: 'cases', actions: ['create', 'read', 'update', 'delete', 'export'] },
    { module: 'billing', actions: ['create', 'read', 'update', 'delete', 'export'] },
    { module: 'reports', actions: ['read', 'export'] },
    { module: 'audit', actions: ['read', 'export'] },
    { module: 'backup', actions: ['create', 'read'] },
    { module: 'users', actions: ['create', 'read', 'update', 'delete'] },
    { module: 'deadlines', actions: ['create', 'read', 'update', 'delete'] },
  ],
  'Patent Attorney': [
    { module: 'dashboard', actions: ['read'] },
    { module: 'projects', actions: ['create', 'read', 'update', 'export'] },
    { module: 'prior_art', actions: ['create', 'read', 'update', 'export'] },
    { module: 'applications', actions: ['create', 'read', 'update', 'export'] },
    { module: 'clients', actions: ['read'] },
    { module: 'cases', actions: ['create', 'read', 'update', 'export'] },
    { module: 'reports', actions: ['read', 'export'] },
    { module: 'deadlines', actions: ['create', 'read', 'update'] },
  ],
  'Senior Analyst': [
    { module: 'dashboard', actions: ['read'] },
    { module: 'projects', actions: ['create', 'read', 'update'] },
    { module: 'prior_art', actions: ['create', 'read', 'update'] },
    { module: 'applications', actions: ['read', 'update'] },
    { module: 'cases', actions: ['read', 'update'] },
    { module: 'deadlines', actions: ['read'] },
  ],
  'Research Analyst': [
    { module: 'dashboard', actions: ['read'] },
    { module: 'projects', actions: ['read'] },
    { module: 'prior_art', actions: ['create', 'read', 'update'] },
  ],
  'Legal Associate': [
    { module: 'dashboard', actions: ['read'] },
    { module: 'projects', actions: ['read'] },
    { module: 'applications', actions: ['read', 'update'] },
    { module: 'cases', actions: ['create', 'read', 'update'] },
    { module: 'deadlines', actions: ['read'] },
  ],
  'Client Manager': [
    { module: 'dashboard', actions: ['read'] },
    { module: 'clients', actions: ['create', 'read', 'update'] },
    { module: 'billing', actions: ['create', 'read', 'update', 'export'] },
    { module: 'reports', actions: ['read', 'export'] },
  ],
  'Finance Manager': [
    { module: 'dashboard', actions: ['read'] },
    { module: 'billing', actions: ['create', 'read', 'update', 'export'] },
    { module: 'reports', actions: ['read', 'export'] },
  ],
  'Compliance Officer': [
    { module: 'dashboard', actions: ['read'] },
    { module: 'projects', actions: ['read'] },
    { module: 'applications', actions: ['read'] },
    { module: 'cases', actions: ['read'] },
    { module: 'audit', actions: ['read', 'export'] },
    { module: 'reports', actions: ['read', 'export'] },
    { module: 'deadlines', actions: ['read'] },
  ],
  'External Auditor': [
    { module: 'dashboard', actions: ['read'] },
    { module: 'projects', actions: ['read'] },
    { module: 'prior_art', actions: ['read'] },
    { module: 'applications', actions: ['read'] },
    { module: 'clients', actions: ['read'] },
    { module: 'cases', actions: ['read'] },
    { module: 'billing', actions: ['read'] },
    { module: 'reports', actions: ['read'] },
    { module: 'audit', actions: ['read'] },
  ],
};
