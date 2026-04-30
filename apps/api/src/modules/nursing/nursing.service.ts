import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error-handler';

export class NursingService {
  async create(tenantId: string, recordedById: string, data: {
    visitId: string;
    noteType: 'assessment' | 'treatment' | 'observation' | 'handover';
    content: string;
    treatmentRoom?: string;
  }) {
    const visit = await prisma.visit.findFirst({
      where: { id: data.visitId, tenantId },
    });
    if (!visit) throw new AppError(404, 'Visit not found');

    const note = await prisma.nursingNote.create({
      data: {
        tenantId,
        visitId: data.visitId,
        noteType: data.noteType,
        content: data.content,
        treatmentRoom: data.treatmentRoom,
        recordedById,
      },
    });

    if (visit.status === 'in_triage') {
      await prisma.visit.update({
        where: { id: data.visitId },
        data: { status: 'in_nursing' },
      });
    }

    return note;
  }

  async findByVisit(tenantId: string, visitId: string) {
    return prisma.nursingNote.findMany({
      where: { visitId, tenantId },
      include: {
        recordedBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(tenantId: string, id: string, data: Record<string, unknown>) {
    const note = await prisma.nursingNote.findFirst({ where: { id, tenantId } });
    if (!note) throw new AppError(404, 'Nursing note not found');

    return prisma.nursingNote.update({ where: { id }, data });
  }
}
