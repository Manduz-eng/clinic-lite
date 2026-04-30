export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ');
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCurrency(amount: number | string): string {
  return `KSh ${Number(amount).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    queued: 'bg-yellow-100 text-yellow-800',
    in_triage: 'bg-blue-100 text-blue-800',
    in_nursing: 'bg-purple-100 text-purple-800',
    with_doctor: 'bg-indigo-100 text-indigo-800',
    in_lab: 'bg-orange-100 text-orange-800',
    at_pharmacy: 'bg-teal-100 text-teal-800',
    billing: 'bg-pink-100 text-pink-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    partially_paid: 'bg-orange-100 text-orange-800',
    draft: 'bg-gray-100 text-gray-800',
    dispensed: 'bg-green-100 text-green-800',
    requested: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    normal: 'bg-gray-100 text-gray-800',
    urgent: 'bg-orange-100 text-orange-800',
    emergency: 'bg-red-100 text-red-800',
    low_stock: 'bg-yellow-100 text-yellow-800',
    out_of_stock: 'bg-red-100 text-red-800',
    expiring: 'bg-orange-100 text-orange-800',
    expired: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}
