import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error-handler';
import { getPagination, paginatedResult, PaginationQuery } from '../../shared/types';

export class AccountsService {
  async createExpenseCategory(tenantId: string, data: { name: string; description?: string }) {
    return prisma.expenseCategory.create({
      data: { tenantId, ...data },
    });
  }

  async getExpenseCategories(tenantId: string) {
    return prisma.expenseCategory.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
  }

  async createExpense(tenantId: string, recordedById: string, data: {
    categoryId: string;
    amount: number;
    description: string;
    referenceNo?: string;
    expenseDate: string;
    paymentMethod: 'cash' | 'mpesa' | 'bank_transfer' | 'cheque';
    receiptUrl?: string;
  }) {
    const category = await prisma.expenseCategory.findFirst({
      where: { id: data.categoryId, tenantId },
    });
    if (!category) throw new AppError(404, 'Expense category not found');

    const expense = await prisma.expense.create({
      data: {
        tenantId,
        categoryId: data.categoryId,
        amount: data.amount,
        description: data.description,
        referenceNo: data.referenceNo,
        expenseDate: new Date(data.expenseDate),
        paymentMethod: data.paymentMethod,
        receiptUrl: data.receiptUrl,
        recordedById,
      },
      include: { category: true },
    });

    return expense;
  }

  async getExpenses(tenantId: string, query: PaginationQuery & { status?: string; startDate?: string; endDate?: string }) {
    const { page, limit, skip } = getPagination(query);

    const where: Record<string, unknown> = { tenantId };
    if (query.status) where.status = query.status;
    if (query.startDate || query.endDate) {
      where.expenseDate = {};
      if (query.startDate) (where.expenseDate as any).gte = new Date(query.startDate);
      if (query.endDate) (where.expenseDate as any).lte = new Date(query.endDate);
    }

    const [data, total] = await Promise.all([
      prisma.expense.findMany({
        where: where as any,
        skip,
        take: limit,
        include: {
          category: true,
          recordedBy: { select: { firstName: true, lastName: true } },
          approvedBy: { select: { firstName: true, lastName: true } },
        },
        orderBy: { expenseDate: 'desc' },
      }),
      prisma.expense.count({ where: where as any }),
    ]);

    return paginatedResult(data, total, page, limit);
  }

  async approveExpense(tenantId: string, id: string, approvedById: string, status: string) {
    const expense = await prisma.expense.findFirst({ where: { id, tenantId } });
    if (!expense) throw new AppError(404, 'Expense not found');

    const updated = await prisma.expense.update({
      where: { id },
      data: { status: status as any, approvedById },
    });

    if (status === 'approved') {
      await prisma.ledgerEntry.create({
        data: {
          tenantId,
          entryDate: new Date(),
          entryType: 'expense',
          category: 'expense',
          description: expense.description,
          debit: 0,
          credit: Number(expense.amount),
          balance: 0,
          referenceType: 'expense',
          referenceId: expense.id,
          recordedById: approvedById,
        },
      });
    }

    return updated;
  }

  async getLedger(tenantId: string, query: { startDate?: string; endDate?: string; entryType?: string }) {
    const where: Record<string, unknown> = { tenantId };
    if (query.entryType) where.entryType = query.entryType;
    if (query.startDate || query.endDate) {
      where.entryDate = {};
      if (query.startDate) (where.entryDate as any).gte = new Date(query.startDate);
      if (query.endDate) (where.entryDate as any).lte = new Date(query.endDate);
    }

    return prisma.ledgerEntry.findMany({
      where: where as any,
      include: {
        recordedBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { entryDate: 'desc' },
    });
  }

  async getDailyRevenue(tenantId: string, date: string) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const [payments, expenses, visits, invoices] = await Promise.all([
      prisma.payment.findMany({
        where: {
          tenantId,
          paymentDate: { gte: startDate, lt: endDate },
        },
        include: {
          invoice: { select: { invoiceNo: true } },
        },
      }),
      prisma.expense.findMany({
        where: {
          tenantId,
          expenseDate: { gte: startDate, lt: endDate },
          status: 'approved',
        },
        include: { category: true },
      }),
      prisma.visit.count({
        where: {
          tenantId,
          visitDate: { gte: startDate, lt: endDate },
        },
      }),
      prisma.invoice.findMany({
        where: {
          tenantId,
          createdAt: { gte: startDate, lt: endDate },
        },
      }),
    ]);

    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    const revenueByMethod: Record<string, number> = {};
    for (const p of payments) {
      revenueByMethod[p.paymentMethod] = (revenueByMethod[p.paymentMethod] || 0) + Number(p.amount);
    }

    return {
      date,
      totalVisits: visits,
      totalInvoices: invoices.length,
      totalRevenue,
      totalExpenses,
      netIncome: totalRevenue - totalExpenses,
      revenueByMethod,
      totalInvoiced: invoices.reduce((sum, i) => sum + Number(i.totalAmount), 0),
      totalOutstanding: invoices.reduce((sum, i) => sum + Number(i.balance), 0),
    };
  }

  async getRevenueReport(tenantId: string, startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1);

    const [payments, expenses] = await Promise.all([
      prisma.payment.findMany({
        where: {
          tenantId,
          paymentDate: { gte: start, lt: end },
        },
      }),
      prisma.expense.findMany({
        where: {
          tenantId,
          expenseDate: { gte: start, lt: end },
          status: 'approved',
        },
        include: { category: true },
      }),
    ]);

    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    const expensesByCategory: Record<string, number> = {};
    for (const e of expenses) {
      const cat = e.category.name;
      expensesByCategory[cat] = (expensesByCategory[cat] || 0) + Number(e.amount);
    }

    return {
      period: { startDate, endDate },
      totalRevenue,
      totalExpenses,
      netIncome: totalRevenue - totalExpenses,
      expensesByCategory,
    };
  }
}
