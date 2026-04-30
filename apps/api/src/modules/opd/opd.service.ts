import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error-handler';

export class OpdService {
  async createClinicalNote(tenantId: string, doctorId: string, data: {
    visitId: string;
    historyOfIllness?: string;
    examinationFindings?: string;
    assessment?: string;
    plan?: string;
    followUpDate?: string;
    diagnoses?: Array<{
      icdCode: string;
      description: string;
      diagnosisType: 'primary' | 'secondary' | 'differential';
    }>;
  }) {
    const visit = await prisma.visit.findFirst({
      where: { id: data.visitId, tenantId },
    });
    if (!visit) throw new AppError(404, 'Visit not found');

    const existing = await prisma.clinicalNote.findUnique({
      where: { visitId: data.visitId },
    });
    if (existing) throw new AppError(409, 'Clinical note already exists for this visit');

    const result = await prisma.$transaction(async (tx) => {
      const note = await tx.clinicalNote.create({
        data: {
          tenantId,
          visitId: data.visitId,
          historyOfIllness: data.historyOfIllness,
          examinationFindings: data.examinationFindings,
          assessment: data.assessment,
          plan: data.plan,
          followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
          doctorId,
        },
      });

      if (data.diagnoses && data.diagnoses.length > 0) {
        await tx.diagnosis.createMany({
          data: data.diagnoses.map((d) => ({
            tenantId,
            visitId: data.visitId,
            clinicalNoteId: note.id,
            icdCode: d.icdCode,
            description: d.description,
            diagnosisType: d.diagnosisType,
          })),
        });
      }

      await tx.visit.update({
        where: { id: data.visitId },
        data: { status: 'with_doctor', assignedDoctorId: doctorId },
      });

      return note;
    });

    return prisma.clinicalNote.findUnique({
      where: { id: result.id },
      include: { diagnoses: true },
    });
  }

  async createPrescription(tenantId: string, doctorId: string, data: {
    visitId: string;
    notes?: string;
    items: Array<{
      drugId: string;
      dosage: string;
      frequency: string;
      duration: string;
      quantity: number;
      route?: string;
      instructions?: string;
    }>;
  }) {
    const visit = await prisma.visit.findFirst({
      where: { id: data.visitId, tenantId },
    });
    if (!visit) throw new AppError(404, 'Visit not found');

    return prisma.prescription.create({
      data: {
        tenantId,
        visitId: data.visitId,
        doctorId,
        notes: data.notes,
        items: {
          create: data.items.map((item) => ({
            drugId: item.drugId,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            quantity: item.quantity,
            route: item.route,
            instructions: item.instructions,
          })),
        },
      },
      include: {
        items: { include: { drug: true } },
        doctor: { select: { firstName: true, lastName: true } },
      },
    });
  }

  async getClinicalNote(tenantId: string, visitId: string) {
    const note = await prisma.clinicalNote.findFirst({
      where: { visitId, tenantId },
      include: {
        diagnoses: true,
        doctor: { select: { firstName: true, lastName: true } },
      },
    });
    if (!note) throw new AppError(404, 'Clinical note not found');
    return note;
  }

  async updateClinicalNote(tenantId: string, id: string, data: Record<string, unknown>) {
    const note = await prisma.clinicalNote.findFirst({ where: { id, tenantId } });
    if (!note) throw new AppError(404, 'Clinical note not found');

    return prisma.clinicalNote.update({
      where: { id },
      data,
      include: { diagnoses: true },
    });
  }

  async getPrescriptions(tenantId: string, visitId: string) {
    return prisma.prescription.findMany({
      where: { visitId, tenantId },
      include: {
        items: { include: { drug: true } },
        doctor: { select: { firstName: true, lastName: true } },
      },
    });
  }
}
