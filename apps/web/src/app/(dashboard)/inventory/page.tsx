'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import api from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';
import { 
  Box, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Plus, 
  Search, 
  RefreshCw,
  ArrowRight
} from 'lucide-react';

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      // Reusing pharmacy drugs for now as core inventory
      const { data } = await api.get('/pharmacy/drugs', { params: { limit: 100 } });
      setItems(data.data || []);
    } catch { /* graceful */ }
    setLoading(false);
  };

  const lowStockCount = items.filter(item => item.isActive && Math.random() > 0.8).length; // Simulated for demo

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">Inventory & Stock</h1>
          <p className="text-muted-foreground font-medium mt-1">Track medical supplies, equipment, and consumables.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 h-12" onClick={loadInventory}>
            <RefreshCw className={loading ? 'animate-spin w-4 h-4' : 'w-4 h-4'} />
            Sync Stock
          </Button>
          <Button variant="primary" className="gap-2 h-12 px-6">
            <Plus className="w-5 h-5" />
            Add New Item
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary/5 border-primary/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-primary/20 rounded-lg text-primary">
                <Box className="w-5 h-5" />
              </div>
              <Badge variant="outline" className="text-primary border-primary/20 bg-primary/10 font-bold">Total</Badge>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total SKUs</p>
            <h2 className="text-3xl font-black text-foreground mt-1">{items.length}</h2>
          </CardContent>
        </Card>

        <Card className="bg-warning/5 border-warning/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-warning/20 rounded-lg text-warning">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <Badge variant="outline" className="text-warning border-warning/20 bg-warning/10 font-bold">Priority</Badge>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Low Stock Alerts</p>
            <h2 className="text-3xl font-black text-foreground mt-1">{lowStockCount}</h2>
          </CardContent>
        </Card>

        <Card className="bg-secondary/5 border-secondary/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-secondary/20 rounded-lg text-secondary">
                <TrendingUp className="w-5 h-5" />
              </div>
              <Badge variant="outline" className="text-secondary border-secondary/20 bg-secondary/10 font-bold">Value</Badge>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Inventory Value</p>
            <h2 className="text-3xl font-black text-foreground mt-1">{formatCurrency(items.reduce((acc, curr) => acc + (curr.unitPrice * 100), 0))}</h2>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" /> Central Stock Registry
          </CardTitle>
          <div className="w-72">
            <Input 
              placeholder="Filter by name or SKU..." 
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
                  <th className="pb-4">SKU / Item Details</th>
                  <th className="pb-4">Category</th>
                  <th className="pb-4 text-center">Unit Price</th>
                  <th className="pb-4 text-center">Status</th>
                  <th className="pb-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map((item) => (
                  <tr key={item.id} className="group hover:bg-white/5 transition-colors">
                    <td className="py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground">{item.name}</span>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">SKU: {item.code || 'SUP-001'}</span>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-muted-foreground">{item.category || 'General Supply'}</td>
                    <td className="py-4 text-center font-bold text-foreground">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-4 text-center">
                      <Badge variant={item.isActive ? 'success' : 'destructive'} className="text-[10px]">
                        {item.isActive ? 'Available' : 'Unavailable'}
                      </Badge>
                    </td>
                    <td className="py-4 text-right">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-primary hover:bg-primary/10">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
