'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { Bell, Search, LayoutGrid, Users, LogOut, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';

export function Topbar() {
  const { user, tenant, logout } = useAuthStore();
  const router = useRouter();
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="fixed top-0 left-72 right-0 z-20 h-20 bg-background/40 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between px-8 print:hidden">
      <div className="flex items-center gap-8">
        <div className="flex flex-col">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-[0.15em] leading-none mb-1">
            {tenant?.name || 'Main Branch'}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-primary flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              Live System
            </span>
          </div>
        </div>

        <div className="hidden lg:flex items-center bg-white/5 rounded-xl border border-white/5 px-3 py-1.5 gap-2 w-80 group focus-within:border-primary/30 transition-all">
          <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search patient, file or bill..." 
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground/40"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Real-time Clock */}
        <div className="hidden xl:flex items-center gap-2 bg-white/5 border border-white/5 px-4 py-2 rounded-xl text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className="text-xs font-bold tracking-tight">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>

        {/* Queue Button - Requested Feature */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsQueueOpen(true)}
          className="gap-2 border-primary/20 text-primary hover:bg-primary/10"
        >
          <Users className="w-4 h-4" />
          <span className="hidden sm:inline">Active Queue</span>
          <Badge variant="accent" className="ml-1 px-1.5 py-0 min-w-[20px] h-5 justify-center">12</Badge>
        </Button>

        <div className="h-8 w-px bg-white/10 mx-2" />

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
            <Bell className="w-5 h-5" />
            <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent rounded-full border-2 border-background" />
          </Button>

          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <LayoutGrid className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Queue Modal */}
      <Modal 
        isOpen={isQueueOpen} 
        onClose={() => setIsQueueOpen(false)}
        title="Live Patient Queue"
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <Badge variant="default">All (12)</Badge>
            <Badge variant="outline">Triage (3)</Badge>
            <Badge variant="outline">Doctor (4)</Badge>
            <Badge variant="outline">Lab (2)</Badge>
            <Badge variant="outline">Pharmacy (3)</Badge>
          </div>
          
          <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-2">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="glass-card p-4 flex items-center justify-between border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold text-primary">
                    {i}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">John Doe Patient {i}</h4>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5">PID: 2024-00{i}</p>
                  </div>
                </div>
                <Badge variant={i === 1 ? "warning" : "default"} className="text-[10px]">
                  {i === 1 ? "Triage" : "Consultation"}
                </Badge>
              </div>
            ))}
          </div>
          
          <div className="pt-4 flex justify-end">
            <Button variant="ghost" onClick={() => setIsQueueOpen(false)}>Close</Button>
          </div>
        </div>
      </Modal>
    </header>
  );
}
