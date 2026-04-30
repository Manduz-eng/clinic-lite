'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import api from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';

export default function AccountsPage() {
  const [revenue, setRevenue] = useState<any>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [tab, setTab] = useState<'revenue' | 'expenses' | 'ledger'>('revenue');
  const [expenses, setExpenses] = useState<any>({ data: [] });
  const [ledger, setLedger] = useState<any[]>([]);

  useEffect(() => {
    api.get('/accounts/reports/daily-revenue', { params: { date } }).then(({ data }) => setRevenue(data)).catch(() => {});
  }, [date]);

  useEffect(() => {
    if (tab === 'expenses') api.get('/accounts/expenses', { params: { limit: 50 } }).then(({ data }) => setExpenses(data)).catch(() => {});
    if (tab === 'ledger') api.get('/accounts/ledger', { params: { limit: 50 } }).then(({ data }) => setLedger(data)).catch(() => {});
  }, [tab]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
      <div className="flex gap-2">
        <Button variant={tab === 'revenue' ? 'primary' : 'secondary'} onClick={() => setTab('revenue')}>Revenue</Button>
        <Button variant={tab === 'expenses' ? 'primary' : 'secondary'} onClick={() => setTab('expenses')}>Expenses</Button>
        <Button variant={tab === 'ledger' ? 'primary' : 'secondary'} onClick={() => setTab('ledger')}>Ledger</Button>
      </div>

      {tab === 'revenue' && (
        <>
          <div className="w-48"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          {revenue && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-blue-50 rounded-xl p-4"><p className="text-sm text-gray-600">Visits</p><p className="text-2xl font-bold text-blue-600">{revenue.totalVisits}</p></div>
              <div className="bg-green-50 rounded-xl p-4"><p className="text-sm text-gray-600">Revenue</p><p className="text-2xl font-bold text-green-600">{formatCurrency(revenue.totalRevenue)}</p></div>
              <div className="bg-red-50 rounded-xl p-4"><p className="text-sm text-gray-600">Expenses</p><p className="text-2xl font-bold text-red-600">{formatCurrency(revenue.totalExpenses)}</p></div>
              <div className="bg-purple-50 rounded-xl p-4"><p className="text-sm text-gray-600">Net Income</p><p className="text-2xl font-bold text-purple-600">{formatCurrency(revenue.netIncome)}</p></div>
              <div className="bg-yellow-50 rounded-xl p-4"><p className="text-sm text-gray-600">Outstanding</p><p className="text-2xl font-bold text-yellow-600">{formatCurrency(revenue.totalOutstanding)}</p></div>
            </div>
          )}
        </>
      )}

      {tab === 'expenses' && (
        <Card title="Expenses">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-gray-500">
                <th className="pb-3 font-medium">Description</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Method</th>
                <th className="pb-3 font-medium">Status</th>
              </tr></thead>
              <tbody className="divide-y">
                {(expenses.data || []).map((e: any) => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="py-3">{e.description}</td>
                    <td className="py-3">{formatCurrency(e.amount)}</td>
                    <td className="py-3 capitalize">{e.paymentMethod?.replace('_', ' ')}</td>
                    <td className="py-3"><Badge status={e.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === 'ledger' && (
        <Card title="General Ledger">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-gray-500">
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Description</th>
                <th className="pb-3 font-medium">Debit</th>
                <th className="pb-3 font-medium">Credit</th>
              </tr></thead>
              <tbody className="divide-y">
                {ledger.map((entry: any) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="py-3">{new Date(entry.entryDate).toLocaleDateString()}</td>
                    <td className="py-3"><Badge status={entry.entryType} /></td>
                    <td className="py-3">{entry.description}</td>
                    <td className="py-3">{Number(entry.debit) > 0 ? formatCurrency(entry.debit) : '—'}</td>
                    <td className="py-3">{Number(entry.credit) > 0 ? formatCurrency(entry.credit) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
