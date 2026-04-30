import axios from 'axios';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error-handler';
import { getMpesaAccessToken, generateMpesaPassword, getMpesaTimestamp, mpesaBaseUrl } from '../../config/mpesa';

export class MpesaService {
  async initiateSTKPush(tenantId: string, data: {
    invoiceId: string;
    phoneNumber: string;
    amount: number;
  }) {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new AppError(404, 'Tenant not found');

    if (!tenant.mpesaShortcode || !tenant.mpesaPasskey || !tenant.mpesaConsumerKey || !tenant.mpesaConsumerSecret) {
      throw new AppError(400, 'M-Pesa not configured for this clinic');
    }

    const invoice = await prisma.invoice.findFirst({
      where: { id: data.invoiceId, tenantId },
    });
    if (!invoice) throw new AppError(404, 'Invoice not found');

    const accessToken = await getMpesaAccessToken(
      tenant.mpesaConsumerKey,
      tenant.mpesaConsumerSecret
    );

    const timestamp = getMpesaTimestamp();
    const password = generateMpesaPassword(tenant.mpesaShortcode, tenant.mpesaPasskey, timestamp);

    const phone = data.phoneNumber.startsWith('0')
      ? `254${data.phoneNumber.slice(1)}`
      : data.phoneNumber.startsWith('+')
        ? data.phoneNumber.slice(1)
        : data.phoneNumber;

    const callbackUrl = process.env.MPESA_CALLBACK_URL || `${process.env.FRONTEND_URL}/api/mpesa/callback`;

    const response = await axios.post(
      `${mpesaBaseUrl}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: tenant.mpesaShortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(data.amount),
        PartyA: phone,
        PartyB: tenant.mpesaShortcode,
        PhoneNumber: phone,
        CallBackURL: callbackUrl,
        AccountReference: invoice.invoiceNo,
        TransactionDesc: `Payment for ${invoice.invoiceNo}`,
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const mpesaTx = await prisma.mpesaTransaction.create({
      data: {
        tenantId,
        merchantRequestId: response.data.MerchantRequestID,
        checkoutRequestId: response.data.CheckoutRequestID,
        phoneNumber: phone,
        amount: data.amount,
        status: 'initiated',
      },
    });

    return {
      checkoutRequestId: response.data.CheckoutRequestID,
      merchantRequestId: response.data.MerchantRequestID,
      transactionId: mpesaTx.id,
      responseDescription: response.data.ResponseDescription,
    };
  }

  async handleCallback(body: any) {
    const { Body } = body;
    const { stkCallback } = Body;

    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc } = stkCallback;

    const mpesaTx = await prisma.mpesaTransaction.findFirst({
      where: { checkoutRequestId: CheckoutRequestID },
    });

    if (!mpesaTx) return;

    if (ResultCode === 0) {
      const callbackMetadata = stkCallback.CallbackMetadata?.Item || [];
      const mpesaReceipt = callbackMetadata.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value;
      const amount = callbackMetadata.find((i: any) => i.Name === 'Amount')?.Value;

      await prisma.$transaction(async (tx) => {
        const invoice = await tx.invoice.findFirst({
          where: { tenantId: mpesaTx.tenantId },
          orderBy: { createdAt: 'desc' },
        });

        if (invoice) {
          const payment = await tx.payment.create({
            data: {
              tenantId: mpesaTx.tenantId,
              invoiceId: invoice.id,
              paymentMethod: 'mpesa',
              amount: amount || Number(mpesaTx.amount),
              referenceNo: mpesaReceipt,
              paymentDate: new Date(),
              receivedById: invoice.generatedById,
            },
          });

          const newPaidAmount = Number(invoice.paidAmount) + (amount || Number(mpesaTx.amount));
          const newBalance = Number(invoice.totalAmount) - newPaidAmount;

          await tx.invoice.update({
            where: { id: invoice.id },
            data: {
              paidAmount: newPaidAmount,
              balance: Math.max(0, newBalance),
              status: newBalance <= 0.01 ? 'paid' : 'partially_paid',
            },
          });

          await tx.mpesaTransaction.update({
            where: { id: mpesaTx.id },
            data: {
              paymentId: payment.id,
              mpesaReceipt,
              resultCode: ResultCode,
              resultDesc: ResultDesc,
              status: 'completed',
            },
          });
        }
      });
    } else {
      await prisma.mpesaTransaction.update({
        where: { id: mpesaTx.id },
        data: {
          resultCode: ResultCode,
          resultDesc: ResultDesc,
          status: 'failed',
        },
      });
    }
  }

  async getTransactionStatus(tenantId: string, checkoutRequestId: string) {
    const tx = await prisma.mpesaTransaction.findFirst({
      where: { tenantId, checkoutRequestId },
    });
    if (!tx) throw new AppError(404, 'Transaction not found');
    return tx;
  }
}
