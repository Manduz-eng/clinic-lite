'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  ShoppingCart, 
  Truck, 
  ClipboardList, 
  Phone, 
  Mail, 
  FileText,
  Search,
  Plus
} from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function ProcurementPage() {
  const [pos, setPOs] = useState<any>({ data: [] });
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [tab, setTab] = useState<'orders' | 'suppliers'>('orders');

  useEffect(() => {
    api.get('/procurement/purchase-orders', { params: { limit: 50 } }).then(({ data }) => setPOs(data)).catch(() => {});
    api.get('/procurement/suppliers').then(({ data }) => setSuppliers(data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">Procurement & Supply Chain</h1>
          <p className="text-muted-foreground font-medium mt-1">Manage purchase orders, suppliers, and incoming inventory.</p>
        </div>
        <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5">
          <Button 
            variant={tab === 'orders' ? 'primary' : 'ghost'} 
            onClick={() => setTab('orders')}
            className="rounded-xl h-10 gap-2"
          >
            <FileText className="w-4 h-4" /> Purchase Orders
          </Button>
          <Button 
            variant={tab === 'suppliers' ? 'secondary' : 'ghost'} 
            onClick={() => setTab('suppliers')}
            className="rounded-xl h-10 gap-2"
          >
            <Truck className="w-4 h-4" /> Suppliers
          </Button>
        </div>
      </div>

      {tab === 'orders' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" /> Active LPOs
            </CardTitle>
            <Button size="sm" variant="primary" className="gap-2 font-bold">
              <Plus className="w-4 h-4" /> New Order
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-widest text-muted-foreground font-bold border-b border-white/5">
                    <th className="pb-4">Order #</th>
                    <th className="pb-4">Supplier</th>
                    <th className="pb-4 text-center">Total Amount</th>
                    <th className="pb-4 text-center">Status</th>
                    <th className="pb-4 text-right">Order Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(pos.data || []).map((po: any) => (
                    <tr key={po.id} className="group hover:bg-white/5 transition-colors">
                      <td className="py-4">
                        <span className="font-mono text-xs font-bold text-primary">#{po.poNumber}</span>
                      </td>
                      <td className="py-4 font-bold text-foreground">{po.supplier?.name}</td>
                      <td className="py-4 text-center font-bold text-foreground">{formatCurrency(po.totalAmount)}</td>
                      <td className="py-4 text-center">
                        <Badge variant={po.status === 'received' ? 'success' : 'warning'} className="capitalize">
                          {po.status}
                        </Badge>
                      </td>
                      <td className="py-4 text-right text-xs text-muted-foreground font-medium">
                        {formatDate(po.orderDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {pos.data?.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mb-6">
                    <FileText className="w-10 h-10 text-muted-foreground/30" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">No Purchase Orders</h3>
                  <p className="text-muted-foreground">Start by creating your first purchase order for medical supplies.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 'suppliers' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-secondary" /> Supplier Directory
            </CardTitle>
            <Button size="sm" variant="secondary" className="gap-2 font-bold">
              <Plus className="w-4 h-4" /> Add Supplier
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-widest text-muted-foreground font-bold border-b border-white/5">
                    <th className="pb-4">Company Name</th>
                    <th className="pb-4">Contact Person</th>
                    <th className="pb-4">Communication</th>
                    <th className="pb-4 text-right">Payment Terms</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {suppliers.map((s: any) => (
                    <tr key={s.id} className="group hover:bg-white/5 transition-colors">
                      <td className="py-4 font-bold text-foreground">{s.name}</td>
                      <td className="py-4 text-sm text-muted-foreground">{s.contactPerson || '—'}</td>
                      <td className="py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                            <Phone className="w-3 h-3" /> {s.phone || '—'}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                            <Mail className="w-3 h-3" /> {s.email || '—'}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-right text-xs text-foreground font-bold">
                        {s.paymentTerms || 'Standard'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {suppliers.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mb-6">
                    <Truck className="w-10 h-10 text-muted-foreground/30" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">No Suppliers Registered</h3>
                  <p className="text-muted-foreground">Maintain a list of your trusted medical and general suppliers.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
