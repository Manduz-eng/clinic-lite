'use client';

import { useToastStore } from '@/store/toast-store';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border animate-in slide-in-from-right-full duration-300",
            toast.type === 'success' 
              ? "bg-success/10 border-success/20 text-success" 
              : "bg-destructive/10 border-destructive/20 text-destructive"
          )}
          style={{ minWidth: '240px', backdropFilter: 'blur(16px)' }}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 shrink-0" />
          )}
          <span className="text-sm font-bold tracking-tight">{toast.message}</span>
          <button 
            onClick={() => removeToast(toast.id)}
            className="ml-auto p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 opacity-50" />
          </button>
        </div>
      ))}
    </div>
  );
}
