'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { ToastContainer } from '@/components/ui/toast';
import { useAuthStore } from '@/store/auth-store';
import { Topbar } from '@/components/layout/topbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full shadow-lg shadow-primary/20" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Initializing ClinicOS</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-72 min-h-screen flex flex-col">
        <Topbar />
        <main className="flex-1 pt-20 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
