'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Captain {
  id: string
  first_name: string
  last_name: string
  hourly_rate: number
}

interface BoatDialogProps {
  boat?: any // Existing boat for edit mode
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'add' | 'edit'
}

export default function BoatDialog({
  boat,
  open,
  onOpenChange,
  mode,
}: BoatDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [captains, setCaptains] = useState<Captain[]>([])
  const [loadingCaptains, setLoadingCaptains] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [boatType, setBoatType] = useState<string>('motorboat')
  const [capacity, setCapacity] = useState('')
  const [description, setDescription] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [defaultCaptainId, setDefaultCaptainId] = useState<string>('none')

  // Load captains when dialog opens
  useEffect(() => {
    if (open) {
      loadCaptains()
    }
  }, [open])

  const loadCaptains = async () => {
    setLoadingCaptains(true)
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
        .eq('role', 'captain')
        .order('first_name')

      if (!error && data) {
        setCaptains(data)
      }
    } catch (error) {
      console.error('Error loading captains:', error)
    } finally {
      setLoadingCaptains(false)
    }
  }

  // Initialize form with boat data in edit mode
  useEffect(() => {
    if (mode === 'edit' && boat) {
      setName(boat.name || '')
      setBoatType(boat.boat_type || 'motorboat')
      setCapacity(boat.capacity?.toString() || '')
      setDescription(boat.description || '')
      setLicenseNumber(boat.license_number || '')
      setImageUrl(boat.image_url || '')
      setDefaultCaptainId(boat.default_captain_id || 'none')
    } else if (mode === 'add') {
      // Reset form for add mode
      setName('')
      setBoatType('motorboat')
      setCapacity('')
      setDescription('')
      setLicenseNumber('')
      setImageUrl('')
      setDefaultCaptainId('none')
    }
  }, [mode, boat, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!name.trim()) {
      toast.error('Boat name is required')
      return
    }

    const capacityNum = parseInt(capacity)
    if (isNaN(capacityNum) || capacityNum < 1) {
      toast.error('Valid capacity is required (minimum 1)')
      return
    }

    setLoading(true)

    try {
      const endpoint = mode === 'add' ? '/api/boats/create' : '/api/boats/edit'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(mode === 'edit' && { boatId: boat.id }),
          name: name.trim(),
          boatType,
          capacity: capacityNum,
          description: description.trim() || null,
          licenseNumber: licenseNumber.trim() || null,
          imageUrl: imageUrl.trim() || null,
          defaultCaptainId: defaultCaptainId === 'none' ? null : defaultCaptainId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${mode} boat`)
      }

      toast.success(mode === 'add' ? 'Boat Added!' : 'Boat Updated!', {
        description: `${name} has been ${mode === 'add' ? 'added' : 'updated'} successfully.`,
      })

      onOpenChange(false)
      router.refresh()
    } catch (error: any) {
      toast.error(mode === 'add' ? 'Failed to Add Boat' : 'Failed to Update Boat', {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add New Boat' : `Edit ${boat?.name || 'Boat'}`}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Add a new boat to your fleet.'
              : 'Update boat details. Changes will be reflected immediately.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Boat Name */}
            <div>
              <Label htmlFor="name">Boat Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Sea Breeze"
                disabled={loading}
                required
              />
            </div>

            {/* Boat Type */}
            <div>
              <Label htmlFor="boatType">Boat Type *</Label>
              <Select value={boatType} onValueChange={setBoatType} disabled={loading}>
                <SelectTrigger id="boatType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sailboat">Sailboat</SelectItem>
                  <SelectItem value="motorboat">Motorboat</SelectItem>
                  <SelectItem value="jetski">Jet Ski</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Capacity */}
            <div>
              <Label htmlFor="capacity">Capacity (Passengers) *</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                max="100"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="e.g., 8"
                disabled={loading}
                required
              />
            </div>

            {/* License Number */}
            <div>
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input
                id="licenseNumber"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="e.g., GR-12345"
                disabled={loading}
              />
            </div>
          </div>

          {/* Default Captain */}
          <div>
            <Label htmlFor="defaultCaptain" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Default Captain
            </Label>
            <Select
              value={defaultCaptainId}
              onValueChange={setDefaultCaptainId}
              disabled={loading || loadingCaptains}
            >
              <SelectTrigger id="defaultCaptain">
                <SelectValue placeholder={loadingCaptains ? 'Loading captains...' : 'Select default captain'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No default captain</SelectItem>
                {captains.map((captain) => (
                  <SelectItem key={captain.id} value={captain.id}>
                    {captain.first_name} {captain.last_name}
                    {captain.hourly_rate > 0 && ` - €${captain.hourly_rate}/h`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Optional: This captain will be auto-selected when booking this boat
            </p>
          </div>

          {/* Image URL */}
          <div>
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/boat-image.jpg"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Optional: URL to boat image
            </p>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the boat, amenities, etc."
              className="min-h-[100px]"
              disabled={loading}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {mode === 'add' ? 'Adding...' : 'Saving...'}
                </>
              ) : (
                <>{mode === 'add' ? 'Add Boat' : 'Save Changes'}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
