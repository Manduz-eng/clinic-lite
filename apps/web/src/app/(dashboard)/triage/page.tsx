'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import api from '@/lib/api-client';
import { 
  Activity, 
  Thermometer, 
  Scale, 
  Wind, 
  Droplets, 
  Heart, 
  ClipboardCheck, 
  Users,
  ArrowRight
} from 'lucide-react';

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
    <div className="space-y-8 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">Triage Station</h1>
          <p className="text-muted-foreground font-medium mt-1">Record vitals and assess patients for consultation.</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 border border-white/5 px-4 py-2 rounded-2xl">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-bold text-foreground">{queue.length} Patients Waiting</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nursing Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-widest text-muted-foreground font-bold border-b border-white/5">
                  <th className="pb-4">#</th>
                  <th className="pb-4">Patient</th>
                  <th className="pb-4 text-center">Priority</th>
                  <th className="pb-4">Chief Complaint</th>
                  <th className="pb-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {queue.map((v: any) => (
                  <tr key={v.id} className="group hover:bg-white/5 transition-colors">
                    <td className="py-4">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-primary text-xs">
                        {v.queueNumber}
                      </div>
                    </td>
                    <td className="py-4 font-bold text-foreground">{v.patient?.firstName} {v.patient?.lastName}</td>
                    <td className="py-4 text-center">
                      <Badge variant={v.priority === 'urgent' ? 'destructive' : 'default'}>
                        {v.priority}
                      </Badge>
                    </td>
                    <td className="py-4 text-muted-foreground text-sm max-w-xs truncate">{v.chiefComplaint || '—'}</td>
                    <td className="py-4 text-right">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="gap-2"
                        onClick={() => { setSelectedVisit(v); setShowVitals(true); }}
                      >
                        Capture Vitals <Activity className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {queue.length === 0 && (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mb-6">
                  <ClipboardCheck className="w-10 h-10 text-muted-foreground/30" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Queue is Empty</h3>
                <p className="text-muted-foreground">All patients have been triaged.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={showVitals} onClose={() => setShowVitals(false)} title="Vital Signs Recording" className="max-w-3xl">
        <div className="mb-8 p-6 bg-white/5 rounded-[2rem] border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-secondary/20 flex items-center justify-center font-bold text-secondary text-xl">
              {selectedVisit?.patient?.firstName?.charAt(0)}
            </div>
            <div>
              <h4 className="text-lg font-bold text-foreground">{selectedVisit?.patient?.firstName} {selectedVisit?.patient?.lastName}</h4>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Queue No: #{selectedVisit?.queueNumber}</p>
            </div>
          </div>
          <Badge variant="accent" className="h-8 px-4 font-bold uppercase tracking-widest text-[10px]">Triage Phase</Badge>
        </div>

        <form onSubmit={handleRecordVitals} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Input 
              label="Blood Pressure (S)" 
              placeholder="120" 
              icon={<Activity className="w-4 h-4" />}
              value={form.systolicBp} 
              onChange={(e) => setForm({ ...form, systolicBp: e.target.value })} 
            />
            <Input 
              label="Blood Pressure (D)" 
              placeholder="80" 
              icon={<Activity className="w-4 h-4" />}
              value={form.diastolicBp} 
              onChange={(e) => setForm({ ...form, diastolicBp: e.target.value })} 
            />
            <Input 
              label="Heart Rate" 
              placeholder="72 bpm" 
              icon={<Heart className="w-4 h-4 text-destructive" />}
              value={form.heartRate} 
              onChange={(e) => setForm({ ...form, heartRate: e.target.value })} 
            />
            <Input 
              label="Temperature" 
              placeholder="36.5 °C" 
              icon={<Thermometer className="w-4 h-4 text-warning" />}
              value={form.temperature} 
              onChange={(e) => setForm({ ...form, temperature: e.target.value })} 
            />
            <Input 
              label="Weight" 
              placeholder="70 kg" 
              icon={<Scale className="w-4 h-4 text-primary" />}
              value={form.weight} 
              onChange={(e) => setForm({ ...form, weight: e.target.value })} 
            />
            <Input 
              label="Height" 
              placeholder="175 cm" 
              icon={<Scale className="w-4 h-4 text-primary" />}
              value={form.height} 
              onChange={(e) => setForm({ ...form, height: e.target.value })} 
            />
            <Input 
              label="Resp. Rate" 
              placeholder="18" 
              icon={<Wind className="w-4 h-4 text-accent" />}
              value={form.respiratoryRate} 
              onChange={(e) => setForm({ ...form, respiratoryRate: e.target.value })} 
            />
            <Input 
              label="SpO2 (%)" 
              placeholder="98%" 
              icon={<Droplets className="w-4 h-4 text-secondary" />}
              value={form.oxygenSaturation} 
              onChange={(e) => setForm({ ...form, oxygenSaturation: e.target.value })} 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Nursing Observations</label>
            <textarea 
              className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm min-h-[100px]" 
              placeholder="Any notable observations or complaints..."
              value={form.notes} 
              onChange={(e) => setForm({ ...form, notes: e.target.value })} 
            />
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
            <Button variant="ghost" type="button" onClick={() => setShowVitals(false)} className="font-bold">Discard</Button>
            <Button type="submit" loading={loading} className="gap-2 px-12">
              Commit & Forward to Doctor <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
