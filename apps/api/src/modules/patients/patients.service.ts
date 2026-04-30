import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error-handler';
import { generatePatientNo, getNextSequence } from '../../shared/utils';
import { getPagination, paginatedResult, PaginationQuery } from '../../shared/types';

export class PatientService {
  async create(tenantId: string, data: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: 'male' | 'female' | 'other';
    nationalId?: string;
    phone?: string;
    email?: string;
    address?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    bloodGroup?: string;
    allergies?: string;
    insuranceProvider?: string;
    insuranceNo?: string;
  }) {
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

    const where: Record<string, unknown> = { tenantId };

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { patientNo: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search } },
        { nationalId: { contains: query.search } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.patient.findMany({
        where: where as any,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.patient.count({ where: where as any }),
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

  async update(tenantId: string, id: string, data: Record<string, unknown>) {
    const patient = await prisma.patient.findFirst({ where: { id, tenantId } });
    if (!patient) throw new AppError(404, 'Patient not found');

    return prisma.patient.update({
      where: { id },
      data,
    });
  }
}
