'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Users, Euro } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Sailor {
  id: string
  first_name: string
  last_name: string
  hourly_rate: number
}

interface SelectedSailor {
  sailorId: string
  hourlyRate: number
  fee: number
}

interface SailorSelectProps {
  durationHours: number
  selectedSailors: SelectedSailor[]
  onSailorsChange: (sailors: SelectedSailor[]) => void
  disabled?: boolean
}

export default function SailorSelect({
  durationHours,
  selectedSailors,
  onSailorsChange,
  disabled = false,
}: SailorSelectProps) {
  const [sailors, setSailors] = useState<Sailor[]>([])
  const [loading, setLoading] = useState(false)
  const [addingSailor, setAddingSailor] = useState<string>('')

  // Load sailors on mount
  useEffect(() => {
    loadSailors()
  }, [])

  const loadSailors = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: userData } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

      if (!userData) return

      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, hourly_rate')
        .eq('company_id', userData.company_id)
        .eq('role', 'sailor')
        .order('first_name')

      if (!error && data) {
        setSailors(data)
      }
    } catch (error) {
      console.error('Error loading sailors:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate available sailors (not yet selected)
  const availableSailors = useMemo(() => {
    const selectedIds = new Set(selectedSailors.map(s => s.sailorId))
    return sailors.filter(s => !selectedIds.has(s.id))
  }, [sailors, selectedSailors])

  // Calculate total sailor fee
  const totalSailorFee = useMemo(() => {
    return selectedSailors.reduce((sum, s) => sum + s.fee, 0)
  }, [selectedSailors])

  // Add a sailor
  const handleAddSailor = () => {
    if (!addingSailor) return

    const sailor = sailors.find(s => s.id === addingSailor)
    if (!sailor) return

    const fee = (sailor.hourly_rate || 0) * durationHours

    const newSailors = [
      ...selectedSailors,
      {
        sailorId: sailor.id,
        hourlyRate: sailor.hourly_rate || 0,
        fee,
      },
    ]

    console.log('🤖 DEBUG: Adding sailor to SailorSelect', {
      sailor: sailor.first_name,
      newLength: newSailors.length,
      newSailors,
    })

    onSailorsChange(newSailors)
    setAddingSailor('')
  }

  // Remove a sailor
  const handleRemoveSailor = (sailorId: string) => {
    const filtered = selectedSailors.filter(s => s.sailorId !== sailorId)
    console.log('🤖 DEBUG: Removing sailor from SailorSelect', {
      sailorId,
      newLength: filtered.length,
    })
    onSailorsChange(filtered)
  }

  // Get sailor display info
  const getSailorInfo = (sailorId: string) => {
    return sailors.find(s => s.id === sailorId)
  }

  // Recalculate fees when duration changes
  useEffect(() => {
    if (selectedSailors.length > 0 && durationHours > 0) {
      const updatedSailors = selectedSailors.map(s => {
        const sailor = sailors.find(sa => sa.id === s.sailorId)
        return {
          ...s,
          fee: (sailor?.hourly_rate || s.hourlyRate) * durationHours,
        }
      })

      // Only update if fees changed
      const feesChanged = selectedSailors.some((s, i) => s.fee !== updatedSailors[i].fee)
      if (feesChanged) {
        onSailorsChange(updatedSailors)
      }
    }
  }, [durationHours, sailors])

  if (loading && sailors.length === 0) {
    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Sailors
        </Label>
        <p className="text-sm text-muted-foreground">Loading sailors...</p>
      </div>
    )
  }

  if (sailors.length === 0) {
    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Sailors
        </Label>
        <p className="text-sm text-muted-foreground">
          No sailors available. Add sailors in the Agents section.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <Users className="w-4 h-4" />
        Sailors
        {selectedSailors.length > 0 && (
          <Badge variant="secondary" className="ml-2">
            {selectedSailors.length} selected
          </Badge>
        )}
      </Label>

      {/* Selected Sailors List */}
      {selectedSailors.length > 0 && (
        <div className="space-y-2">
          {selectedSailors.map(selected => {
            const sailor = getSailorInfo(selected.sailorId)
            if (!sailor) return null

            return (
              <div
                key={selected.sailorId}
                className="flex items-center justify-between p-2 bg-muted rounded-md"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {sailor.first_name} {sailor.last_name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({selected.hourlyRate > 0 ? `€${selected.hourlyRate}/h` : 'No charge'})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {selected.fee > 0 && (
                    <Badge variant="outline" className="gap-1">
                      <Euro className="w-3 h-3" />
                      {selected.fee.toFixed(2)}
                    </Badge>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleRemoveSailor(selected.sailorId)}
                    disabled={disabled}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Sailor Dropdown */}
      {availableSailors.length > 0 && (
        <div className="flex gap-2">
          <Select
            value={addingSailor}
            onValueChange={setAddingSailor}
            disabled={disabled}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Add a sailor..." />
            </SelectTrigger>
            <SelectContent>
              {availableSailors.map(sailor => (
                <SelectItem key={sailor.id} value={sailor.id}>
                  {sailor.first_name} {sailor.last_name}
                  {sailor.hourly_rate > 0 && ` - €${sailor.hourly_rate}/h`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleAddSailor}
            disabled={disabled || !addingSailor}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Total Sailor Cost */}
      {totalSailorFee > 0 && (
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <Euro className="w-3.5 h-3.5" />
          Total sailor cost: €{totalSailorFee.toFixed(2)}
          <span className="text-xs">
            ({selectedSailors.length} sailor{selectedSailors.length !== 1 ? 's' : ''} × {durationHours}h)
          </span>
        </p>
      )}
    </div>
  )
}
