import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error-handler';
import { generateInvoiceNo, getNextSequence } from '../../shared/utils';
import { getPagination, paginatedResult, PaginationQuery } from '../../shared/types';

export class BillingService {
  async generateInvoice(tenantId: string, generatedById: string, data: {
    visitId: string;
    discount?: number;
    taxRate?: number;
    dueDate?: string;
  }) {
    const visit = await prisma.visit.findFirst({
      where: { id: data.visitId, tenantId },
      include: {
        patient: true,
        prescriptions: {
          include: { items: { include: { drug: true } } },
        },
        labRequests: {
          include: { test: true },
        },
        clinicalNote: true,
      },
    });

    if (!visit) throw new AppError(404, 'Visit not found');

    const invoiceItems: Array<{
      itemType: 'consultation' | 'lab_test' | 'drug' | 'procedure' | 'other';
      referenceId: string;
      description: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }> = [];

    if (visit.clinicalNote) {
      invoiceItems.push({
        itemType: 'consultation',
        referenceId: visit.clinicalNote.id,
        description: 'Consultation Fee',
        quantity: 1,
        unitPrice: 500,
        totalPrice: 500,
      });
    }

    for (const req of visit.labRequests) {
      invoiceItems.push({
        itemType: 'lab_test',
        referenceId: req.id,
        description: `Lab: ${req.test.name}`,
        quantity: 1,
        unitPrice: Number(req.test.price),
        totalPrice: Number(req.test.price),
      });
    }

    for (const rx of visit.prescriptions) {
      for (const item of rx.items) {
        const total = Number(item.drug.unitPrice) * item.quantity;
        invoiceItems.push({
          itemType: 'drug',
          referenceId: item.id,
          description: `${item.drug.name} ${item.drug.strength || ''} x${item.quantity}`,
          quantity: item.quantity,
          unitPrice: Number(item.drug.unitPrice),
          totalPrice: total,
        });
      }
    }

    const subtotal = invoiceItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const discount = data.discount || 0;
    const taxRate = data.taxRate || 0;
    const taxAmount = ((subtotal - discount) * taxRate) / 100;
    const totalAmount = subtotal - discount + taxAmount;

    const seq = await getNextSequence(tenantId, 'invoice');
    const invoiceNo = generateInvoiceNo(seq);

    const invoice = await prisma.invoice.create({
      data: {
        tenantId,
        visitId: data.visitId,
        patientId: visit.patientId,
        invoiceNo,
        subtotal,
        taxAmount,
        discount,
        totalAmount,
        paidAmount: 0,
        balance: totalAmount,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        generatedById,
        items: {
          create: invoiceItems,
        },
      },
      include: { items: true, patient: true },
    });

    await prisma.visit.update({
      where: { id: data.visitId },
      data: { status: 'billing' },
    });

    await prisma.ledgerEntry.create({
      data: {
        tenantId,
        entryDate: new Date(),
        entryType: 'revenue',
        category: 'invoice',
        description: `Invoice ${invoiceNo} generated`,
        debit: totalAmount,
        credit: 0,
        balance: totalAmount,
        referenceType: 'invoice',
        referenceId: invoice.id,
        recordedById: generatedById,
      },
    });

    return invoice;
  }

  async getInvoices(tenantId: string, query: PaginationQuery & { status?: string }) {
    const { page, limit, skip } = getPagination(query);

    const where: Record<string, unknown> = { tenantId };
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      prisma.invoice.findMany({
        where: where as any,
        skip,
        take: limit,
        include: {
          patient: { select: { patientNo: true, firstName: true, lastName: true } },
          items: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.invoice.count({ where: where as any }),
    ]);

    return paginatedResult(data, total, page, limit);
  }

  async getInvoiceById(tenantId: string, id: string) {
    const invoice = await prisma.invoice.findFirst({
      where: { id, tenantId },
      include: {
        patient: true,
        items: true,
        payments: true,
        visit: true,
      },
    });
    if (!invoice) throw new AppError(404, 'Invoice not found');
    return invoice;
  }

  async recordPayment(tenantId: string, receivedById: string, data: {
    invoiceId: string;
    paymentMethod: 'cash' | 'mpesa' | 'card' | 'insurance' | 'bank_transfer';
    amount: number;
    referenceNo?: string;
    notes?: string;
  }) {
    const invoice = await prisma.invoice.findFirst({
      where: { id: data.invoiceId, tenantId },
    });
    if (!invoice) throw new AppError(404, 'Invoice not found');

    const newPaidAmount = Number(invoice.paidAmount) + data.amount;
    const newBalance = Number(invoice.totalAmount) - newPaidAmount;

    if (newBalance < -0.01) {
      throw new AppError(400, 'Payment exceeds invoice balance');
    }

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          tenantId,
          invoiceId: data.invoiceId,
          paymentMethod: data.paymentMethod,
          amount: data.amount,
          referenceNo: data.referenceNo,
          paymentDate: new Date(),
          receivedById,
          notes: data.notes,
        },
      });

      const newStatus = newBalance <= 0.01 ? 'paid' : 'partially_paid';

      await tx.invoice.update({
        where: { id: data.invoiceId },
        data: {
          paidAmount: newPaidAmount,
          balance: Math.max(0, newBalance),
          status: newStatus,
        },
      });

      await tx.ledgerEntry.create({
        data: {
          tenantId,
          entryDate: new Date(),
          entryType: 'revenue',
          category: data.paymentMethod,
          description: `Payment received - ${data.paymentMethod}`,
          debit: 0,
          credit: data.amount,
          balance: data.amount,
          referenceType: 'payment',
          referenceId: payment.id,
          recordedById: receivedById,
        },
      });

      if (newStatus === 'paid') {
        const inv = await tx.invoice.findUnique({ where: { id: data.invoiceId } });
        if (inv) {
          await tx.visit.update({
            where: { id: inv.visitId },
            data: { status: 'completed' },
          });
        }
      }

      return payment;
    });

    return result;
  }

  async getPayments(tenantId: string, invoiceId: string) {
    return prisma.payment.findMany({
      where: { tenantId, invoiceId },
      include: {
        receivedBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
