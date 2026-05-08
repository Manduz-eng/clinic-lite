'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Shield, 
  Activity, 
  FlaskConical, 
  Pill, 
  Receipt, 
  Lock, 
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function SettingsPage() {
  const [modules, setModules] = useState([
    { id: 'reception', name: 'Reception & Registry', icon: Activity, enabled: true, description: 'Patient registration and visit management' },
    { id: 'triage', name: 'Nursing & Triage', icon: Shield, enabled: true, description: 'Vitals capture and nursing stations' },
    { id: 'opd', name: 'Doctor Consultation', icon: Shield, enabled: true, description: 'Electronic Medical Records and OPD' },
    { id: 'laboratory', name: 'Laboratory LIS', icon: FlaskConical, enabled: true, description: 'Test requests and result management' },
    { id: 'pharmacy', name: 'Pharmacy PIS', icon: Pill, enabled: true, description: 'Dispensing and drug inventory' },
    { id: 'billing', name: 'Billing & Accounts', icon: Receipt, enabled: true, description: 'Invoicing and payment processing' },
  ]);

  const toggleModule = (id: string) => {
    setModules(modules.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
  };

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">System Settings</h1>
          <p className="text-muted-foreground font-medium mt-1">Configure global HMIS parameters and module availability.</p>
        </div>
        <Button variant="primary" className="gap-2 h-12 px-6">
          <Save className="w-5 h-5" />
          Save Configurations
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Settings className="w-5 h-5" /> Feature Flag Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                {modules.map((module) => (
                  <div key={module.id} className="flex items-center justify-between p-6 hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${module.enabled ? 'bg-primary/10 text-primary' : 'bg-white/5 text-muted-foreground'}`}>
                        <module.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">{module.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{module.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={module.enabled ? 'success' : 'outline'} className="text-[10px] uppercase font-bold tracking-widest">
                        {module.enabled ? 'Operational' : 'Disabled'}
                      </Badge>
                      <button 
                        onClick={() => toggleModule(module.id)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${module.enabled ? 'bg-primary' : 'bg-white/10'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${module.enabled ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" /> Security Protocol
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div>
                  <h5 className="text-sm font-bold text-foreground">Enforce Multi-Factor Auth</h5>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Require OTP for all administrative actions</p>
                </div>
                <div className="w-10 h-5 bg-white/10 rounded-full relative">
                   <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-muted-foreground/50" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div>
                  <h5 className="text-sm font-bold text-foreground">Session Timeout (Minutes)</h5>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Automatic sign-out after inactivity</p>
                </div>
                <input type="number" defaultValue={60} className="w-20 bg-background border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/10">
            <CardHeader>
              <CardTitle className="text-sm">System Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Database Sync</span>
                <span className="text-success font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Synchronized
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">API Latency</span>
                <span className="text-foreground font-mono">24ms</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Disk Usage</span>
                <span className="text-foreground font-mono">12%</span>
              </div>
            </CardContent>
          </Card>

          <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mb-4 shadow-xl shadow-primary/20">
              <Activity className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-foreground mb-2">ClinicOS Core Engine</h4>
            <Badge variant="outline" className="mb-4">v.1.00 - Standard Edition</Badge>
            <p className="text-xs text-muted-foreground leading-relaxed">
              All administrative changes are logged for auditing and compliance. Changes take effect across all terminals immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
