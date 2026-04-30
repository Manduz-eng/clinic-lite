'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import api from '@/lib/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function BillingPage() {
  const [invoices, setInvoices] = useState<any>({ data: [], pagination: { total: 0 } });
  const [filter, setFilter] = useState('');

  useEffect(() => { loadInvoices(); }, [filter]);

  const loadInvoices = async () => {
    try {
      const { data } = await api.get('/billing/invoices', { params: { status: filter || undefined, limit: 50 } });
      setInvoices(data);
    } catch { /* graceful */ }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
      <Card title="Invoices" action={
        <Select value={filter} onChange={(e) => setFilter(e.target.value)} options={[
          { value: '', label: 'All' }, { value: 'pending', label: 'Pending' },
          { value: 'partially_paid', label: 'Partially Paid' }, { value: 'paid', label: 'Paid' },
        ]} />
      }>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-gray-500">
              <th className="pb-3 font-medium">Invoice #</th>
              <th className="pb-3 font-medium">Patient</th>
              <th className="pb-3 font-medium">Total</th>
              <th className="pb-3 font-medium">Paid</th>
              <th className="pb-3 font-medium">Balance</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Date</th>
            </tr></thead>
            <tbody className="divide-y">
              {(invoices.data || []).map((inv: any) => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="py-3 font-mono text-xs">{inv.invoiceNo}</td>
                  <td className="py-3 font-medium">{inv.patient?.firstName} {inv.patient?.lastName}</td>
                  <td className="py-3">{formatCurrency(inv.totalAmount)}</td>
                  <td className="py-3">{formatCurrency(inv.paidAmount)}</td>
                  <td className="py-3 font-medium">{formatCurrency(inv.balance)}</td>
                  <td className="py-3"><Badge status={inv.status} /></td>
                  <td className="py-3">{formatDate(inv.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {invoices.data?.length === 0 && <p className="text-gray-500 text-center py-8">No invoices found.</p>}
        </div>
      </Card>
    </div>
  );
}
