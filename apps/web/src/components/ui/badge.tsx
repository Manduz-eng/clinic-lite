'use client';

import { cn } from '@/lib/utils';
import { getStatusColor } from '@/lib/utils';

interface BadgeProps {
  status: string;
  label?: string;
}

export function Badge({ status, label }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
        getStatusColor(status)
      )}
    >
      {label || status.replace(/_/g, ' ')}
    </span>
  );
}
