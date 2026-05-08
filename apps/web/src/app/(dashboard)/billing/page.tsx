'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  Receipt, 
  CreditCard, 
  Wallet, 
  ShieldCheck, 
  Search, 
  ArrowUpRight,
  TrendingUp,
  Ban,
  CheckCircle2,
  FileText
} from 'lucide-react';

export default function BillingPage() {
  const [invoices, setInvoices] = useState<any>({ data: [], pagination: { total: 0 } });
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { loadInvoices(); }, [filter]);

  const loadInvoices = async () => {
    try {
      const { data } = await api.get('/billing/invoices', { params: { status: filter || undefined, limit: 50 } });
      setInvoices(data);
    } catch { /* graceful */ }
  };

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">Financial Services</h1>
          <p className="text-muted-foreground font-medium mt-1">Manage patient invoices, insurance claims, and payments.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="accent" className="gap-2 h-12 px-6">
            <ShieldCheck className="w-5 h-5" />
            NHIF / SHA Portal
          </Button>
          <Button variant="primary" className="gap-2 h-12 px-6">
            <CreditCard className="w-5 h-5" />
            Process Payment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary/5 border-primary/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-primary/20 rounded-lg text-primary">
                <Wallet className="w-5 h-5" />
              </div>
              <Badge variant="outline" className="text-primary border-primary/20 bg-primary/10 font-bold">Today</Badge>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Collections</p>
            <h2 className="text-3xl font-black text-foreground mt-1">{formatCurrency(145800)}</h2>
            <div className="flex items-center gap-1.5 mt-4 text-[10px] font-bold text-success uppercase">
              <TrendingUp className="w-3 h-3" /> 12% vs Yesterday
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-secondary/5 border-secondary/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-secondary/20 rounded-lg text-secondary">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <Badge variant="outline" className="text-secondary border-secondary/20 bg-secondary/10 font-bold">Insurance</Badge>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">NHIF/SHA Pending</p>
            <h2 className="text-3xl font-black text-foreground mt-1">{formatCurrency(82450)}</h2>
            <p className="text-[10px] font-medium text-muted-foreground mt-4 italic">12 claims awaiting verification</p>
          </CardContent>
        </Card>

        <Card className="bg-destructive/5 border-destructive/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-destructive/20 rounded-lg text-destructive">
                <Ban className="w-5 h-5" />
              </div>
              <Badge variant="outline" className="text-destructive border-destructive/20 bg-destructive/10 font-bold">Arrears</Badge>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Outstanding Balance</p>
            <h2 className="text-3xl font-black text-foreground mt-1">{formatCurrency(24100)}</h2>
            <p className="text-[10px] font-medium text-muted-foreground mt-4 italic">5 invoices over 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" /> Invoice Registry
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="w-64">
              <Input 
                placeholder="Search invoices..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="w-40">
              <Select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)} 
                options={[
                  { value: '', label: 'All Statuses' }, 
                  { value: 'pending', label: 'Pending' },
                  { value: 'paid', label: 'Paid' },
                ]} 
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-widest text-muted-foreground font-bold border-b border-white/5">
                  <th className="pb-4">Invoice No</th>
                  <th className="pb-4">Patient</th>
                  <th className="pb-4 text-center">Payment Method</th>
                  <th className="pb-4 text-right">Total Amount</th>
                  <th className="pb-4 text-center">Status</th>
                  <th className="pb-4 text-right">Date</th>
                  <th className="pb-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(invoices.data || []).map((inv: any) => (
                  <tr key={inv.id} className="group hover:bg-white/5 transition-colors">
                    <td className="py-4">
                      <span className="font-mono text-xs font-bold text-primary">#{inv.invoiceNo}</span>
                    </td>
                    <td className="py-4 font-bold text-foreground">{inv.patient?.firstName} {inv.patient?.lastName}</td>
                    <td className="py-4 text-center">
                      <div className="flex flex-col items-center">
                        <Badge variant="outline" className="text-[10px] font-bold">
                          {inv.patient?.insuranceProvider ? 'INSURANCE' : 'CASH'}
                        </Badge>
                        <span className="text-[9px] text-muted-foreground mt-1 uppercase font-bold tracking-tighter">
                          {inv.patient?.insuranceProvider || 'Direct Payment'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-black text-foreground">{formatCurrency(inv.totalAmount)}</span>
                        <span className="text-[10px] text-muted-foreground font-medium italic">Bal: {formatCurrency(inv.balance)}</span>
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <Badge variant={inv.status === 'paid' ? 'success' : 'warning'} className="capitalize">
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="py-4 text-right text-xs text-muted-foreground font-medium">
                      {formatDate(inv.createdAt)}
                    </td>
                    <td className="py-4 text-right">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-primary hover:bg-primary/10">
                        <FileText className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {invoices.data?.length === 0 && (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mb-6">
                  <Receipt className="w-10 h-10 text-muted-foreground/30" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No Invoices</h3>
                <p className="text-muted-foreground">Transaction records will appear here as patients are billed.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
