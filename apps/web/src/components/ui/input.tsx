'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 outline-none transition-all',
              'focus:ring-2 focus:ring-primary/20 focus:border-primary',
              'placeholder:text-muted-foreground/50 text-sm',
              icon && 'pl-11',
              error && 'border-destructive focus:ring-destructive/20 focus:border-destructive',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-[10px] text-destructive font-medium ml-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
