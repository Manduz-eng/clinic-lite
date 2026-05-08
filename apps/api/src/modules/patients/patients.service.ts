import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error-handler';
import { generatePatientNo, getNextSequence } from '../../shared/utils';
import { getPagination, paginatedResult, PaginationQuery } from '../../shared/types';

export class PatientService {
  async create(tenantId: string, data: any) {
    const seq = await getNextSequence(tenantId, 'patient');
    const patientNo = generatePatientNo(seq);

    return prisma.patient.create({
      data: {
        tenantId,
        patientNo,
        ...data,
      },
    });
  }

  async findAll(tenantId: string, query: PaginationQuery) {
    const { page, limit, skip } = getPagination(query);

    const where: any = { tenantId };

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search } },
        { lastName: { contains: query.search } },
        { patientNo: { contains: query.search } },
        { phone: { contains: query.search } },
        { idNumber: { contains: query.search } },
        { nextOfKin: { contains: query.search } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.patient.count({ where }),
    ]);

    return paginatedResult(data, total, page, limit);
  }

  async findById(tenantId: string, id: string) {
    const patient = await prisma.patient.findFirst({
      where: { id, tenantId },
      include: {
        visits: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!patient) throw new AppError(404, 'Patient not found');
    return patient;
  }

  async update(tenantId: string, id: string, data: any) {
    const patient = await prisma.patient.findFirst({ where: { id, tenantId } });
    if (!patient) throw new AppError(404, 'Patient not found');

    return prisma.patient.update({
      where: { id },
      data,
    });
  }

  async delete(tenantId: string, id: string) {
    const patient = await prisma.patient.findFirst({ where: { id, tenantId } });
    if (!patient) throw new AppError(404, 'Patient not found');

    return prisma.patient.delete({ where: { id } });
  }

  async updateStatus(tenantId: string, id: string, isActive: boolean) {
    const patient = await prisma.patient.findFirst({ where: { id, tenantId } });
    if (!patient) throw new AppError(404, 'Patient not found');

    return prisma.patient.update({
      where: { id },
      data: { isActive },
    });
  }
}
