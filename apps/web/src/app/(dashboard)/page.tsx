'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/stat-card';
import api from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';
import { 
  Users, 
  Clock, 
  FlaskConical, 
  Pill, 
  TrendingUp, 
  AlertCircle,
  ArrowRight,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardStats {
  todayVisits: number;
  queuedPatients: number;
  pendingLab: number;
  pendingDispensing: number;
  todayRevenue: number;
  lowStockAlerts: number;
}

export default function DashboardPage() {
  const [time, setTime] = useState(new Date());
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
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">Dashboard</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-muted-foreground font-medium">Welcome back. Here&apos;s what&apos;s happening today.</p>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <Clock className="w-4 h-4" />
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            Generate Report
          </Button>
          <Button variant="primary" className="gap-2">
            New Patient Visit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard 
          title="Today's Visits" 
          value={stats.todayVisits} 
          icon={<Users className="w-5 h-5" />} 
          trend={{ value: 12, isUp: true }}
          variant="primary"
        />
        <StatCard 
          title="In Queue" 
          value={stats.queuedPatients} 
          icon={<Clock className="w-5 h-5" />} 
          description="Waiting for triage"
          variant="secondary"
        />
        <StatCard 
          title="Pending Lab" 
          value={stats.pendingLab} 
          icon={<FlaskConical className="w-5 h-5" />} 
          variant="accent"
        />
        <StatCard 
          title="Pending Rx" 
          value={stats.pendingDispensing} 
          icon={<Pill className="w-5 h-5" />} 
          variant="primary"
        />
        <StatCard 
          title="Revenue" 
          value={formatCurrency(stats.todayRevenue)} 
          icon={<TrendingUp className="w-5 h-5" />} 
          trend={{ value: 8, isUp: true }}
          variant="secondary"
        />
        <StatCard 
          title="Stock Alerts" 
          value={stats.lowStockAlerts} 
          icon={<AlertCircle className="w-5 h-5" />} 
          variant="accent"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Live Patient Queue</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary font-bold gap-2">
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {queue.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <p className="text-muted-foreground font-medium">No patients in queue yet.</p>
                <Button variant="ghost" className="mt-2 text-primary font-bold">Register Patient</Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-widest text-muted-foreground font-bold border-b border-white/5">
                      <th className="pb-4">#</th>
                      <th className="pb-4">Patient Details</th>
                      <th className="pb-4 text-center">Status</th>
                      <th className="pb-4 text-center">Priority</th>
                      <th className="pb-4">Assigned Doctor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {queue.map((visit: any) => (
                      <tr key={visit.id} className="group hover:bg-white/5 transition-colors">
                        <td className="py-4 text-sm font-bold text-muted-foreground">#{visit.queueNumber}</td>
                        <td className="py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-foreground">{visit.patient?.firstName} {visit.patient?.lastName}</span>
                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{visit.patient?.patientNo}</span>
                          </div>
                        </td>
                        <td className="py-4 text-center">
                          <Badge variant={visit.status === 'queued' ? 'warning' : 'success'}>
                            {visit.status}
                          </Badge>
                        </td>
                        <td className="py-4 text-center">
                          <Badge variant={visit.priority === 'urgent' ? 'destructive' : 'outline'}>
                            {visit.priority}
                          </Badge>
                        </td>
                        <td className="py-4">
                          <span className="text-sm font-medium text-muted-foreground">
                            {visit.assignedDoctor ? `Dr. ${visit.assignedDoctor.firstName}` : 'Not Assigned'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Register New Patient', icon: Users, variant: 'primary' as const },
              { label: 'Check Lab Results', icon: FlaskConical, variant: 'accent' as const },
              { label: 'Dispense Medicine', icon: Pill, variant: 'secondary' as const },
            ].map((action) => (
              <Button key={action.label} variant={action.variant} className="w-full justify-start gap-4 h-14 px-4 text-sm font-bold">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <action.icon className="w-4 h-4" />
                </div>
                {action.label}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
