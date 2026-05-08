'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Settings, Shield, Bell, Database, Globe, UserCog } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function ConfigurationPage() {
  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between bg-card/20 p-4 rounded-2xl border border-white/5 backdrop-blur-md h-16">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
            <Settings className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-black text-foreground font-display tracking-tight uppercase">System Configuration</h1>
        </div>
        <Badge variant="primary" className="h-9 px-4 text-[10px] font-black tracking-widest uppercase">Master Control</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-white/5">
          <CardHeader className="bg-white/5 py-4 flex flex-row items-center gap-3">
            <Database className="w-5 h-5 text-blue-400" />
            <CardTitle className="text-sm font-black uppercase tracking-tight">Database & Storage</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-4">
               <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black uppercase tracking-tight">Current Engine</span>
                    <span className="text-[10px] text-muted-foreground font-bold">SQLite (Local Development)</span>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-500 border-none text-[9px]">Active</Badge>
               </div>
               <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 opacity-50">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black uppercase tracking-tight">Supabase Sync</span>
                    <span className="text-[10px] text-muted-foreground font-bold">Cloud Persistence Layer</span>
                  </div>
                  <Badge className="bg-white/10 text-white/40 border-none text-[9px]">Disconnected</Badge>
               </div>
            </div>
            <Button variant="primary" className="w-full h-10 text-[10px] font-black uppercase tracking-widest mt-2">Initialize Migration</Button>
          </CardContent>
        </Card>

        <Card className="border-white/5">
          <CardHeader className="bg-white/5 py-4 flex flex-row items-center gap-3">
            <Shield className="w-5 h-5 text-rose-400" />
            <CardTitle className="text-sm font-black uppercase tracking-tight">Security & RBAC</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
             <div className="space-y-2">
                <ConfigItem label="Multi-Factor Authentication" enabled={false} />
                <ConfigItem label="IP Restricted Access" enabled={true} />
                <ConfigItem label="Audit Logging (Functionality)" enabled={true} />
                <ConfigItem label="Audit Logging (Usage)" enabled={true} />
             </div>
          </CardContent>
        </Card>

        <Card className="border-white/5">
          <CardHeader className="bg-white/5 py-4 flex flex-row items-center gap-3">
            <Globe className="w-5 h-5 text-emerald-400" />
            <CardTitle className="text-sm font-black uppercase tracking-tight">Localization & Regional</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
             <div className="space-y-2 text-[11px] font-bold">
                <div className="flex justify-between py-2 border-b border-white/5">
                   <span className="text-muted-foreground">Currency</span>
                   <span>Kenya Shillings (KES)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                   <span className="text-muted-foreground">Time Zone</span>
                   <span>(GMT+03:00) East Africa Time</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                   <span className="text-muted-foreground">System Language</span>
                   <span>English (United Kingdom)</span>
                </div>
             </div>
          </CardContent>
        </Card>

        <Card className="border-white/5">
          <CardHeader className="bg-white/5 py-4 flex flex-row items-center gap-3">
            <UserCog className="w-5 h-5 text-primary" />
            <CardTitle className="text-sm font-black uppercase tracking-tight">Staffing & Sessions</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
             <div className="space-y-4">
               <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Session Timeout (Minutes)</label>
                 <input type="number" defaultValue={60} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold" />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Max Concurrent Logins</label>
                 <input type="number" defaultValue={1} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold" />
               </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ConfigItem({ label, enabled }: { label: string, enabled: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
      <span className="text-[11px] font-black uppercase tracking-tight">{label}</span>
      <div className={cn(
        "w-8 h-4 rounded-full relative transition-colors",
        enabled ? "bg-primary" : "bg-white/10"
      )}>
        <div className={cn(
          "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all shadow-sm",
          enabled ? "right-0.5" : "left-0.5"
        )} />
      </div>
    </div>
  );
}
