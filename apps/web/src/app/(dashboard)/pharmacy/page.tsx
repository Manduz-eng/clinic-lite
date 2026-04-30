'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';

export default function PharmacyPage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [drugs, setDrugs] = useState<any>({ data: [] });
  const [tab, setTab] = useState<'queue' | 'stock'>('queue');

  useEffect(() => {
    api.get('/pharmacy/dispensing-queue').then(({ data }) => setQueue(data)).catch(() => {});
    api.get('/pharmacy/drugs', { params: { limit: 100 } }).then(({ data }) => setDrugs(data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Pharmacy</h1>
      <div className="flex gap-2">
        <Button variant={tab === 'queue' ? 'primary' : 'secondary'} onClick={() => setTab('queue')}>Dispensing Queue</Button>
        <Button variant={tab === 'stock' ? 'primary' : 'secondary'} onClick={() => setTab('stock')}>Drug Stock</Button>
      </div>

      {tab === 'queue' && (
        <Card title="Prescriptions to Dispense">
          {queue.length === 0 ? (
            <p className="text-gray-500 text-sm">No pending prescriptions.</p>
          ) : (
            <div className="space-y-4">
              {queue.map((rx: any) => (
                <div key={rx.id} className="border rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <div>
                      <span className="font-medium">{rx.visit?.patient?.firstName} {rx.visit?.patient?.lastName}</span>
                      <span className="text-gray-400 ml-2 text-xs">{rx.visit?.patient?.patientNo}</span>
                    </div>
                    <Badge status={rx.status} />
                  </div>
                  <p className="text-sm text-gray-500 mb-2">Dr. {rx.doctor?.firstName} {rx.doctor?.lastName}</p>
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-gray-500 border-b">
                      <th className="pb-2">Drug</th><th className="pb-2">Dosage</th><th className="pb-2">Freq</th><th className="pb-2">Qty</th>
                    </tr></thead>
                    <tbody className="divide-y">
                      {rx.items?.map((item: any) => (
                        <tr key={item.id}>
                          <td className="py-2">{item.drug?.name} {item.drug?.strength}</td>
                          <td className="py-2">{item.dosage}</td>
                          <td className="py-2">{item.frequency}</td>
                          <td className="py-2">{item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === 'stock' && (
        <Card title="Drug Inventory">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-gray-500">
                <th className="pb-3 font-medium">Code</th>
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Form</th>
                <th className="pb-3 font-medium">Strength</th>
                <th className="pb-3 font-medium">Price</th>
                <th className="pb-3 font-medium">Category</th>
              </tr></thead>
              <tbody className="divide-y">
                {(drugs.data || []).map((d: any) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="py-3 font-mono text-xs">{d.code}</td>
                    <td className="py-3 font-medium">{d.name}</td>
                    <td className="py-3">{d.form || '—'}</td>
                    <td className="py-3">{d.strength || '—'}</td>
                    <td className="py-3">{formatCurrency(d.unitPrice)}</td>
                    <td className="py-3">{d.category || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {drugs.data?.length === 0 && <p className="text-gray-500 text-center py-8">No drugs in inventory.</p>}
          </div>
        </Card>
      )}
    </div>
  );
}
