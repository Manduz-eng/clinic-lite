import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error-handler';
import { generatePONumber, generateGRNNumber, getNextSequence } from '../../shared/utils';
import { getPagination, paginatedResult, PaginationQuery } from '../../shared/types';

export class ProcurementService {
  async createSupplier(tenantId: string, data: {
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
    taxPin?: string;
    paymentTerms?: string;
  }) {
    const existing = await prisma.supplier.findUnique({
      where: { tenantId_name: { tenantId, name: data.name } },
    });
    if (existing) throw new AppError(409, 'Supplier already exists');

    return prisma.supplier.create({ data: { tenantId, ...data } });
  }

  async getSuppliers(tenantId: string) {
    return prisma.supplier.findMany({
      where: { tenantId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async updateSupplier(tenantId: string, id: string, data: Record<string, unknown>) {
    const supplier = await prisma.supplier.findFirst({ where: { id, tenantId } });
    if (!supplier) throw new AppError(404, 'Supplier not found');

    return prisma.supplier.update({ where: { id }, data });
  }

  async createPurchaseOrder(tenantId: string, requestedById: string, data: {
    supplierId: string;
    expectedDate?: string;
    notes?: string;
    items: Array<{ drugId: string; quantity: number; unitCost: number }>;
  }) {
    const supplier = await prisma.supplier.findFirst({
      where: { id: data.supplierId, tenantId },
    });
    if (!supplier) throw new AppError(404, 'Supplier not found');

    const seq = await getNextSequence(tenantId, 'purchase_order');
    const poNumber = generatePONumber(seq);

    const totalAmount = data.items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

    return prisma.purchaseOrder.create({
      data: {
        tenantId,
        poNumber,
        supplierId: data.supplierId,
        totalAmount,
        notes: data.notes,
        requestedById,
        orderDate: new Date(),
        expectedDate: data.expectedDate ? new Date(data.expectedDate) : undefined,
        items: {
          create: data.items.map((item) => ({
            drugId: item.drugId,
            quantity: item.quantity,
            unitCost: item.unitCost,
            totalCost: item.quantity * item.unitCost,
          })),
        },
      },
      include: {
        items: { include: { drug: true } },
        supplier: true,
      },
    });
  }

  async getPurchaseOrders(tenantId: string, query: PaginationQuery & { status?: string }) {
    const { page, limit, skip } = getPagination(query);

    const where: Record<string, unknown> = { tenantId };
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where: where as any,
        skip,
        take: limit,
        include: {
          supplier: { select: { name: true } },
          requestedBy: { select: { firstName: true, lastName: true } },
          items: { include: { drug: { select: { name: true, code: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.purchaseOrder.count({ where: where as any }),
    ]);

    return paginatedResult(data, total, page, limit);
  }

  async approvePO(tenantId: string, id: string, approvedById: string, status: string) {
    const po = await prisma.purchaseOrder.findFirst({ where: { id, tenantId } });
    if (!po) throw new AppError(404, 'Purchase order not found');
    if (po.status !== 'submitted' && po.status !== 'draft') {
      throw new AppError(400, 'PO cannot be approved in current status');
    }

    return prisma.purchaseOrder.update({
      where: { id },
      data: { status: status as any, approvedById },
    });
  }

  async createGRN(tenantId: string, receivedById: string, data: {
    purchaseOrderId: string;
    notes?: string;
    items: Array<{
      poItemId: string;
      drugId: string;
      quantity: number;
      batchNumber: string;
      expiryDate: string;
      costPrice: number;
    }>;
  }) {
    const po = await prisma.purchaseOrder.findFirst({
      where: { id: data.purchaseOrderId, tenantId },
      include: { supplier: true },
    });
    if (!po) throw new AppError(404, 'Purchase order not found');

    const seq = await getNextSequence(tenantId, 'grn');
    const grnNumber = generateGRNNumber(seq);

    const result = await prisma.$transaction(async (tx) => {
      const grn = await tx.goodsReceivedNote.create({
        data: {
          tenantId,
          grnNumber,
          purchaseOrderId: data.purchaseOrderId,
          supplierId: po.supplierId,
          receivedById,
          receivedDate: new Date(),
          notes: data.notes,
          items: {
            create: data.items.map((item) => ({
              poItemId: item.poItemId,
              drugId: item.drugId,
              quantity: item.quantity,
              batchNumber: item.batchNumber,
              expiryDate: new Date(item.expiryDate),
              costPrice: item.costPrice,
            })),
          },
        },
        include: { items: true },
      });

      for (const item of data.items) {
        await tx.drugStock.create({
          data: {
            tenantId,
            drugId: item.drugId,
            batchNumber: item.batchNumber,
            quantity: item.quantity,
            costPrice: item.costPrice,
            expiryDate: new Date(item.expiryDate),
            receivedDate: new Date(),
            grnId: grn.id,
          },
        });

        await tx.purchaseOrderItem.update({
          where: { id: item.poItemId },
          data: { receivedQty: { increment: item.quantity } },
        });
      }

      await tx.purchaseOrder.update({
        where: { id: data.purchaseOrderId },
        data: { status: 'received' },
      });

      await tx.ledgerEntry.create({
        data: {
          tenantId,
          entryDate: new Date(),
          entryType: 'expense',
          category: 'procurement',
          description: `GRN ${grnNumber} - ${po.supplier.name}`,
          debit: 0,
          credit: data.items.reduce((sum, item) => sum + item.quantity * item.costPrice, 0),
          balance: 0,
          referenceType: 'grn',
          referenceId: grn.id,
          recordedById: receivedById,
        },
      });

      return grn;
    });

    return result;
  }

  async getGRNs(tenantId: string) {
    return prisma.goodsReceivedNote.findMany({
      where: { tenantId },
      include: {
        purchaseOrder: { select: { poNumber: true } },
        supplier: { select: { name: true } },
        receivedBy: { select: { firstName: true, lastName: true } },
        items: { include: { drug: { select: { name: true, code: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
