import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error-handler';
import { generateVisitNo, getNextQueueNumber } from '../../shared/utils';
import { getPagination, paginatedResult, PaginationQuery } from '../../shared/types';

export class VisitService {
  async create(tenantId: string, registeredById: string, data: {
    patientId: string;
    visitType?: 'new_visit' | 'follow_up' | 'emergency';
    priority?: 'normal' | 'urgent' | 'emergency';
    chiefComplaint?: string;
    assignedDoctorId?: string;
  }) {
    const patient = await prisma.patient.findFirst({
      where: { id: data.patientId, tenantId },
    });
    if (!patient) throw new AppError(404, 'Patient not found');

    const queueNumber = await getNextQueueNumber(tenantId);
    const visitNo = generateVisitNo(queueNumber);

    return prisma.visit.create({
      data: {
        tenantId,
        patientId: data.patientId,
        visitNo,
        visitDate: new Date(),
        visitType: data.visitType || 'new_visit',
        queueNumber,
        priority: data.priority || 'normal',
        chiefComplaint: data.chiefComplaint,
        registeredById,
        assignedDoctorId: data.assignedDoctorId,
      },
      include: { patient: true },
    });
  }

  async findAll(tenantId: string, query: PaginationQuery & { status?: string; date?: string }) {
    const { page, limit, skip } = getPagination(query);

    const where: Record<string, unknown> = { tenantId };
    if (query.status) where.status = query.status;
    if (query.date) {
      const date = new Date(query.date);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      where.visitDate = { gte: date, lt: nextDate };
    }

    const [data, total] = await Promise.all([
      prisma.visit.findMany({
        where: where as any,
        skip,
        take: limit,
        include: {
          patient: { select: { id: true, patientNo: true, firstName: true, lastName: true } },
          assignedDoctor: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: [{ priority: 'desc' }, { queueNumber: 'asc' }],
      }),
      prisma.visit.count({ where: where as any }),
    ]);

    return paginatedResult(data, total, page, limit);
  }

  async findById(tenantId: string, id: string) {
    const visit = await prisma.visit.findFirst({
      where: { id, tenantId },
      include: {
        patient: true,
        vitals: true,
        nursingNotes: true,
        clinicalNote: true,
        diagnoses: true,
        prescriptions: { include: { items: { include: { drug: true } } } },
        labRequests: { include: { test: true, result: true } },
        dispensing: { include: { items: true } },
        invoices: true,
      },
    });

    if (!visit) throw new AppError(404, 'Visit not found');
    return visit;
  }

  async updateStatus(tenantId: string, id: string, status: string) {
    const visit = await prisma.visit.findFirst({ where: { id, tenantId } });
    if (!visit) throw new AppError(404, 'Visit not found');

    return prisma.visit.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async getQueue(tenantId: string, status?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const where: Record<string, unknown> = {
      tenantId,
      visitDate: { gte: today, lt: tomorrow },
    };
    if (status) where.status = status;

    return prisma.visit.findMany({
      where: where as any,
      include: {
        patient: { select: { id: true, patientNo: true, firstName: true, lastName: true, gender: true, dateOfBirth: true } },
        assignedDoctor: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: [{ priority: 'desc' }, { queueNumber: 'asc' }],
    });
  }
}
