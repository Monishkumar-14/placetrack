import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | null | undefined, format: 'lpa' | 'monthly' = 'lpa'): string {
  if (amount === null || amount === undefined) return '—';
  if (format === 'lpa') {
    return `₹${(amount / 100000).toFixed(1)} LPA`;
  }
  return `₹${amount.toLocaleString('en-IN')}/month`;
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatTime(timeStr: string | null | undefined): string {
  if (!timeStr) return '—';
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

export function getRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  const diffDays = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
  return formatDate(dateStr);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    // Overall status
    interested: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    applied: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    shortlisted: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    offer_received: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    offer_accepted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    completed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    withdrawn: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-500',
    // Event/round status
    upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    result_pending: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    cancelled: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-500',
    rescheduled: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    // Shortlisted
    yes: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    no: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    pending: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    // Assessment results
    attempted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    not_shortlisted: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    absent: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-500',
  };
  return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    high: 'text-amber-500',
    medium: 'text-yellow-500',
    low: 'text-gray-400',
    none: 'text-gray-300 dark:text-gray-600',
  };
  return colors[priority] || 'text-gray-300';
}

export function formatLabel(str: string): string {
  return str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function getEventTypeColor(type: string): string {
  const colors: Record<string, string> = {
    ppt: '#3B82F6',
    assessment: '#F59E0B',
    interview: '#8B5CF6',
    result: '#10B981',
    offer: '#EAB308',
    joining: '#06B6D4',
    other: '#6B7280',
  };
  return colors[type] || '#6B7280';
}
