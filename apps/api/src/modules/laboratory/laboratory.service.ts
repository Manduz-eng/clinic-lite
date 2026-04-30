import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error-handler';
import { getPagination, paginatedResult, PaginationQuery } from '../../shared/types';

export class LaboratoryService {
  async createTest(tenantId: string, data: {
    name: string;
    code: string;
    category?: string;
    price: number;
    turnaroundTime?: string;
  }) {
    const existing = await prisma.labTestCatalog.findUnique({
      where: { tenantId_code: { tenantId, code: data.code } },
    });
    if (existing) throw new AppError(409, 'Test code already exists');

    return prisma.labTestCatalog.create({
      data: { tenantId, ...data },
    });
  }

  async getTests(tenantId: string) {
    return prisma.labTestCatalog.findMany({
      where: { tenantId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async createRequest(tenantId: string, requestedById: string, data: {
    visitId: string;
    testId: string;
    priority?: 'normal' | 'urgent' | 'stat';
    clinicalInfo?: string;
  }) {
    const visit = await prisma.visit.findFirst({ where: { id: data.visitId, tenantId } });
    if (!visit) throw new AppError(404, 'Visit not found');

    const test = await prisma.labTestCatalog.findFirst({ where: { id: data.testId, tenantId } });
    if (!test) throw new AppError(404, 'Lab test not found');

    return prisma.labRequest.create({
      data: {
        tenantId,
        visitId: data.visitId,
        testId: data.testId,
        requestedById,
        priority: data.priority || 'normal',
        clinicalInfo: data.clinicalInfo,
      },
      include: { test: true },
    });
  }

  async getRequests(tenantId: string, query: PaginationQuery & { status?: string }) {
    const { page, limit, skip } = getPagination(query);

    const where: Record<string, unknown> = { tenantId };
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      prisma.labRequest.findMany({
        where: where as any,
        skip,
        take: limit,
        include: {
          test: true,
          visit: {
            include: {
              patient: { select: { patientNo: true, firstName: true, lastName: true } },
            },
          },
          requestedBy: { select: { firstName: true, lastName: true } },
          result: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.labRequest.count({ where: where as any }),
    ]);

    return paginatedResult(data, total, page, limit);
  }

  async updateRequestStatus(tenantId: string, id: string, status: string) {
    const request = await prisma.labRequest.findFirst({ where: { id, tenantId } });
    if (!request) throw new AppError(404, 'Lab request not found');

    return prisma.labRequest.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async createResult(tenantId: string, performedById: string, data: {
    labRequestId: string;
    resultValue: string;
    unit?: string;
    referenceRange?: string;
    isAbnormal?: boolean;
    notes?: string;
  }) {
    const request = await prisma.labRequest.findFirst({
      where: { id: data.labRequestId, tenantId },
    });
    if (!request) throw new AppError(404, 'Lab request not found');

    const existing = await prisma.labResult.findUnique({
      where: { labRequestId: data.labRequestId },
    });
    if (existing) throw new AppError(409, 'Result already recorded');

    const result = await prisma.$transaction(async (tx) => {
      const labResult = await tx.labResult.create({
        data: {
          tenantId,
          labRequestId: data.labRequestId,
          resultValue: data.resultValue,
          unit: data.unit,
          referenceRange: data.referenceRange,
          isAbnormal: data.isAbnormal || false,
          notes: data.notes,
          performedById,
          resultDate: new Date(),
        },
      });

      await tx.labRequest.update({
        where: { id: data.labRequestId },
        data: { status: 'completed' },
      });

      return labResult;
    });

    return result;
  }

  async getResult(tenantId: string, labRequestId: string) {
    const result = await prisma.labResult.findFirst({
      where: { labRequestId, tenantId },
      include: {
        labRequest: { include: { test: true } },
        performedBy: { select: { firstName: true, lastName: true } },
        verifiedBy: { select: { firstName: true, lastName: true } },
      },
    });
    if (!result) throw new AppError(404, 'Lab result not found');
    return result;
  }
}
