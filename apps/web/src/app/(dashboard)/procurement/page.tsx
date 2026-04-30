'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ProcurementPage() {
  const [pos, setPOs] = useState<any>({ data: [] });
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [tab, setTab] = useState<'orders' | 'suppliers'>('orders');

  useEffect(() => {
    api.get('/procurement/purchase-orders', { params: { limit: 50 } }).then(({ data }) => setPOs(data)).catch(() => {});
    api.get('/procurement/suppliers').then(({ data }) => setSuppliers(data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Procurement</h1>
      <div className="flex gap-2">
        <Button variant={tab === 'orders' ? 'primary' : 'secondary'} onClick={() => setTab('orders')}>Purchase Orders</Button>
        <Button variant={tab === 'suppliers' ? 'primary' : 'secondary'} onClick={() => setTab('suppliers')}>Suppliers</Button>
      </div>

      {tab === 'orders' && (
        <Card title="LPOs / Purchase Orders">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-gray-500">
                <th className="pb-3 font-medium">PO #</th>
                <th className="pb-3 font-medium">Supplier</th>
                <th className="pb-3 font-medium">Total</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Date</th>
              </tr></thead>
              <tbody className="divide-y">
                {(pos.data || []).map((po: any) => (
                  <tr key={po.id} className="hover:bg-gray-50">
                    <td className="py-3 font-mono text-xs">{po.poNumber}</td>
                    <td className="py-3">{po.supplier?.name}</td>
                    <td className="py-3">{formatCurrency(po.totalAmount)}</td>
                    <td className="py-3"><Badge status={po.status} /></td>
                    <td className="py-3">{formatDate(po.orderDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pos.data?.length === 0 && <p className="text-gray-500 text-center py-8">No purchase orders.</p>}
          </div>
        </Card>
      )}

      {tab === 'suppliers' && (
        <Card title="Suppliers">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-gray-500">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Contact</th>
                <th className="pb-3 font-medium">Phone</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Terms</th>
              </tr></thead>
              <tbody className="divide-y">
                {suppliers.map((s: any) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="py-3 font-medium">{s.name}</td>
                    <td className="py-3">{s.contactPerson || '—'}</td>
                    <td className="py-3">{s.phone || '—'}</td>
                    <td className="py-3">{s.email || '—'}</td>
                    <td className="py-3">{s.paymentTerms || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {suppliers.length === 0 && <p className="text-gray-500 text-center py-8">No suppliers.</p>}
          </div>
        </Card>
      )}
    </div>
  );
}
