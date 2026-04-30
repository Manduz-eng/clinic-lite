'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api-client';

export default function NursingPage() {
  const [queue, setQueue] = useState<any[]>([]);

  useEffect(() => {
    api.get('/visits/queue', { params: { status: 'in_triage' } })
      .then(({ data }) => setQueue(data))
      .catch(() => {});
  }, []);

  const advanceToDoctor = async (visitId: string) => {
    try {
      await api.put(`/visits/${visitId}/status`, { status: 'with_doctor' });
      setQueue((prev) => prev.filter((v) => v.id !== visitId));
    } catch { /* error */ }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Nursing Station</h1>
      <Card title="Patients from Triage">
        {queue.length === 0 ? (
          <p className="text-gray-500 text-sm">No patients at nursing station.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-gray-500">
                <th className="pb-3 font-medium">#</th>
                <th className="pb-3 font-medium">Patient</th>
                <th className="pb-3 font-medium">Priority</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr></thead>
              <tbody className="divide-y">
                {queue.map((v: any) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="py-3">{v.queueNumber}</td>
                    <td className="py-3 font-medium">{v.patient?.firstName} {v.patient?.lastName}</td>
                    <td className="py-3"><Badge status={v.priority} /></td>
                    <td className="py-3"><Badge status={v.status} /></td>
                    <td className="py-3">
                      <Button size="sm" onClick={() => advanceToDoctor(v.id)}>Send to Doctor</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
