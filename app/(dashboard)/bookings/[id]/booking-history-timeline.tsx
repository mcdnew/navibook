'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { parseBookingChanges, getChangeSummary } from '@/lib/booking-history-utils'

interface BookingHistoryEntry {
  id: string
  action: string
  created_at: string
  user_id: string | null
  notes: string | null
  old_data: any
  new_data: any
  users?: {
    first_name: string
    last_name: string
    email: string
  } | null
}

interface BookingHistoryTimelineProps {
  history: BookingHistoryEntry[]
}

export default function BookingHistoryTimeline({ history }: BookingHistoryTimelineProps) {
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set())

  const toggleExpanded = (entryId: string) => {
    setExpandedEntries(prev => {
      const newSet = new Set(prev)
      if (newSet.has(entryId)) {
        newSet.delete(entryId)
      } else {
        newSet.add(entryId)
      }
      return newSet
    })
  }

  if (!history || history.length === 0) {
    return <p className="text-sm text-muted-foreground">No history available</p>
  }

  return (
    <div className="space-y-4">
      {history.map((entry: BookingHistoryEntry, index: number) => {
        const changes = parseBookingChanges(entry.old_data, entry.new_data)
        const isExpanded = expandedEntries.has(entry.id)
        const hasChanges = changes.length > 0
        const changeSummary = getChangeSummary(changes)

        return (
          <div key={entry.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                entry.action === 'created' ? 'bg-green-100' :
                entry.action === 'updated' ? 'bg-blue-100' :
                entry.action === 'confirmed' ? 'bg-green-100' :
                entry.action === 'cancelled' ? 'bg-red-100' :
                'bg-gray-100'
              }`}>
                {entry.action === 'created' ? '✓' :
                 entry.action === 'updated' ? '↻' :
                 entry.action === 'confirmed' ? '✓' :
                 entry.action === 'cancelled' ? '✗' : '•'}
              </div>
              {index < history.length - 1 && (
                <div className="w-px h-full min-h-12 bg-gray-200"></div>
              )}
            </div>
            <div className="flex-1 pb-8">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium capitalize">{entry.action}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(entry.created_at), 'MMM d, yyyy • h:mm a')}
                    {entry.users && (
                      <span className="ml-2">
                        • by <span className="font-medium text-gray-700">
                          {entry.users.first_name} {entry.users.last_name}
                        </span>
                      </span>
                    )}
                  </p>
                  {entry.notes && (
                    <p className="text-sm mt-1 text-gray-600">{entry.notes}</p>
                  )}
                  {hasChanges && (
                    <p className="text-xs text-gray-500 mt-1">{changeSummary}</p>
                  )}
                </div>
                {hasChanges && (
                  <button
                    onClick={() => toggleExpanded(entry.id)}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 ml-2"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Hide details
                      </>
                    ) : (
                      <>
                        <ChevronRight className="w-4 h-4" />
                        View details
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Expandable Change Details */}
              {isExpanded && hasChanges && (
                <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 mb-2 uppercase">Changes:</p>
                  <div className="space-y-2">
                    {changes.map((change, idx) => (
                      <div key={idx} className="text-sm">
                        <p className="font-medium text-gray-700">{change.fieldLabel}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-red-600 line-through text-xs bg-red-50 px-2 py-1 rounded">
                            {change.formattedOld}
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className="text-green-600 text-xs bg-green-50 px-2 py-1 rounded font-medium">
                            {change.formattedNew}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
