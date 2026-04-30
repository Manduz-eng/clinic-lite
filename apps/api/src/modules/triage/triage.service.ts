import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error-handler';
import { calculateBMI } from '../../shared/utils';

export class TriageService {
  async create(tenantId: string, recordedById: string, data: {
    visitId: string;
    systolicBp?: number;
    diastolicBp?: number;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
    notes?: string;
  }) {
    const visit = await prisma.visit.findFirst({
      where: { id: data.visitId, tenantId },
    });
    if (!visit) throw new AppError(404, 'Visit not found');

    const existing = await prisma.vitals.findUnique({
      where: { visitId: data.visitId },
    });
    if (existing) throw new AppError(409, 'Vitals already recorded for this visit');

    const bmi = data.weight && data.height ? calculateBMI(data.weight, data.height) : undefined;

    const vitals = await prisma.vitals.create({
      data: {
        tenantId,
        visitId: data.visitId,
        systolicBp: data.systolicBp,
        diastolicBp: data.diastolicBp,
        heartRate: data.heartRate,
        temperature: data.temperature,
        weight: data.weight,
        height: data.height,
        bmi,
        respiratoryRate: data.respiratoryRate,
        oxygenSaturation: data.oxygenSaturation,
        notes: data.notes,
        recordedById,
      },
    });

    await prisma.visit.update({
      where: { id: data.visitId },
      data: { status: 'in_triage' },
    });

    return vitals;
  }

  async findByVisit(tenantId: string, visitId: string) {
    const vitals = await prisma.vitals.findFirst({
      where: { visitId, tenantId },
      include: {
        recordedBy: { select: { firstName: true, lastName: true } },
      },
    });
    if (!vitals) throw new AppError(404, 'Vitals not found');
    return vitals;
  }

  async update(tenantId: string, id: string, data: Record<string, unknown>) {
    const vitals = await prisma.vitals.findFirst({ where: { id, tenantId } });
    if (!vitals) throw new AppError(404, 'Vitals not found');

    if (data.weight && data.height) {
      data.bmi = calculateBMI(data.weight as number, data.height as number);
    }

    return prisma.vitals.update({ where: { id }, data });
  }
}
