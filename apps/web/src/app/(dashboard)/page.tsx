'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';

interface DashboardStats {
  todayVisits: number;
  queuedPatients: number;
  pendingLab: number;
  pendingDispensing: number;
  todayRevenue: number;
  lowStockAlerts: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    todayVisits: 0,
    queuedPatients: 0,
    pendingLab: 0,
    pendingDispensing: 0,
    todayRevenue: 0,
    lowStockAlerts: 0,
  });
  const [queue, setQueue] = useState<any[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [queueRes] = await Promise.all([
        api.get('/visits/queue').catch(() => ({ data: [] })),
      ]);
      const queueData = queueRes.data || [];
      setQueue(queueData);
      setStats((prev) => ({
        ...prev,
        todayVisits: queueData.length,
        queuedPatients: queueData.filter((v: any) => v.status === 'queued').length,
      }));
    } catch {
      // Dashboard loads gracefully even if API is unavailable
    }
  };

  const statCards = [
    { label: "Today's Visits", value: stats.todayVisits, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'In Queue', value: stats.queuedPatients, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Pending Lab', value: stats.pendingLab, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Pending Rx', value: stats.pendingDispensing, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: "Today's Revenue", value: formatCurrency(stats.todayRevenue), color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Stock Alerts', value: stats.lowStockAlerts, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-xl p-4`}>
            <p className="text-sm text-gray-600">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <Card title="Patient Queue (Today)">
        {queue.length === 0 ? (
          <p className="text-gray-500 text-sm">No patients in queue today.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-3 font-medium">#</th>
                  <th className="pb-3 font-medium">Patient</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Priority</th>
                  <th className="pb-3 font-medium">Doctor</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {queue.map((visit: any) => (
                  <tr key={visit.id} className="hover:bg-gray-50">
                    <td className="py-3">{visit.queueNumber}</td>
                    <td className="py-3">
                      <span className="font-medium">{visit.patient?.firstName} {visit.patient?.lastName}</span>
                      <span className="text-gray-400 ml-2 text-xs">{visit.patient?.patientNo}</span>
                    </td>
                    <td className="py-3"><Badge status={visit.status} /></td>
                    <td className="py-3"><Badge status={visit.priority} /></td>
                    <td className="py-3 text-gray-600">
                      {visit.assignedDoctor ? `Dr. ${visit.assignedDoctor.firstName} ${visit.assignedDoctor.lastName}` : '—'}
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
