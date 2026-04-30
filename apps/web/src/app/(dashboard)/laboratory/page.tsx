'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import api from '@/lib/api-client';

export default function LaboratoryPage() {
  const [requests, setRequests] = useState<any>({ data: [], pagination: { total: 0 } });
  const [showResult, setShowResult] = useState(false);
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [resultForm, setResultForm] = useState({ resultValue: '', unit: '', referenceRange: '', isAbnormal: false, notes: '' });

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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Laboratory</h1>
      <Card title="Lab Requests" action={
        <Select value={filter} onChange={(e) => setFilter(e.target.value)} options={[
          { value: '', label: 'All' }, { value: 'requested', label: 'Requested' },
          { value: 'sample_collected', label: 'Sample Collected' }, { value: 'processing', label: 'Processing' },
          { value: 'completed', label: 'Completed' },
        ]} />
      }>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-gray-500">
              <th className="pb-3 font-medium">Patient</th>
              <th className="pb-3 font-medium">Test</th>
              <th className="pb-3 font-medium">Priority</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Actions</th>
            </tr></thead>
            <tbody className="divide-y">
              {(requests.data || []).map((r: any) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="py-3 font-medium">{r.visit?.patient?.firstName} {r.visit?.patient?.lastName}</td>
                  <td className="py-3">{r.test?.name}</td>
                  <td className="py-3"><Badge status={r.priority} /></td>
                  <td className="py-3"><Badge status={r.status} /></td>
                  <td className="py-3 space-x-2">
                    {r.status === 'requested' && <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, 'sample_collected')}>Collect</Button>}
                    {r.status === 'sample_collected' && <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, 'processing')}>Process</Button>}
                    {(r.status === 'processing' || r.status === 'sample_collected') && !r.result && (
                      <Button size="sm" onClick={() => { setSelectedReq(r); setShowResult(true); }}>Enter Result</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {requests.data?.length === 0 && <p className="text-gray-500 text-center py-8">No lab requests.</p>}
        </div>
      </Card>

      <Modal isOpen={showResult} onClose={() => setShowResult(false)} title="Enter Lab Result">
        <form onSubmit={handleRecordResult} className="space-y-4">
          <Input label="Result Value" required value={resultForm.resultValue} onChange={(e) => setResultForm({ ...resultForm, resultValue: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Unit" value={resultForm.unit} onChange={(e) => setResultForm({ ...resultForm, unit: e.target.value })} />
            <Input label="Reference Range" value={resultForm.referenceRange} onChange={(e) => setResultForm({ ...resultForm, referenceRange: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={resultForm.isAbnormal} onChange={(e) => setResultForm({ ...resultForm, isAbnormal: e.target.checked })} />
            Abnormal result
          </label>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} value={resultForm.notes} onChange={(e) => setResultForm({ ...resultForm, notes: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setShowResult(false)}>Cancel</Button>
            <Button type="submit" loading={loading}>Save Result</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
