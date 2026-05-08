'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import api from '@/lib/api-client';
import { 
  Stethoscope, 
  History, 
  ClipboardList, 
  FlaskConical, 
  Pill, 
  Activity, 
  Thermometer, 
  Scale, 
  Save,
  User,
  Clock,
  ArrowRight
} from 'lucide-react';

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
    loadQueue();
  }, []);

  const loadQueue = async () => {
    try {
      const { data } = await api.get('/visits/queue', { params: { status: 'with_doctor' } });
      setQueue(data);
    } catch { /* graceful */ }
  };

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
      loadQueue();
    } catch { /* error */ }
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">Doctor&apos;s Desk</h1>
          <p className="text-muted-foreground font-medium mt-1">Clinical consultation and electronic medical records.</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 border border-white/5 px-4 py-2 rounded-2xl">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-sm font-bold text-foreground">{queue.length} Awaiting Consultation</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Consultation Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-widest text-muted-foreground font-bold border-b border-white/5">
                  <th className="pb-4">Queue #</th>
                  <th className="pb-4">Patient</th>
                  <th className="pb-4">Complaint</th>
                  <th className="pb-4 text-center">Vitals Status</th>
                  <th className="pb-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {queue.map((v: any) => (
                  <tr key={v.id} className="group hover:bg-white/5 transition-colors">
                    <td className="py-4 font-black text-primary">#{v.queueNumber}</td>
                    <td className="py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground">{v.patient?.firstName} {v.patient?.lastName}</span>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">PID: {v.patient?.patientNo}</span>
                      </div>
                    </td>
                    <td className="py-4 text-muted-foreground text-sm max-w-xs truncate">{v.chiefComplaint || 'No complaint noted'}</td>
                    <td className="py-4 text-center">
                      <Badge variant="success" className="gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-white" />
                        Captured
                      </Badge>
                    </td>
                    <td className="py-4 text-right">
                      <Button 
                        size="sm" 
                        variant="accent" 
                        className="gap-2"
                        onClick={() => { setSelectedVisit(v); setShowConsult(true); }}
                      >
                        Open Case <Stethoscope className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {queue.length === 0 && (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mb-6">
                  <Stethoscope className="w-10 h-10 text-muted-foreground/30" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No Active Consultations</h3>
                <p className="text-muted-foreground">The waiting room is currently empty.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={showConsult} onClose={() => setShowConsult(false)} title="Clinical Consultation" className="max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient Info & Vitals Sidebar */}
          <div className="space-y-6">
            <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center font-bold text-primary text-xl">
                  {selectedVisit?.patient?.firstName?.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-foreground">{selectedVisit?.patient?.firstName} {selectedVisit?.patient?.lastName}</h4>
                  <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest">{selectedVisit?.patient?.patientNo}</Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-background/50 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-bold tracking-tight">
                    <Activity className="w-3 h-3" /> BP
                  </div>
                  <span className="text-sm font-bold text-foreground">120/80</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-background/50 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-bold tracking-tight">
                    <Thermometer className="w-3 h-3" /> Temp
                  </div>
                  <span className="text-sm font-bold text-foreground">36.5°C</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-background/50 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-bold tracking-tight">
                    <Scale className="w-3 h-3" /> Weight
                  </div>
                  <span className="text-sm font-bold text-foreground">72 kg</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-3 h-12">
                <History className="w-4 h-4" /> Medical History
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3 h-12">
                <FlaskConical className="w-4 h-4" /> Lab Investigations
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3 h-12">
                <Pill className="w-4 h-4" /> Pharmacy Orders
              </Button>
            </div>
          </div>

          {/* Clinical Entry Area */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSaveNote} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">History of Present Illness</label>
                  <textarea 
                    className="w-full bg-background/50 border border-border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm min-h-[120px]" 
                    placeholder="Describe symptoms, duration, and progression..."
                    value={form.historyOfIllness} 
                    onChange={(e) => setForm({ ...form, historyOfIllness: e.target.value })} 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Examination Findings</label>
                  <textarea 
                    className="w-full bg-background/50 border border-border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm min-h-[100px]" 
                    placeholder="Systemic examination, local findings..."
                    value={form.examinationFindings} 
                    onChange={(e) => setForm({ ...form, examinationFindings: e.target.value })} 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                  <Input label="ICD-10 / Code" value={form.icdCode} onChange={(e) => setForm({ ...form, icdCode: e.target.value })} placeholder="J06.9" />
                  <Input label="Primary Diagnosis" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} placeholder="Acute URI" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Management Plan</label>
                  <textarea 
                    className="w-full bg-background/50 border border-border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm min-h-[100px]" 
                    placeholder="Medications, referrals, lifestyle advice..."
                    value={form.plan} 
                    onChange={(e) => setForm({ ...form, plan: e.target.value })} 
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
                <Button variant="ghost" type="button" onClick={() => setShowConsult(false)} className="font-bold">Save Draft</Button>
                <Button type="submit" loading={loading} className="gap-2 px-12">
                  <Save className="w-4 h-4" /> Finalize Consultation
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </div>
  );
}
