'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
            {label}
          </label>
        )}
        <div className="relative group">
          <select
            ref={ref}
            className={cn(
              'w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 outline-none appearance-none transition-all',
              'focus:ring-2 focus:ring-primary/20 focus:border-primary',
              'text-sm text-foreground',
              error && 'border-destructive focus:ring-destructive/20 focus:border-destructive',
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-card text-foreground">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && <p className="text-[10px] text-destructive font-medium ml-1">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
