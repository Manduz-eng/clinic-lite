'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import api from '@/lib/api-client';
import { 
  FlaskConical, 
  Beaker, 
  Microscope, 
  ClipboardCheck, 
  AlertCircle,
  Clock,
  ArrowRight,
  TestTube2
} from 'lucide-react';

export default function LaboratoryPage() {
  const [requests, setRequests] = useState<any>({ data: [], pagination: { total: 0 } });
  const [showResult, setShowResult] = useState(false);
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [resultForm, setResultForm] = useState({ 
    resultValue: '', 
    unit: '', 
    referenceRange: '', 
    isAbnormal: false, 
    notes: '' 
  });

  useEffect(() => { loadRequests(); }, [filter]);

  const loadRequests = async () => {
    try {
      const { data } = await api.get('/laboratory/requests', { params: { status: filter || undefined, limit: 50 } });
      setRequests(data);
    } catch { /* graceful */ }
  };

  const handleRecordResult = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/laboratory/results', { labRequestId: selectedReq.id, ...resultForm });
      setShowResult(false);
      loadRequests();
    } catch { /* error */ }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/laboratory/requests/${id}/status`, { status });
      loadRequests();
    } catch { /* error */ }
  };

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-display text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70">Laboratory Information System</h1>
          <p className="text-muted-foreground font-medium mt-1">Manage test requests, sample tracking, and result entry.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="h-10 px-4 border-white/10 bg-white/5 font-bold">
            {requests.data?.length || 0} Total Requests
          </Badge>
          <div className="w-48">
            <Select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)} 
              options={[
                { value: '', label: 'All Statuses' }, 
                { value: 'requested', label: 'Requested' },
                { value: 'sample_collected', label: 'Sample Collected' }, 
                { value: 'processing', label: 'Processing' },
                { value: 'completed', label: 'Completed' },
              ]} 
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Investigation Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-widest text-muted-foreground font-bold border-b border-white/5">
                  <th className="pb-4">Test Details</th>
                  <th className="pb-4">Patient</th>
                  <th className="pb-4 text-center">Priority</th>
                  <th className="pb-4 text-center">Current Status</th>
                  <th className="pb-4 text-right">Workflow Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(requests.data || []).map((r: any) => (
                  <tr key={r.id} className="group hover:bg-white/5 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <TestTube2 className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-foreground">{r.test?.name}</span>
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">{r.test?.code}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 font-bold text-foreground">{r.visit?.patient?.firstName} {r.visit?.patient?.lastName}</td>
                    <td className="py-4 text-center">
                      <Badge variant={r.priority === 'emergency' ? 'destructive' : r.priority === 'urgent' ? 'warning' : 'default'}>
                        {r.priority}
                      </Badge>
                    </td>
                    <td className="py-4 text-center">
                      <Badge variant={r.status === 'completed' ? 'success' : 'outline'} className="capitalize">
                        {r.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-4 text-right space-x-2">
                      {r.status === 'requested' && (
                        <Button size="sm" variant="outline" className="text-[10px] uppercase font-bold" onClick={() => updateStatus(r.id, 'sample_collected')}>
                          Collect Sample
                        </Button>
                      )}
                      {r.status === 'sample_collected' && (
                        <Button size="sm" variant="secondary" className="text-[10px] uppercase font-bold" onClick={() => updateStatus(r.id, 'processing')}>
                          Start Processing
                        </Button>
                      )}
                      {(r.status === 'processing' || r.status === 'sample_collected') && !r.result && (
                        <Button size="sm" variant="accent" className="gap-2 text-xs font-bold" onClick={() => { setSelectedReq(r); setShowResult(true); }}>
                          Result Entry <ArrowRight className="w-3 h-3" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {requests.data?.length === 0 && (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mb-6">
                  <Microscope className="w-10 h-10 text-muted-foreground/30" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No Active Requests</h3>
                <p className="text-muted-foreground">The laboratory queue is currently clear.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={showResult} onClose={() => setShowResult(false)} title="Laboratory Result Documentation" className="max-w-2xl">
        <div className="mb-8 p-6 bg-white/5 rounded-[2rem] border border-white/5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
            <FlaskConical className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-bold text-foreground">{selectedReq?.test?.name}</h4>
            <p className="text-xs text-muted-foreground font-medium">Patient: <span className="text-foreground font-bold">{selectedReq?.visit?.patient?.firstName} {selectedReq?.visit?.patient?.lastName}</span></p>
          </div>
          <Badge variant="outline" className="border-primary/20 text-primary uppercase text-[10px] tracking-widest font-bold">Entry Phase</Badge>
        </div>

        <form onSubmit={handleRecordResult} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Quantitative / Qualitative Result" 
              required 
              placeholder="e.g. 12.5"
              value={resultForm.resultValue} 
              onChange={(e) => setResultForm({ ...resultForm, resultValue: e.target.value })} 
            />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Unit" placeholder="g/dL" value={resultForm.unit} onChange={(e) => setResultForm({ ...resultForm, unit: e.target.value })} />
              <Input label="Ref Range" placeholder="11.0 - 15.0" value={resultForm.referenceRange} onChange={(e) => setResultForm({ ...resultForm, referenceRange: e.target.value })} />
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
            <input 
              type="checkbox" 
              id="abnormal"
              className="w-5 h-5 rounded-md border-white/10 bg-background text-primary focus:ring-primary/20"
              checked={resultForm.isAbnormal} 
              onChange={(e) => setResultForm({ ...resultForm, isAbnormal: e.target.checked })} 
            />
            <label htmlFor="abnormal" className="text-sm font-bold text-foreground cursor-pointer select-none">
              Flag as Abnormal / Critical Result
            </label>
            {resultForm.isAbnormal && (
              <Badge variant="destructive" className="ml-auto animate-pulse">Critical Alert</Badge>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Pathologist / Lab Notes</label>
            <textarea 
              className="w-full bg-background/50 border border-border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm min-h-[100px]" 
              placeholder="Observations about sample quality or result patterns..."
              value={resultForm.notes} 
              onChange={(e) => setResultForm({ ...resultForm, notes: e.target.value })} 
            />
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
            <Button variant="ghost" type="button" onClick={() => setShowResult(false)} className="font-bold">Cancel</Button>
            <Button type="submit" loading={loading} className="gap-2 px-12">
              <ClipboardCheck className="w-4 h-4" /> Finalize Result
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
