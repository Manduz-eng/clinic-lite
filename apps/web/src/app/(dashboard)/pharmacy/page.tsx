'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';
import { 
  Pill, 
  ClipboardList, 
  Package, 
  User, 
  Stethoscope, 
  CheckCircle2, 
  AlertTriangle,
  Search,
  ArrowRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function PharmacyPage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [drugs, setDrugs] = useState<any>({ data: [] });
  const [tab, setTab] = useState<'queue' | 'stock'>('queue');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/pharmacy/dispensing-queue').then(({ data }) => setQueue(data)).catch(() => {});
    api.get('/pharmacy/drugs', { params: { limit: 100 } }).then(({ data }) => setDrugs(data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">Pharmacy Services</h1>
          <p className="text-muted-foreground font-medium mt-1">Manage prescriptions, dispensing, and drug inventory.</p>
        </div>
        <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5">
          <Button 
            variant={tab === 'queue' ? 'primary' : 'ghost'} 
            onClick={() => setTab('queue')}
            className="rounded-xl h-10 gap-2"
          >
            <ClipboardList className="w-4 h-4" /> Dispensing
          </Button>
          <Button 
            variant={tab === 'stock' ? 'secondary' : 'ghost'} 
            onClick={() => setTab('stock')}
            className="rounded-xl h-10 gap-2"
          >
            <Package className="w-4 h-4" /> Inventory
          </Button>
        </div>
      </div>

      {tab === 'queue' && (
        <div className="grid grid-cols-1 gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground font-display flex items-center gap-3">
              <Pill className="text-primary w-6 h-6" /> Pending Prescriptions
            </h2>
            <Badge variant="outline" className="border-primary/20 text-primary font-bold">
              {queue.length} Awaiting Collection
            </Badge>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {queue.map((rx: any) => (
              <Card key={rx.id} className="relative group overflow-hidden border-white/5">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {rx.visit?.patient?.firstName?.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-base">{rx.visit?.patient?.firstName} {rx.visit?.patient?.lastName}</CardTitle>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{rx.visit?.patient?.patientNo}</p>
                    </div>
                  </div>
                  <Badge variant={rx.status === 'pending' ? 'warning' : 'success'}>
                    {rx.status}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-white/5 p-2 rounded-xl border border-white/5">
                    <Stethoscope className="w-3 h-3" />
                    <span>Dr. {rx.doctor?.firstName} {rx.doctor?.lastName}</span>
                  </div>

                  <div className="table-container bg-background/30 border-none rounded-xl">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-[10px] uppercase font-bold text-muted-foreground border-b border-white/5">
                          <th className="px-4 py-2">Drug</th>
                          <th className="px-4 py-2 text-center">Dosage</th>
                          <th className="px-4 py-2 text-center">Qty</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {rx.items?.map((item: any) => (
                          <tr key={item.id}>
                            <td className="px-4 py-2 font-bold text-foreground">
                              {item.drug?.name} <span className="text-primary ml-1">{item.drug?.strength}</span>
                            </td>
                            <td className="px-4 py-2 text-center text-muted-foreground">{item.dosage} ({item.frequency})</td>
                            <td className="px-4 py-2 text-center font-mono font-bold">{item.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <Button variant="primary" className="w-full gap-2 font-bold h-12">
                    <CheckCircle2 className="w-4 h-4" /> Confirm & Dispense
                  </Button>
                </CardContent>
              </Card>
            ))}

            {queue.length === 0 && (
              <div className="xl:col-span-2 py-24 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-6">
                  <Pill className="w-12 h-12 text-muted-foreground/20" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Pharmacy Queue Clear</h3>
                <p className="text-muted-foreground max-w-sm">No clinical prescriptions are pending for dispensing at the moment.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'stock' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-secondary" /> Inventory Management
            </CardTitle>
            <div className="flex items-center gap-3 w-80">
              <Input 
                placeholder="Search inventory..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-widest text-muted-foreground font-bold border-b border-white/5">
                    <th className="pb-4">Product Details</th>
                    <th className="pb-4">Category</th>
                    <th className="pb-4">Format</th>
                    <th className="pb-4 text-center">Unit Price</th>
                    <th className="pb-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(drugs.data || []).map((d: any) => (
                    <tr key={d.id} className="group hover:bg-white/5 transition-colors">
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-foreground">{d.name}</span>
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">CODE: {d.code} | {d.strength}</span>
                        </div>
                      </td>
                      <td className="py-4 text-sm text-muted-foreground">{d.category || 'General'}</td>
                      <td className="py-4 text-sm text-muted-foreground capitalize">{d.form || '—'}</td>
                      <td className="py-4 text-center font-bold text-foreground">{formatCurrency(d.unitPrice)}</td>
                      <td className="py-4 text-center">
                        <Badge variant={d.isActive ? 'success' : 'destructive'} className="text-[10px]">
                          {d.isActive ? 'In Stock' : 'Out of Stock'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {drugs.data?.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mb-6">
                    <AlertTriangle className="w-10 h-10 text-muted-foreground/30" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Inventory Empty</h3>
                  <p className="text-muted-foreground">No medications are registered in the system.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
