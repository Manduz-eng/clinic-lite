export const SYSTEM_ROLES = [
  'Admin',
  'Doctor',
  'Nurse',
  'Lab Technician',
  'Pharmacist',
  'Receptionist',
  'Accountant',
  'Procurement Officer',
] as const;

export type SystemRole = (typeof SYSTEM_ROLES)[number];

export const MODULES = [
  'reception',
  'triage',
  'nursing',
  'opd',
  'laboratory',
  'pharmacy',
  'billing',
  'procurement',
  'inventory',
  'accounts',
  'admin',
] as const;

export const ACTIONS = ['create', 'read', 'update', 'delete', 'approve', 'print'] as const;

export const ROLE_PERMISSIONS: Record<string, Record<string, string[]>> = {
  Admin: {
    reception: ['create', 'read', 'update', 'delete', 'print'],
    triage: ['create', 'read', 'update', 'delete', 'print'],
    nursing: ['create', 'read', 'update', 'delete', 'print'],
    opd: ['create', 'read', 'update', 'delete', 'print'],
    laboratory: ['create', 'read', 'update', 'delete', 'approve', 'print'],
    pharmacy: ['create', 'read', 'update', 'delete', 'print'],
    billing: ['create', 'read', 'update', 'delete', 'approve', 'print'],
    procurement: ['create', 'read', 'update', 'delete', 'approve', 'print'],
    inventory: ['create', 'read', 'update', 'delete', 'print'],
    accounts: ['create', 'read', 'update', 'delete', 'approve', 'print'],
    admin: ['create', 'read', 'update', 'delete'],
  },
  Doctor: {
    reception: ['read'],
    triage: ['read'],
    nursing: ['read'],
    opd: ['create', 'read', 'update', 'print'],
    laboratory: ['create', 'read', 'print'],
    pharmacy: ['read'],
    billing: ['read'],
  },
  Nurse: {
    reception: ['read'],
    triage: ['create', 'read', 'update', 'print'],
    nursing: ['create', 'read', 'update', 'print'],
    opd: ['read'],
    laboratory: ['read'],
  },
  'Lab Technician': {
    reception: ['read'],
    opd: ['read'],
    laboratory: ['create', 'read', 'update', 'print'],
  },
  Pharmacist: {
    reception: ['read'],
    opd: ['read'],
    pharmacy: ['create', 'read', 'update', 'print'],
    billing: ['read'],
  },
  Receptionist: {
    reception: ['create', 'read', 'update', 'print'],
    triage: ['read'],
    billing: ['create', 'read', 'update', 'print'],
  },
  Accountant: {
    billing: ['create', 'read', 'update', 'approve', 'print'],
    procurement: ['read'],
    accounts: ['create', 'read', 'update', 'approve', 'print'],
  },
  'Procurement Officer': {
    pharmacy: ['read'],
    procurement: ['create', 'read', 'update', 'print'],
    inventory: ['create', 'read', 'update', 'print'],
  },
};
