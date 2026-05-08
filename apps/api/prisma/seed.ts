import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const SYSTEM_ROLES = [
  'Admin', 'Doctor', 'Nurse', 'Lab Technician',
  'Pharmacist', 'Receptionist', 'Accountant', 'Procurement Officer',
];

const MODULES = [
  'reception', 'triage', 'nursing', 'opd', 'laboratory',
  'pharmacy', 'billing', 'procurement', 'inventory', 'accounts', 'admin',
];

const ACTIONS = ['create', 'read', 'update', 'delete', 'approve', 'print'];

const ROLE_PERMISSIONS: Record<string, Record<string, string[]>> = {
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

async function main() {
  console.log('Seeding database...');

  // Create permissions
  for (const module of MODULES) {
    for (const action of ACTIONS) {
      await prisma.permission.upsert({
        where: { module_action: { module, action } },
        update: {},
        create: { module, action, description: `${action} ${module}` },
      });
    }
  }
  const allPermissions = await prisma.permission.findMany();
  console.log(`Created ${allPermissions.length} permissions`);

  // Create demo tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo-clinic' },
    update: {
      name: 'Demo Clinic',
      isActive: true,
    },
    create: {
      name: 'Demo Clinic',
      slug: 'demo-clinic',
      address: '123 Health Street, Nairobi',
      phone: '+254700000000',
      email: 'admin@democlinic.co.ke',
    },
  });
  console.log(`Tenant: ${tenant.name} (${tenant.slug})`);

  // Create roles
  for (const roleName of SYSTEM_ROLES) {
    const role = await prisma.role.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: roleName } },
      update: {},
      create: { tenantId: tenant.id, name: roleName, isSystem: true },
    });

    const rolePerms = ROLE_PERMISSIONS[roleName] || {};
    for (const [module, actions] of Object.entries(rolePerms)) {
      for (const action of actions) {
        const perm = allPermissions.find((p) => p.module === module && p.action === action);
        if (perm) {
          await prisma.rolePermission.upsert({
            where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
            update: {},
            create: { roleId: role.id, permissionId: perm.id },
          });
        }
      }
    }
  }
  console.log('Created roles with permissions');

  // Create admin user
  const adminRole = await prisma.role.findFirst({
    where: { tenantId: tenant.id, name: 'Admin' },
  });

  if (adminRole) {
    const passwordHash = await bcrypt.hash('admin123', 12);
    await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email: 'admin@democlinic.co.ke' } },
      update: {
        passwordHash,
        isActive: true,
      },
      create: {
        tenantId: tenant.id,
        roleId: adminRole.id,
        email: 'admin@democlinic.co.ke',
        passwordHash,
        firstName: 'System',
        lastName: 'Admin',
        phone: '+254700000000',
        employeeNo: 'EMP-001',
      },
    });
    console.log('Created admin user: admin@democlinic.co.ke / admin123');
  }

  // Create demo doctor
  const doctorRole = await prisma.role.findFirst({
    where: { tenantId: tenant.id, name: 'Doctor' },
  });
  if (doctorRole) {
    const passwordHash = await bcrypt.hash('doctor123', 12);
    await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email: 'doctor@democlinic.co.ke' } },
      update: {
        passwordHash,
        isActive: true,
      },
      create: {
        tenantId: tenant.id,
        roleId: doctorRole.id,
        email: 'doctor@democlinic.co.ke',
        passwordHash,
        firstName: 'Jane',
        lastName: 'Mwangi',
        phone: '+254711111111',
        employeeNo: 'EMP-002',
      },
    });
    console.log('Created doctor: doctor@democlinic.co.ke / doctor123');
  }

  // Create expense categories
  const categories = ['Salaries', 'Utilities', 'Rent', 'Medical Supplies', 'Equipment', 'Transport', 'Miscellaneous'];
  for (const name of categories) {
    await prisma.expenseCategory.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name } },
      update: {},
      create: { tenantId: tenant.id, name },
    });
  }
  console.log('Created expense categories');

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
