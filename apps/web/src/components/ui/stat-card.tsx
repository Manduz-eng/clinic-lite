'use client';

import React from 'react';
import { Card } from './card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isUp: boolean;
  };
  className?: string;
  variant?: 'primary' | 'secondary' | 'accent';
}

export function StatCard({ 
  title, 
  value, 
  icon, 
  description, 
  trend, 
  className,
  variant = 'primary'
}: StatCardProps) {
  const variantStyles = {
    primary: 'text-primary bg-primary/10',
    secondary: 'text-secondary bg-secondary/10',
    accent: 'text-accent bg-accent/10',
  };

  return (
    <Card className={cn('p-5 overflow-hidden relative', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-2xl font-bold mt-1 font-display tracking-tight">{value}</h3>
        </div>
        <div className={cn('p-3 rounded-xl transition-all', variantStyles[variant])}>
          {icon}
        </div>
      </div>
      
      {(description || trend) && (
        <div className="mt-4 flex items-center gap-2">
          {trend && (
            <span className={cn(
              'text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1',
              trend.isUp ? 'text-success bg-success/10' : 'text-destructive bg-destructive/10'
            )}>
              {trend.isUp ? '↑' : '↓'} {trend.value}%
            </span>
          )}
          {description && (
            <p className="text-xs text-muted-foreground font-medium">{description}</p>
          )}
        </div>
      )}

      {/* Subtle Background Glow */}
      <div className={cn(
        'absolute -right-4 -bottom-4 w-24 h-24 blur-3xl opacity-10 rounded-full',
        variant === 'primary' ? 'bg-primary' : variant === 'secondary' ? 'bg-secondary' : 'bg-accent'
      )} />
    </Card>
  );
}
