'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import api from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  FileText, 
  PieChart, 
  Calendar,
  ArrowRight,
  Download,
  CreditCard,
  History
} from 'lucide-react';

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
    <div className="space-y-8 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">Financial Management</h1>
          <p className="text-muted-foreground font-medium mt-1">General ledger, daily revenue reports, and expense tracking.</p>
        </div>
        <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5">
          <Button variant={tab === 'revenue' ? 'primary' : 'ghost'} onClick={() => setTab('revenue')} className="rounded-xl h-10 gap-2">
            <PieChart className="w-4 h-4" /> Revenue
          </Button>
          <Button variant={tab === 'expenses' ? 'secondary' : 'ghost'} onClick={() => setTab('expenses')} className="rounded-xl h-10 gap-2">
            <TrendingDown className="w-4 h-4" /> Expenses
          </Button>
          <Button variant={tab === 'ledger' ? 'accent' : 'ghost'} onClick={() => setTab('ledger')} className="rounded-xl h-10 gap-2">
            <History className="w-4 h-4" /> Ledger
          </Button>
        </div>
      </div>

      {tab === 'revenue' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="text-primary w-5 h-5" />
              <div className="w-48">
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" /> Export Report
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            <Card className="bg-primary/5 border-primary/10">
              <CardContent className="pt-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Patient Visits</p>
                <h3 className="text-2xl font-black text-foreground mt-1">{revenue?.totalVisits || 0}</h3>
              </CardContent>
            </Card>
            <Card className="bg-success/5 border-success/10">
              <CardContent className="pt-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Gross Revenue</p>
                <h3 className="text-2xl font-black text-success mt-1">{formatCurrency(revenue?.totalRevenue || 0)}</h3>
              </CardContent>
            </Card>
            <Card className="bg-destructive/5 border-destructive/10">
              <CardContent className="pt-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Daily Expenses</p>
                <h3 className="text-2xl font-black text-destructive mt-1">{formatCurrency(revenue?.totalExpenses || 0)}</h3>
              </CardContent>
            </Card>
            <Card className="bg-secondary/5 border-secondary/10">
              <CardContent className="pt-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Net Position</p>
                <h3 className="text-2xl font-black text-foreground mt-1">{formatCurrency(revenue?.netIncome || 0)}</h3>
              </CardContent>
            </Card>
            <Card className="bg-warning/5 border-warning/10">
              <CardContent className="pt-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Outstanding</p>
                <h3 className="text-2xl font-black text-warning mt-1">{formatCurrency(revenue?.totalOutstanding || 0)}</h3>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border border-dashed border-white/5 rounded-2xl bg-white/5">
                <p className="text-muted-foreground text-sm font-medium">Visual charts will appear here as data populates.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === 'expenses' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-destructive" /> Expense Log
            </CardTitle>
            <Button size="sm" variant="destructive" className="gap-2 font-bold">
              Record New Expense
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-widest text-muted-foreground font-bold border-b border-white/5">
                    <th className="pb-4">Expense Description</th>
                    <th className="pb-4 text-center">Amount</th>
                    <th className="pb-4 text-center">Payment Method</th>
                    <th className="pb-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(expenses.data || []).map((e: any) => (
                    <tr key={e.id} className="group hover:bg-white/5 transition-colors">
                      <td className="py-4 font-bold text-foreground">{e.description}</td>
                      <td className="py-4 text-center font-black text-foreground">{formatCurrency(e.amount)}</td>
                      <td className="py-4 text-center capitalize text-muted-foreground text-sm">{e.paymentMethod?.replace('_', ' ')}</td>
                      <td className="py-4 text-center">
                        <Badge variant={e.status === 'paid' ? 'success' : 'warning'}>
                          {e.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 'ledger' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-accent" /> Transaction Ledger
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-widest text-muted-foreground font-bold border-b border-white/5">
                    <th className="pb-4">Date</th>
                    <th className="pb-4">Type</th>
                    <th className="pb-4">Description</th>
                    <th className="pb-4 text-right">Debit</th>
                    <th className="pb-4 text-right">Credit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {ledger.map((entry: any) => (
                    <tr key={entry.id} className="group hover:bg-white/5 transition-colors">
                      <td className="py-4 text-xs font-medium text-muted-foreground">{new Date(entry.entryDate).toLocaleDateString()}</td>
                      <td className="py-4 text-center">
                        <Badge variant={entry.entryType === 'debit' ? 'destructive' : 'success'} className="uppercase text-[9px]">
                          {entry.entryType}
                        </Badge>
                      </td>
                      <td className="py-4 font-bold text-foreground text-sm">{entry.description}</td>
                      <td className="py-4 text-right font-mono font-bold text-destructive">
                        {Number(entry.debit) > 0 ? formatCurrency(entry.debit) : '—'}
                      </td>
                      <td className="py-4 text-right font-mono font-bold text-success">
                        {Number(entry.credit) > 0 ? formatCurrency(entry.credit) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
