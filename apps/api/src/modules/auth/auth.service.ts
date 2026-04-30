import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { AppError } from '../../middleware/error-handler';
import { JwtPayload } from '../../middleware/auth';
import { SYSTEM_ROLES, ROLE_PERMISSIONS, MODULES, ACTIONS } from '../../shared/constants';

export class AuthService {
  async registerTenant(data: {
    tenantName: string;
    tenantSlug: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) {
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug: data.tenantSlug },
    });

    if (existingTenant) {
      throw new AppError(409, 'Tenant slug already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: data.tenantName,
          slug: data.tenantSlug,
        },
      });

      // Create all permissions
      const permissions = [];
      for (const module of MODULES) {
        for (const action of ACTIONS) {
          permissions.push({ module, action, description: `${action} ${module}` });
        }
      }

      await tx.permission.createMany({
        data: permissions,
        skipDuplicates: true,
      });

      const allPermissions = await tx.permission.findMany();

      // Create system roles with permissions
      for (const roleName of SYSTEM_ROLES) {
        const role = await tx.role.create({
          data: {
            tenantId: tenant.id,
            name: roleName,
            isSystem: true,
          },
        });

        const rolePerms = ROLE_PERMISSIONS[roleName] || {};
        const permissionLinks: { roleId: string; permissionId: string }[] = [];

        for (const [module, actions] of Object.entries(rolePerms)) {
          for (const action of actions) {
            const perm = allPermissions.find(
              (p) => p.module === module && p.action === action
            );
            if (perm) {
              permissionLinks.push({ roleId: role.id, permissionId: perm.id });
            }
          }
        }

        if (permissionLinks.length > 0) {
          await tx.rolePermission.createMany({ data: permissionLinks });
        }
      }

      const adminRole = await tx.role.findFirst({
        where: { tenantId: tenant.id, name: 'Admin' },
      });

      if (!adminRole) throw new AppError(500, 'Failed to create admin role');

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          roleId: adminRole.id,
          email: data.email,
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
        },
      });

      return { tenant, user };
    });

    const tokens = this.generateTokens({
      userId: result.user.id,
      tenantId: result.tenant.id,
      roleId: result.user.roleId,
      roleName: 'Admin',
      email: result.user.email,
    });

    await prisma.user.update({
      where: { id: result.user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    return {
      tenant: { id: result.tenant.id, name: result.tenant.name, slug: result.tenant.slug },
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
      },
      ...tokens,
    };
  }

  async login(data: { email: string; password: string; tenantSlug: string }) {
    const tenant = await prisma.tenant.findUnique({
      where: { slug: data.tenantSlug },
    });

    if (!tenant || !tenant.isActive) {
      throw new AppError(401, 'Invalid credentials');
    }

    const user = await prisma.user.findUnique({
      where: { tenantId_email: { tenantId: tenant.id, email: data.email } },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      throw new AppError(401, 'Invalid credentials');
    }

    const validPassword = await bcrypt.compare(data.password, user.passwordHash);
    if (!validPassword) {
      throw new AppError(401, 'Invalid credentials');
    }

    const tokens = this.generateTokens({
      userId: user.id,
      tenantId: tenant.id,
      roleId: user.roleId,
      roleName: user.role.name,
      email: user.email,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken, lastLogin: new Date() },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name,
      },
      tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug },
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as JwtPayload;

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { role: true },
      });

      if (!user || user.refreshToken !== refreshToken || !user.isActive) {
        throw new AppError(401, 'Invalid refresh token');
      }

      const tokens = this.generateTokens({
        userId: user.id,
        tenantId: user.tenantId,
        roleId: user.roleId,
        roleName: user.role.name,
        email: user.email,
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken },
      });

      return tokens;
    } catch {
      throw new AppError(401, 'Invalid refresh token');
    }
  }

  async createUser(tenantId: string, data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    employeeNo?: string;
    roleId: string;
  }) {
    const existing = await prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email: data.email } },
    });

    if (existing) {
      throw new AppError(409, 'Email already registered in this clinic');
    }

    const role = await prisma.role.findFirst({
      where: { id: data.roleId, tenantId },
    });

    if (!role) {
      throw new AppError(404, 'Role not found');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        tenantId,
        roleId: data.roleId,
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        employeeNo: data.employeeNo,
      },
      include: { role: true },
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.name,
      employeeNo: user.employeeNo,
    };
  }

  async getUsers(tenantId: string) {
    return prisma.user.findMany({
      where: { tenantId },
      include: { role: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRoles(tenantId: string) {
    return prisma.role.findMany({
      where: { tenantId },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
  }

  private generateTokens(payload: JwtPayload) {
    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as string & { __brand: 'StringValue' },
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as string & { __brand: 'StringValue' },
    } as jwt.SignOptions);

    return { accessToken, refreshToken };
  }
}
