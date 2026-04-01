/**
 * Centralized booking status color scheme
 * Ensures consistent, high-contrast badges across the entire app
 */

export type BookingStatus = 'pending_hold' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

export interface StatusStyles {
  bg: string      // Background color class
  text: string    // Text color class
  border: string  // Border color class
  hex: string     // Hex color for calendars and non-tailwind contexts
  label: string   // Display label
}

export const BOOKING_STATUS_COLORS: Record<BookingStatus, StatusStyles> = {
  pending_hold: {
    bg: 'bg-amber-100',
    text: 'text-amber-900',
    border: 'border-amber-300',
    hex: '#f59e0b',
    label: 'Pending Hold',
  },
  confirmed: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-900',
    border: 'border-emerald-300',
    hex: '#10b981',
    label: 'Confirmed',
  },
  completed: {
    bg: 'bg-blue-100',
    text: 'text-blue-900',
    border: 'border-blue-300',
    hex: '#3b82f6',
    label: 'Completed',
  },
  cancelled: {
    bg: 'bg-red-100',
    text: 'text-red-900',
    border: 'border-red-300',
    hex: '#ef4444',
    label: 'Cancelled',
  },
  no_show: {
    bg: 'bg-slate-100',
    text: 'text-slate-900',
    border: 'border-slate-300',
    hex: '#64748b',
    label: 'No Show',
  },
}

export function getStatusStyles(status: BookingStatus): StatusStyles {
  return BOOKING_STATUS_COLORS[status] || BOOKING_STATUS_COLORS.pending_hold
}

export function getStatusLabel(status: BookingStatus): string {
  return BOOKING_STATUS_COLORS[status]?.label || status.replace('_', ' ')
}

export function getStatusHex(status: BookingStatus): string {
  return BOOKING_STATUS_COLORS[status]?.hex || '#9ca3af'
}

export function getStatusClasses(status: BookingStatus): string {
  const styles = getStatusStyles(status)
  return `${styles.bg} ${styles.text}`
}
