'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { toast } from 'sonner'
import { Ban, Plus, Trash2, CalendarIcon, Ship, Clock, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'

interface Boat {
  id: string
  name: string
}

interface BlockedSlot {
  id: string
  boat_id: string | null
  blocked_date: string
  start_time: string
  end_time: string
  reason: string
  block_type: string
  boats?: {
    name: string
  }
  users?: {
    first_name: string
    last_name: string
  }
}

interface BlockedSlotsClientProps {
  boats: Boat[]
}

const BLOCK_TYPES = [
  { value: 'maintenance', label: 'Maintenance', icon: '🔧' },
  { value: 'weather', label: 'Weather', icon: '⛈️' },
  { value: 'personal', label: 'Personal', icon: '👤' },
  { value: 'other', label: 'Other', icon: '📝' },
]

export default function BlockedSlotsClient({ boats }: BlockedSlotsClientProps) {
  // Filter out any boats with empty IDs to prevent Select errors
  const validBoats = boats.filter(boat => boat.id && boat.id.trim() !== '')

  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Form state
  const [selectedBoat, setSelectedBoat] = useState<string>('all')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [reason, setReason] = useState('')
  const [blockType, setBlockType] = useState('maintenance')

  // Filter state
  const [filterBoat, setFilterBoat] = useState<string>('all')
  const [startDateFilter, setStartDateFilter] = useState<Date>(new Date())
  const [endDateFilter, setEndDateFilter] = useState<Date>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  )

  // Load blocked slots
  const loadBlockedSlots = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        startDate: format(startDateFilter, 'yyyy-MM-dd'),
        endDate: format(endDateFilter, 'yyyy-MM-dd'),
      })

      if (filterBoat !== 'all') {
        params.append('boatId', filterBoat)
      }

      const response = await fetch(`/api/blocked-slots/list?${params}`)
      const data = await response.json()

      if (data.success) {
        setBlockedSlots(data.data)
      } else {
        toast.error('Failed to load blocked slots')
      }
    } catch (error) {
      toast.error('Error loading blocked slots')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBlockedSlots()
  }, [startDateFilter, endDateFilter, filterBoat])

  // Create blocked slot
  const handleCreateBlock = async () => {
    if (!reason.trim()) {
      toast.error('Please enter a reason for blocking this slot')
      return
    }

    if (startTime >= endTime) {
      toast.error('End time must be after start time')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/blocked-slots/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boatId: selectedBoat === 'all' ? null : selectedBoat,
          blockedDate: format(selectedDate, 'yyyy-MM-dd'),
          startTime,
          endTime,
          reason,
          blockType,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Blocked slot created!')
        setDialogOpen(false)
        setReason('')
        loadBlockedSlots()
      } else {
        toast.error(data.error || 'Failed to create blocked slot')
      }
    } catch (error) {
      toast.error('Error creating blocked slot')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Delete blocked slot
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this block?')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/blocked-slots/delete?id=${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Blocked slot removed')
        loadBlockedSlots()
      } else {
        toast.error(data.error || 'Failed to delete blocked slot')
      }
    } catch (error) {
      toast.error('Error deleting blocked slot')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 pb-24 md:pb-0">
      {/* Header with Add Button */}
      <Card className="maritime-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Ban className="w-5 h-5" />
                Manage Blocked Slots
              </CardTitle>
              <CardDescription className="mt-1">
                Block specific dates/times for maintenance, weather, or other reasons
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Block
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Blocked Slot</DialogTitle>
                  <DialogDescription>
                    Block a time slot to prevent bookings
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Boat Selection */}
                  <div>
                    <Label htmlFor="boat">Boat</Label>
                    <Select value={selectedBoat} onValueChange={setSelectedBoat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Boats</SelectItem>
                        {validBoats.map((boat) => (
                          <SelectItem key={boat.id} value={boat.id}>
                            {boat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date */}
                  <div>
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          {format(selectedDate, 'PPP')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => date && setSelectedDate(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Time Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Block Type */}
                  <div>
                    <Label htmlFor="blockType">Type</Label>
                    <Select value={blockType} onValueChange={setBlockType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BLOCK_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Reason */}
                  <div>
                    <Label htmlFor="reason">Reason</Label>
                    <Textarea
                      id="reason"
                      placeholder="Enter reason for blocking..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>

                  <Button
                    onClick={handleCreateBlock}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Creating...' : 'Create Block'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card className="maritime-card">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mobile-stack">
            <div>
              <Label>Boat Filter</Label>
              <Select value={filterBoat} onValueChange={setFilterBoat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Boats</SelectItem>
                  {validBoats.map((boat) => (
                    <SelectItem key={boat.id} value={boat.id}>
                      {boat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    {format(startDateFilter, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDateFilter}
                    onSelect={(date) => date && setStartDateFilter(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    {format(endDateFilter, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDateFilter}
                    onSelect={(date) => date && setEndDateFilter(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blocked Slots List */}
      <Card className="maritime-card">
        <CardHeader>
          <CardTitle>Blocked Slots ({blockedSlots.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && blockedSlots.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : blockedSlots.length === 0 ? (
            <div className="text-center py-16">
              <Ban className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No blocked slots found</p>
              <p className="text-sm text-muted-foreground">
                Click "Add Block" to create one
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {blockedSlots.map((slot) => {
                const blockTypeInfo = BLOCK_TYPES.find(t => t.value === slot.block_type)
                return (
                  <Card key={slot.id} className="border border-destructive/20 bg-destructive/5">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-lg">
                              {blockTypeInfo?.icon} {blockTypeInfo?.label || slot.block_type}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {slot.boat_id ? (
                                <span className="inline-flex items-center gap-1">
                                  <Ship className="w-3.5 h-3.5" />
                                  {slot.boats?.name}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  All Boats
                                </span>
                              )}
                            </span>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <CalendarIcon className="w-3.5 h-3.5" />
                              {format(new Date(slot.blocked_date), 'MMM d, yyyy')}
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                            </span>
                          </div>

                          <p className="text-sm text-foreground">{slot.reason}</p>

                          {slot.users && (
                            <p className="text-xs text-muted-foreground">
                              Created by {slot.users.first_name} {slot.users.last_name}
                            </p>
                          )}
                        </div>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(slot.id)}
                          disabled={loading}
                          className="gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Remove</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
