import { prisma } from '../config/database';

export function generatePatientNo(sequence: number): string {
  const year = new Date().getFullYear();
  return `CL-${year}-${String(sequence).padStart(5, '0')}`;
}

export function generateVisitNo(queueNumber: number): string {
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  return `V-${dateStr}-${String(queueNumber).padStart(4, '0')}`;
}

export function generateInvoiceNo(sequence: number): string {
  const year = new Date().getFullYear();
  return `INV-${year}-${String(sequence).padStart(5, '0')}`;
}

export function generatePONumber(sequence: number): string {
  const year = new Date().getFullYear();
  return `LPO-${year}-${String(sequence).padStart(5, '0')}`;
}

export function generateGRNNumber(sequence: number): string {
  const year = new Date().getFullYear();
  return `GRN-${year}-${String(sequence).padStart(5, '0')}`;
}

export async function getNextSequence(tenantId: string, entity: string): Promise<number> {
  const countMap: Record<string, () => Promise<number>> = {
    patient: () => prisma.patient.count({ where: { tenantId } }),
    invoice: () => prisma.invoice.count({ where: { tenantId } }),
    purchase_order: () => prisma.purchaseOrder.count({ where: { tenantId } }),
    grn: () => prisma.goodsReceivedNote.count({ where: { tenantId } }),
  };

  const counter = countMap[entity];
  if (!counter) return 1;
  const count = await counter();
  return count + 1;
}

export async function getNextQueueNumber(tenantId: string): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const count = await prisma.visit.count({
    where: {
      tenantId,
      visitDate: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  return count + 1;
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}
