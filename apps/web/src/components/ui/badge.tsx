'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'accent' | 'success' | 'warning' | 'destructive' | 'outline';
}

export function Badge({ 
  className, 
  variant = 'default', 
  ...props 
}: BadgeProps) {
  const variants = {
    default: 'bg-primary/15 text-primary border-primary/20',
    secondary: 'bg-secondary/15 text-secondary border-secondary/20',
    accent: 'bg-accent/15 text-accent border-accent/20',
    success: 'bg-success/15 text-success border-success/20',
    warning: 'bg-warning/15 text-warning border-warning/20',
    destructive: 'bg-destructive/15 text-destructive border-destructive/20',
    outline: 'bg-transparent text-foreground border-border',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
