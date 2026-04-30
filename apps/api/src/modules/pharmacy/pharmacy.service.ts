import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error-handler';
import { getPagination, paginatedResult, PaginationQuery } from '../../shared/types';

export class PharmacyService {
  async createDrug(tenantId: string, data: {
    name: string;
    brandName?: string;
    code: string;
    category?: string;
    form?: string;
    strength?: string;
    unit?: string;
    unitPrice: number;
    reorderLevel?: number;
  }) {
    const existing = await prisma.drug.findUnique({
      where: { tenantId_code: { tenantId, code: data.code } },
    });
    if (existing) throw new AppError(409, 'Drug code already exists');

    return prisma.drug.create({ data: { tenantId, ...data } });
  }

  async getDrugs(tenantId: string, query: PaginationQuery) {
    const { page, limit, skip } = getPagination(query);

    const where: Record<string, unknown> = { tenantId, isActive: true };
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { brandName: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.drug.findMany({
        where: where as any,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.drug.count({ where: where as any }),
    ]);

    return paginatedResult(data, total, page, limit);
  }

  async updateDrug(tenantId: string, id: string, data: Record<string, unknown>) {
    const drug = await prisma.drug.findFirst({ where: { id, tenantId } });
    if (!drug) throw new AppError(404, 'Drug not found');

    return prisma.drug.update({ where: { id }, data });
  }

  async addStock(tenantId: string, data: {
    drugId: string;
    batchNumber: string;
    quantity: number;
    costPrice: number;
    expiryDate: string;
    receivedDate?: string;
  }) {
    const drug = await prisma.drug.findFirst({ where: { id: data.drugId, tenantId } });
    if (!drug) throw new AppError(404, 'Drug not found');

    return prisma.drugStock.create({
      data: {
        tenantId,
        drugId: data.drugId,
        batchNumber: data.batchNumber,
        quantity: data.quantity,
        costPrice: data.costPrice,
        expiryDate: new Date(data.expiryDate),
        receivedDate: data.receivedDate ? new Date(data.receivedDate) : new Date(),
      },
    });
  }

  async getStock(tenantId: string, drugId?: string) {
    const where: Record<string, unknown> = { tenantId, quantity: { gt: 0 } };
    if (drugId) where.drugId = drugId;

    return prisma.drugStock.findMany({
      where: where as any,
      include: { drug: { select: { name: true, code: true, unit: true } } },
      orderBy: { expiryDate: 'asc' },
    });
  }

  async dispense(tenantId: string, dispensedById: string, data: {
    prescriptionId: string;
    visitId: string;
    items: Array<{
      prescriptionItemId: string;
      drugStockId: string;
      quantity: number;
    }>;
    notes?: string;
  }) {
    const prescription = await prisma.prescription.findFirst({
      where: { id: data.prescriptionId, tenantId },
    });
    if (!prescription) throw new AppError(404, 'Prescription not found');

    const result = await prisma.$transaction(async (tx) => {
      const dispensing = await tx.dispensing.create({
        data: {
          tenantId,
          prescriptionId: data.prescriptionId,
          visitId: data.visitId,
          dispensedById,
          status: 'dispensed',
          notes: data.notes,
          items: {
            create: data.items.map((item) => ({
              prescriptionItemId: item.prescriptionItemId,
              drugStockId: item.drugStockId,
              quantity: item.quantity,
            })),
          },
        },
        include: { items: true },
      });

      for (const item of data.items) {
        const stock = await tx.drugStock.findUnique({ where: { id: item.drugStockId } });
        if (!stock || stock.quantity < item.quantity) {
          throw new AppError(400, 'Insufficient stock');
        }

        await tx.drugStock.update({
          where: { id: item.drugStockId },
          data: { quantity: { decrement: item.quantity } },
        });
      }

      await tx.prescription.update({
        where: { id: data.prescriptionId },
        data: { status: 'dispensed' },
      });

      await tx.visit.update({
        where: { id: data.visitId },
        data: { status: 'at_pharmacy' },
      });

      return dispensing;
    });

    return result;
  }

  async getDispensingQueue(tenantId: string) {
    return prisma.prescription.findMany({
      where: { tenantId, status: 'pending' },
      include: {
        items: { include: { drug: true } },
        visit: {
          include: {
            patient: { select: { patientNo: true, firstName: true, lastName: true } },
          },
        },
        doctor: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
