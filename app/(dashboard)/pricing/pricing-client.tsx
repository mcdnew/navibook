'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Copy, Trash2, Ship, DollarSign, Filter, X } from 'lucide-react'

type Boat = {
  id: string
  name: string
  boat_type: string
}

type Pricing = {
  id: string
  boat_id: string
  duration: string
  package_type: string
  price: number
  boats: {
    name: string
    boat_type: string
  }
}

interface PricingClientProps {
  boats: Boat[]
  pricing: Pricing[]
}

const DURATIONS = ['2h', '3h', '4h', '8h']
const PACKAGES = [
  { value: 'charter_only', label: 'Charter Only' },
  { value: 'charter_drinks', label: 'Charter + Drinks' },
  { value: 'charter_food', label: 'Charter + Food' },
  { value: 'charter_full', label: 'Full Package' },
]

export default function PricingClient({ boats, pricing }: PricingClientProps) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [copyDialogOpen, setCopyDialogOpen] = useState(false)
  const [editMode, setEditMode] = useState<'add' | 'edit'>('add')
  const [selectedPricing, setSelectedPricing] = useState<Pricing | null>(null)
  const [loading, setLoading] = useState(false)

  // Filters
  const [boatFilter, setBoatFilter] = useState<string>('all')
  const [durationFilter, setDurationFilter] = useState<string>('all')
  const [packageFilter, setPackageFilter] = useState<string>('all')

  // Form state
  const [formBoatId, setFormBoatId] = useState('')
  const [formDuration, setFormDuration] = useState('')
  const [formPackage, setFormPackage] = useState('')
  const [formPrice, setFormPrice] = useState('')

  // Copy pricing state
  const [copyFromBoat, setCopyFromBoat] = useState('')
  const [copyToBoat, setCopyToBoat] = useState('')

  // Filter pricing
  const filteredPricing = useMemo(() => {
    let result = pricing

    if (boatFilter !== 'all') {
      result = result.filter((p) => p.boat_id === boatFilter)
    }

    if (durationFilter !== 'all') {
      result = result.filter((p) => p.duration === durationFilter)
    }

    if (packageFilter !== 'all') {
      result = result.filter((p) => p.package_type === packageFilter)
    }

    return result
  }, [pricing, boatFilter, durationFilter, packageFilter])

  // Group pricing by boat
  const pricingByBoat = useMemo(() => {
    const grouped: Record<string, Pricing[]> = {}
    filteredPricing.forEach((p) => {
      if (!grouped[p.boat_id]) {
        grouped[p.boat_id] = []
      }
      grouped[p.boat_id].push(p)
    })
    return grouped
  }, [filteredPricing])

  const openAddDialog = () => {
    setEditMode('add')
    setFormBoatId('')
    setFormDuration('')
    setFormPackage('')
    setFormPrice('')
    setDialogOpen(true)
  }

  const openEditDialog = (pricing: Pricing) => {
    setEditMode('edit')
    setSelectedPricing(pricing)
    setFormBoatId(pricing.boat_id)
    setFormDuration(pricing.duration)
    setFormPackage(pricing.package_type)
    setFormPrice(pricing.price.toString())
    setDialogOpen(true)
  }

  const openDeleteDialog = (pricing: Pricing) => {
    setSelectedPricing(pricing)
    setDeleteDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const price = parseFloat(formPrice)
      if (isNaN(price) || price <= 0) {
        toast.error('Please enter a valid price')
        setLoading(false)
        return
      }

      const endpoint = editMode === 'add' ? '/api/pricing/create' : '/api/pricing/edit'
      const body: any = {
        boatId: formBoatId,
        duration: formDuration,
        packageType: formPackage,
        price,
      }

      if (editMode === 'edit' && selectedPricing) {
        body.pricingId = selectedPricing.id
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save pricing')
      }

      toast.success(editMode === 'add' ? 'Pricing added successfully' : 'Pricing updated successfully')
      setDialogOpen(false)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save pricing')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedPricing) return

    setLoading(true)
    try {
      const response = await fetch('/api/pricing/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pricingId: selectedPricing.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete pricing')
      }

      toast.success('Pricing deleted successfully')
      setDeleteDialogOpen(false)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete pricing')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyPricing = async () => {
    if (!copyFromBoat || !copyToBoat) {
      toast.error('Please select both boats')
      return
    }

    if (copyFromBoat === copyToBoat) {
      toast.error('Cannot copy to the same boat')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/pricing/copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromBoatId: copyFromBoat,
          toBoatId: copyToBoat,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to copy pricing')
      }

      toast.success(`Copied ${data.count} pricing entries`)
      setCopyDialogOpen(false)
      setCopyFromBoat('')
      setCopyToBoat('')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to copy pricing')
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setBoatFilter('all')
    setDurationFilter('all')
    setPackageFilter('all')
  }

  const hasActiveFilters = boatFilter !== 'all' || durationFilter !== 'all' || packageFilter !== 'all'

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Price Management</h2>
          <p className="text-muted-foreground">Configure pricing for boats, durations, and packages</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCopyDialogOpen(true)}>
            <Copy className="w-4 h-4 mr-2" />
            Copy Prices
          </Button>
          <Button onClick={openAddDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Add Pricing
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Boat</Label>
              <Select value={boatFilter} onValueChange={setBoatFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Boats</SelectItem>
                  {boats.map((boat) => (
                    <SelectItem key={boat.id} value={boat.id}>
                      {boat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Duration</Label>
              <Select value={durationFilter} onValueChange={setDurationFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Durations</SelectItem>
                  {DURATIONS.map((dur) => (
                    <SelectItem key={dur} value={dur}>
                      {dur}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Package</Label>
              <Select value={packageFilter} onValueChange={setPackageFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Packages</SelectItem>
                  {PACKAGES.map((pkg) => (
                    <SelectItem key={pkg.value} value={pkg.value}>
                      {pkg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-4">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {boatFilter !== 'all' && (
                <Badge variant="secondary">
                  Boat: {boats.find((b) => b.id === boatFilter)?.name}
                </Badge>
              )}
              {durationFilter !== 'all' && <Badge variant="secondary">Duration: {durationFilter}</Badge>}
              {packageFilter !== 'all' && (
                <Badge variant="secondary">
                  Package: {PACKAGES.find((p) => p.value === packageFilter)?.label}
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Overview</CardTitle>
          <CardDescription>
            Showing {filteredPricing.length} of {pricing.length} pricing entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(pricingByBoat).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(pricingByBoat).map(([boatId, prices]) => {
                const boat = boats.find((b) => b.id === boatId)
                if (!boat) return null

                return (
                  <div key={boatId} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Ship className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-lg">{boat.name}</h3>
                      <Badge variant="outline">{boat.boat_type}</Badge>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Duration</TableHead>
                          <TableHead>Package</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {prices.map((price) => (
                          <TableRow key={price.id}>
                            <TableCell className="font-medium">{price.duration}</TableCell>
                            <TableCell>
                              {PACKAGES.find((p) => p.value === price.package_type)?.label}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              €{price.price.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-1 justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(price)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openDeleteDialog(price)}
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No pricing entries found</h3>
              <p className="text-muted-foreground mb-4">
                {hasActiveFilters
                  ? 'Try adjusting your filters or add new pricing'
                  : 'Get started by adding your first pricing entry'}
              </p>
              <Button onClick={openAddDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Add Pricing
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editMode === 'add' ? 'Add' : 'Edit'} Pricing</DialogTitle>
            <DialogDescription>
              {editMode === 'add'
                ? 'Add a new pricing entry for a boat'
                : 'Update the pricing entry'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="boat">Boat *</Label>
              <Select
                value={formBoatId}
                onValueChange={setFormBoatId}
                disabled={editMode === 'edit'}
                required
              >
                <SelectTrigger id="boat">
                  <SelectValue placeholder="Select boat" />
                </SelectTrigger>
                <SelectContent>
                  {boats.map((boat) => (
                    <SelectItem key={boat.id} value={boat.id}>
                      {boat.name} ({boat.boat_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="duration">Duration *</Label>
              <Select
                value={formDuration}
                onValueChange={setFormDuration}
                disabled={editMode === 'edit'}
                required
              >
                <SelectTrigger id="duration">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {DURATIONS.map((dur) => (
                    <SelectItem key={dur} value={dur}>
                      {dur}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="package">Package Type *</Label>
              <Select
                value={formPackage}
                onValueChange={setFormPackage}
                disabled={editMode === 'edit'}
                required
              >
                <SelectTrigger id="package">
                  <SelectValue placeholder="Select package" />
                </SelectTrigger>
                <SelectContent>
                  {PACKAGES.map((pkg) => (
                    <SelectItem key={pkg.value} value={pkg.value}>
                      {pkg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="price">Price (€) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : editMode === 'add' ? 'Add Pricing' : 'Update Pricing'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Pricing</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this pricing entry? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedPricing && (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p>
                <strong>Boat:</strong> {selectedPricing.boats.name}
              </p>
              <p>
                <strong>Duration:</strong> {selectedPricing.duration}
              </p>
              <p>
                <strong>Package:</strong>{' '}
                {PACKAGES.find((p) => p.value === selectedPricing.package_type)?.label}
              </p>
              <p>
                <strong>Price:</strong> €{selectedPricing.price.toFixed(2)}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? 'Deleting...' : 'Delete Pricing'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Copy Pricing Dialog */}
      <Dialog open={copyDialogOpen} onOpenChange={setCopyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copy Pricing</DialogTitle>
            <DialogDescription>
              Copy all pricing entries from one boat to another
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="copyFrom">Copy From</Label>
              <Select value={copyFromBoat} onValueChange={setCopyFromBoat}>
                <SelectTrigger id="copyFrom">
                  <SelectValue placeholder="Select source boat" />
                </SelectTrigger>
                <SelectContent>
                  {boats.map((boat) => (
                    <SelectItem key={boat.id} value={boat.id}>
                      {boat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="copyTo">Copy To</Label>
              <Select value={copyToBoat} onValueChange={setCopyToBoat}>
                <SelectTrigger id="copyTo">
                  <SelectValue placeholder="Select destination boat" />
                </SelectTrigger>
                <SelectContent>
                  {boats.map((boat) => (
                    <SelectItem key={boat.id} value={boat.id} disabled={boat.id === copyFromBoat}>
                      {boat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg">
              <p className="text-sm text-yellow-900 dark:text-yellow-100">
                <strong>Warning:</strong> This will overwrite existing pricing for the destination boat.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCopyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCopyPricing} disabled={loading || !copyFromBoat || !copyToBoat}>
              {loading ? 'Copying...' : 'Copy Pricing'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
