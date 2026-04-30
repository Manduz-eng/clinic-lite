'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import api from '@/lib/api-client';

export default function TriagePage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [showVitals, setShowVitals] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    systolicBp: '', diastolicBp: '', heartRate: '', temperature: '',
    weight: '', height: '', respiratoryRate: '', oxygenSaturation: '', notes: '',
  });

  useEffect(() => { loadQueue(); }, []);

  const loadQueue = async () => {
    try {
      const { data } = await api.get('/visits/queue', { params: { status: 'queued' } });
      setQueue(data);
    } catch { /* graceful */ }
  };

  const handleRecordVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const vitals: any = { visitId: selectedVisit.id };
      if (form.systolicBp) vitals.systolicBp = Number(form.systolicBp);
      if (form.diastolicBp) vitals.diastolicBp = Number(form.diastolicBp);
      if (form.heartRate) vitals.heartRate = Number(form.heartRate);
      if (form.temperature) vitals.temperature = Number(form.temperature);
      if (form.weight) vitals.weight = Number(form.weight);
      if (form.height) vitals.height = Number(form.height);
      if (form.respiratoryRate) vitals.respiratoryRate = Number(form.respiratoryRate);
      if (form.oxygenSaturation) vitals.oxygenSaturation = Number(form.oxygenSaturation);
      if (form.notes) vitals.notes = form.notes;

      await api.post('/vitals', vitals);
      setShowVitals(false);
      setForm({ systolicBp: '', diastolicBp: '', heartRate: '', temperature: '', weight: '', height: '', respiratoryRate: '', oxygenSaturation: '', notes: '' });
      loadQueue();
    } catch { /* error */ }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Triage</h1>

      <Card title="Patients Awaiting Triage">
        {queue.length === 0 ? (
          <p className="text-gray-500 text-sm">No patients waiting for triage.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-gray-500">
                <th className="pb-3 font-medium">#</th>
                <th className="pb-3 font-medium">Patient</th>
                <th className="pb-3 font-medium">Priority</th>
                <th className="pb-3 font-medium">Complaint</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr></thead>
              <tbody className="divide-y">
                {queue.map((v: any) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="py-3">{v.queueNumber}</td>
                    <td className="py-3 font-medium">{v.patient?.firstName} {v.patient?.lastName}</td>
                    <td className="py-3"><Badge status={v.priority} /></td>
                    <td className="py-3 text-gray-600 max-w-xs truncate">{v.chiefComplaint || '—'}</td>
                    <td className="py-3">
                      <Button size="sm" onClick={() => { setSelectedVisit(v); setShowVitals(true); }}>
                        Record Vitals
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal isOpen={showVitals} onClose={() => setShowVitals(false)} title="Record Vital Signs" size="lg">
        <form onSubmit={handleRecordVitals} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Systolic BP (mmHg)" type="number" value={form.systolicBp} onChange={(e) => setForm({ ...form, systolicBp: e.target.value })} />
            <Input label="Diastolic BP (mmHg)" type="number" value={form.diastolicBp} onChange={(e) => setForm({ ...form, diastolicBp: e.target.value })} />
            <Input label="Heart Rate (bpm)" type="number" value={form.heartRate} onChange={(e) => setForm({ ...form, heartRate: e.target.value })} />
            <Input label="Temperature (°C)" type="number" step="0.1" value={form.temperature} onChange={(e) => setForm({ ...form, temperature: e.target.value })} />
            <Input label="Weight (kg)" type="number" step="0.1" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
            <Input label="Height (cm)" type="number" step="0.1" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} />
            <Input label="Respiratory Rate" type="number" value={form.respiratoryRate} onChange={(e) => setForm({ ...form, respiratoryRate: e.target.value })} />
            <Input label="SpO2 (%)" type="number" step="0.1" value={form.oxygenSaturation} onChange={(e) => setForm({ ...form, oxygenSaturation: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setShowVitals(false)}>Cancel</Button>
            <Button type="submit" loading={loading}>Save Vitals</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
