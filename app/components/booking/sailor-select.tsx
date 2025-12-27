'use client'

import { useState, useEffect } from 'react'
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
import { X, Users, Euro } from 'lucide-react'
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

  // Load sailors on mount
  useEffect(() => {
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

    loadSailors()
  }, [])

  // Add a sailor by ID
  const handleAddSailor = (sailorId: string) => {
    if (!sailorId || sailorId === '') return

    const sailor = sailors.find(s => s.id === sailorId)
    if (!sailor) return

    // Check if already selected
    if (selectedSailors.some(s => s.sailorId === sailorId)) {
      return
    }

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

  // Get sailor info by ID
  const getSailorInfo = (sailorId: string) => {
    return sailors.find(s => s.id === sailorId)
  }

  // Calculate total sailor fee
  const totalSailorFee = selectedSailors.reduce((sum, s) => sum + s.fee, 0)

  // Get available sailors (not yet selected)
  const availableSailors = sailors.filter(
    s => !selectedSailors.some(ss => ss.sailorId === s.id)
  )

  if (loading) {
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
      {/* Sailor Selection Dropdown */}
      <div>
        <Label htmlFor="sailor">Add Sailor (Optional)</Label>
        <Select onValueChange={handleAddSailor} disabled={disabled || availableSailors.length === 0}>
          <SelectTrigger id="sailor">
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
      </div>

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
                    {sailor.hourly_rate > 0 ? `€${sailor.hourly_rate}/h` : 'No charge'}
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
