'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20',
    secondary: 'bg-secondary text-secondary-foreground hover:opacity-90 shadow-lg shadow-secondary/20',
    accent: 'bg-accent text-accent-foreground hover:opacity-90 shadow-lg shadow-accent/20',
    danger: 'bg-destructive text-white hover:bg-destructive/90',
    ghost: 'hover:bg-white/5 text-foreground',
    outline: 'border border-border text-foreground hover:bg-white/5',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-5 py-2.5 text-sm rounded-xl',
    lg: 'px-8 py-3.5 text-base rounded-2xl',
    icon: 'p-2.5 rounded-xl',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : null}
      {children}
    </button>
  );
}
