import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error-handler';

export class InventoryService {
  async getStockSummary(tenantId: string) {
    const drugs = await prisma.drug.findMany({
      where: { tenantId, isActive: true },
      include: {
        stock: {
          where: { quantity: { gt: 0 } },
          select: { quantity: true, expiryDate: true, batchNumber: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return drugs.map((drug) => {
      const totalStock = drug.stock.reduce((sum, s) => sum + s.quantity, 0);
      const nearestExpiry = drug.stock.length > 0
        ? drug.stock.reduce((min, s) => (s.expiryDate < min ? s.expiryDate : min), drug.stock[0].expiryDate)
        : null;

      return {
        id: drug.id,
        name: drug.name,
        code: drug.code,
        category: drug.category,
        form: drug.form,
        strength: drug.strength,
        unit: drug.unit,
        unitPrice: drug.unitPrice,
        reorderLevel: drug.reorderLevel,
        totalStock,
        nearestExpiry,
        batches: drug.stock,
        isLowStock: totalStock <= drug.reorderLevel,
        isOutOfStock: totalStock === 0,
      };
    });
  }

  async checkAndCreateAlerts(tenantId: string) {
    const drugs = await prisma.drug.findMany({
      where: { tenantId, isActive: true },
      include: {
        stock: {
          where: { quantity: { gt: 0 } },
        },
      },
    });

    const alerts: Array<{
      drugId: string;
      alertType: 'low_stock' | 'out_of_stock' | 'expiring' | 'expired';
      currentStock: number;
      reorderLevel: number;
    }> = [];

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const now = new Date();

    for (const drug of drugs) {
      const totalStock = drug.stock.reduce((sum, s) => sum + s.quantity, 0);

      if (totalStock === 0) {
        alerts.push({
          drugId: drug.id,
          alertType: 'out_of_stock',
          currentStock: 0,
          reorderLevel: drug.reorderLevel,
        });
      } else if (totalStock <= drug.reorderLevel) {
        alerts.push({
          drugId: drug.id,
          alertType: 'low_stock',
          currentStock: totalStock,
          reorderLevel: drug.reorderLevel,
        });
      }

      for (const batch of drug.stock) {
        if (batch.expiryDate <= now) {
          alerts.push({
            drugId: drug.id,
            alertType: 'expired',
            currentStock: batch.quantity,
            reorderLevel: drug.reorderLevel,
          });
        } else if (batch.expiryDate <= thirtyDaysFromNow) {
          alerts.push({
            drugId: drug.id,
            alertType: 'expiring',
            currentStock: batch.quantity,
            reorderLevel: drug.reorderLevel,
          });
        }
      }
    }

    if (alerts.length > 0) {
      await prisma.stockAlert.createMany({
        data: alerts.map((a) => ({ tenantId, ...a })),
        skipDuplicates: true,
      });
    }

    return alerts;
  }

  async getAlerts(tenantId: string, resolved?: boolean) {
    const where: Record<string, unknown> = { tenantId };
    if (resolved !== undefined) where.isResolved = resolved;

    return prisma.stockAlert.findMany({
      where: where as any,
      include: {
        drug: { select: { name: true, code: true, unit: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async resolveAlert(tenantId: string, id: string) {
    const alert = await prisma.stockAlert.findFirst({ where: { id, tenantId } });
    if (!alert) throw new AppError(404, 'Alert not found');

    return prisma.stockAlert.update({
      where: { id },
      data: { isResolved: true, resolvedAt: new Date() },
    });
  }
}
