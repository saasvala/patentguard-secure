import { ROLE_PERMISSIONS, type PermissionAction } from '@/types';

export function hasModuleAccess(roleName: string, module: string): boolean {
  const perms = ROLE_PERMISSIONS[roleName];
  if (!perms) return false;
  return perms.some(p => p.module === module);
}

export function hasPermission(roleName: string, module: string, action: PermissionAction): boolean {
  const perms = ROLE_PERMISSIONS[roleName];
  if (!perms) return false;
  const modulePerm = perms.find(p => p.module === module);
  if (!modulePerm) return false;
  return modulePerm.actions.includes(action);
}

export function getAccessibleModules(roleName: string): string[] {
  const perms = ROLE_PERMISSIONS[roleName];
  if (!perms) return ['dashboard'];
  return perms.map(p => p.module);
}

export function isReadOnly(roleName: string): boolean {
  return roleName === 'External Auditor';
}
