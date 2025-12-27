/**
 * Utility functions for parsing and formatting booking history changes
 */

export interface FieldChange {
  field: string
  fieldLabel: string
  oldValue: any
  newValue: any
  formattedOld: string
  formattedNew: string
}

/**
 * Field name to human-readable label mapping
 */
const FIELD_LABELS: Record<string, string> = {
  customer_name: 'Customer Name',
  customer_phone: 'Customer Phone',
  customer_email: 'Customer Email',
  booking_date: 'Booking Date',
  start_time: 'Start Time',
  end_time: 'End Time',
  duration: 'Duration',
  passengers: 'Number of Passengers',
  package_type: 'Package Type',
  total_price: 'Total Price',
  deposit_amount: 'Deposit Amount',
  deposit_paid: 'Deposit Paid',
  captain_fee: 'Captain Fee',
  sailor_fee: 'Sailor Fee',
  agent_commission: 'Agent Commission',
  status: 'Status',
  notes: 'Notes',
  boat_id: 'Boat',
  agent_id: 'Agent',
  captain_id: 'Captain',
  sailors: 'Sailors',
  sailor_count: 'Number of Sailors',
  source: 'Source',
  hold_until: 'Hold Until',
  completed_at: 'Completed At',
  cancelled_at: 'Cancelled At',
  cancellation_reason: 'Cancellation Reason',
}

/**
 * Package type mapping
 */
const PACKAGE_TYPES: Record<string, string> = {
  charter_only: 'Charter Only',
  charter_drinks: 'Charter + Drinks',
  charter_food: 'Charter + Food',
  charter_full: 'Full Package',
}

/**
 * Status mapping
 */
const STATUS_LABELS: Record<string, string> = {
  pending_hold: 'Pending Hold',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
}

/**
 * Format a field value for display
 */
function formatValue(field: string, value: any): string {
  if (value === null || value === undefined) {
    return 'None'
  }

  // Boolean values
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  // Currency fields
  if (['total_price', 'deposit_amount', 'captain_fee', 'sailor_fee', 'agent_commission'].includes(field)) {
    return `€${Number(value).toFixed(2)}`
  }

  // Sailors array (just show count for now)
  if (field === 'sailors') {
    if (Array.isArray(value)) {
      return value.length === 0 ? 'None' : `${value.length} sailor(s)`
    }
    return 'None'
  }

  // Package type
  if (field === 'package_type') {
    return PACKAGE_TYPES[value] || value
  }

  // Status
  if (field === 'status') {
    return STATUS_LABELS[value] || value
  }

  // Date fields
  if (field === 'booking_date') {
    try {
      return new Date(value).toLocaleDateString('en-GB', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return String(value)
    }
  }

  // DateTime fields
  if (['hold_until', 'completed_at', 'cancelled_at'].includes(field)) {
    try {
      return new Date(value).toLocaleString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return String(value)
    }
  }

  // Default: convert to string
  return String(value)
}

/**
 * Fields to exclude from comparison (internal or redundant)
 */
const EXCLUDED_FIELDS = [
  'id',
  'company_id',
  'created_at',
  'updated_at',
  'booking_id',
]

/**
 * Parse booking history entry and extract field changes
 */
export function parseBookingChanges(
  oldData: any,
  newData: any
): FieldChange[] {
  const changes: FieldChange[] = []

  // Handle the case where one of the data objects is null (e.g., creation)
  if (!oldData && newData) {
    // This is a creation - show all fields as new
    Object.keys(newData).forEach(field => {
      if (EXCLUDED_FIELDS.includes(field)) return

      changes.push({
        field,
        fieldLabel: FIELD_LABELS[field] || field,
        oldValue: null,
        newValue: newData[field],
        formattedOld: 'None',
        formattedNew: formatValue(field, newData[field]),
      })
    })
    return changes
  }

  if (oldData && !newData) {
    // This is a deletion (shouldn't normally happen) - show all fields as removed
    Object.keys(oldData).forEach(field => {
      if (EXCLUDED_FIELDS.includes(field)) return

      changes.push({
        field,
        fieldLabel: FIELD_LABELS[field] || field,
        oldValue: oldData[field],
        newValue: null,
        formattedOld: formatValue(field, oldData[field]),
        formattedNew: 'None',
      })
    })
    return changes
  }

  // Normal case: compare old and new data
  if (oldData && newData) {
    // Get all unique field names from both objects
    const allFields = new Set([
      ...Object.keys(oldData),
      ...Object.keys(newData)
    ])

    allFields.forEach(field => {
      if (EXCLUDED_FIELDS.includes(field)) return

      const oldValue = oldData[field]
      const newValue = newData[field]

      // Only include if value actually changed
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({
          field,
          fieldLabel: FIELD_LABELS[field] || field,
          oldValue,
          newValue,
          formattedOld: formatValue(field, oldValue),
          formattedNew: formatValue(field, newValue),
        })
      }
    })
  }

  return changes
}

/**
 * Get a summary description of changes
 */
export function getChangeSummary(changes: FieldChange[]): string {
  if (changes.length === 0) {
    return 'No specific changes recorded'
  }

  if (changes.length === 1) {
    return `Changed ${changes[0].fieldLabel}`
  }

  if (changes.length === 2) {
    return `Changed ${changes[0].fieldLabel} and ${changes[1].fieldLabel}`
  }

  return `Changed ${changes.length} fields`
}
