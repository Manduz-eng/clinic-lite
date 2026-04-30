'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import api from '@/lib/api-client';

export default function OPDPage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [showConsult, setShowConsult] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    historyOfIllness: '', examinationFindings: '', assessment: '', plan: '',
    followUpDate: '', icdCode: '', diagnosis: '',
  });

  useEffect(() => {
    api.get('/visits/queue', { params: { status: 'with_doctor' } })
      .then(({ data }) => setQueue(data))
      .catch(() => {});
  }, []);

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const noteData: any = {
        visitId: selectedVisit.id,
        historyOfIllness: form.historyOfIllness,
        examinationFindings: form.examinationFindings,
        assessment: form.assessment,
        plan: form.plan,
        followUpDate: form.followUpDate || undefined,
      };
      if (form.icdCode && form.diagnosis) {
        noteData.diagnoses = [{ icdCode: form.icdCode, description: form.diagnosis, diagnosisType: 'primary' }];
      }
      await api.post('/opd/clinical-notes', noteData);
      setShowConsult(false);
      setQueue((prev) => prev.filter((v) => v.id !== selectedVisit.id));
    } catch { /* error */ }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">OPD — Doctor&apos;s Desk</h1>
      <Card title="Patients to See">
        {queue.length === 0 ? (
          <p className="text-gray-500 text-sm">No patients waiting.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-gray-500">
                <th className="pb-3 font-medium">#</th>
                <th className="pb-3 font-medium">Patient</th>
                <th className="pb-3 font-medium">Complaint</th>
                <th className="pb-3 font-medium">Priority</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr></thead>
              <tbody className="divide-y">
                {queue.map((v: any) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="py-3">{v.queueNumber}</td>
                    <td className="py-3 font-medium">{v.patient?.firstName} {v.patient?.lastName}</td>
                    <td className="py-3 text-gray-600 max-w-xs truncate">{v.chiefComplaint || '—'}</td>
                    <td className="py-3"><Badge status={v.priority} /></td>
                    <td className="py-3">
                      <Button size="sm" onClick={() => { setSelectedVisit(v); setShowConsult(true); }}>Consult</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal isOpen={showConsult} onClose={() => setShowConsult(false)} title="Clinical Consultation" size="xl">
        <form onSubmit={handleSaveNote} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">History of Present Illness</label>
            <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} value={form.historyOfIllness} onChange={(e) => setForm({ ...form, historyOfIllness: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Examination Findings</label>
            <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} value={form.examinationFindings} onChange={(e) => setForm({ ...form, examinationFindings: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assessment</label>
            <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} value={form.assessment} onChange={(e) => setForm({ ...form, assessment: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="ICD-10 Code" value={form.icdCode} onChange={(e) => setForm({ ...form, icdCode: e.target.value })} placeholder="e.g. J06.9" />
            <Input label="Diagnosis" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} placeholder="e.g. Acute Upper Respiratory Infection" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Treatment Plan</label>
            <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} />
          </div>
          <Input label="Follow-up Date" type="date" value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setShowConsult(false)}>Cancel</Button>
            <Button type="submit" loading={loading}>Save Clinical Note</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
