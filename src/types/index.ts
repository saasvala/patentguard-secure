// Types for the Patent Research Firm Management System

export type Role = {
  id: string;
  name: string;
};

export const DEFAULT_ROLES: Role[] = [
  { id: 'r1', name: 'Super Admin' },
  { id: 'r2', name: 'Patent Director' },
  { id: 'r3', name: 'Senior Patent Analyst' },
  { id: 'r4', name: 'Patent Research Analyst' },
  { id: 'r5', name: 'Legal Advisor' },
  { id: 'r6', name: 'Client Manager' },
  { id: 'r7', name: 'Documentation Officer' },
  { id: 'r8', name: 'Finance Officer' },
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
};

export type Project = {
  id: string;
  client_id: string;
  title: string;
  status: 'active' | 'completed' | 'on-hold' | 'draft';
  created_by: string;
  created_at: string;
};

export type PriorArt = {
  id: string;
  project_id: string;
  reference: string;
  summary: string;
};

export type Application = {
  id: string;
  project_id: string;
  filing_no: string;
  status: 'filed' | 'pending' | 'granted' | 'rejected';
};

export type Case = {
  id: string;
  project_id: string;
  stage: string;
  date: string;
};

export type Billing = {
  id: string;
  client_id: string;
  amount: number;
  date: string;
  description: string;
  status: 'paid' | 'pending' | 'overdue';
};

export type AuditLog = {
  id: string;
  user_id: string;
  action: string;
  date: string;
};

export type Backup = {
  id: string;
  date: string;
  size: string;
};
