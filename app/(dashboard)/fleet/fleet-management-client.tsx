'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Edit, Trash2, Plus, User } from 'lucide-react'
import BoatDialog from './boat-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface FleetManagementClientProps {
  boats: any[]
}

export default function FleetManagementClient({ boats }: FleetManagementClientProps) {
  const router = useRouter()
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [toggleStatusDialogOpen, setToggleStatusDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedBoat, setSelectedBoat] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleEdit = (boat: any) => {
    setSelectedBoat(boat)
    setEditDialogOpen(true)
  }

  const handleToggleStatus = (boat: any) => {
    setSelectedBoat(boat)
    setToggleStatusDialogOpen(true)
  }

  const handleDelete = (boat: any) => {
    setSelectedBoat(boat)
    setDeleteDialogOpen(true)
  }

  const confirmToggleStatus = async () => {
    if (!selectedBoat) return

    setLoading(true)
    const newStatus = !selectedBoat.is_active
    try {
      const response = await fetch('/api/boats/toggle-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boatId: selectedBoat.id, isActive: newStatus }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${newStatus ? 'activate' : 'deactivate'} boat`)
      }

      toast.success(newStatus ? 'Boat Activated' : 'Boat Deactivated', {
        description: `${selectedBoat.name} has been ${newStatus ? 'activated' : 'deactivated'}.`,
      })

      setToggleStatusDialogOpen(false)
      setSelectedBoat(null)
      router.refresh()
    } catch (error: any) {
      toast.error('Failed to Update Status', {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const confirmDelete = async () => {
    if (!selectedBoat) return

    setLoading(true)
    try {
      const response = await fetch(`/api/boats/delete?id=${selectedBoat.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete boat')
      }

      toast.success('Boat Deleted', {
        description: `${selectedBoat.name} has been permanently deleted.`,
      })

      setDeleteDialogOpen(false)
      setSelectedBoat(null)
      router.refresh()
    } catch (error: any) {
      toast.error('Failed to Delete', {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <Button
          onClick={() => setAddDialogOpen(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Boat
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {boats?.map((boat) => (
          <Card key={boat.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-xl">{boat.name}</CardTitle>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    boat.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {boat.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {boat.image_url && (
                <img
                  src={boat.image_url}
                  alt={boat.name}
                  className="w-full h-32 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              )}
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">
                  <span className="font-medium">Type:</span>{' '}
                  {boat.boat_type.replace('_', ' ')}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium">Capacity:</span> {boat.capacity}{' '}
                  passengers
                </p>
                {boat.license_number && (
                  <p className="text-muted-foreground">
                    <span className="font-medium">License:</span>{' '}
                    {boat.license_number}
                  </p>
                )}
                {boat.default_captain && (
                  <p className="text-muted-foreground flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    <span className="font-medium">Default Captain:</span>{' '}
                    {boat.default_captain.first_name} {boat.default_captain.last_name}
                  </p>
                )}
              </div>
              {boat.description && (
                <p className="text-sm text-muted-foreground pt-2 border-t">
                  {boat.description}
                </p>
              )}

              <div className="flex gap-2 pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(boat)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleStatus(boat)}
                  className={
                    boat.is_active
                      ? 'text-orange-600 hover:bg-orange-50 border-orange-200'
                      : 'text-green-600 hover:bg-green-50 border-green-200'
                  }
                >
                  {boat.is_active ? 'Deactivate' : 'Reactivate'}
                </Button>
                {!boat.is_active && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(boat)}
                    className="text-red-600 hover:bg-red-50 border-red-200"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {boats?.length === 0 && (
          <div className="col-span-full">
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  No boats in your fleet yet
                </p>
                <Button onClick={() => setAddDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Boat
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Add Boat Dialog */}
      <BoatDialog
        mode="add"
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />

      {/* Edit Boat Dialog */}
      {selectedBoat && (
        <BoatDialog
          mode="edit"
          boat={selectedBoat}
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open)
            if (!open) setSelectedBoat(null)
          }}
        />
      )}

      {/* Toggle Status Confirmation Dialog */}
      <Dialog open={toggleStatusDialogOpen} onOpenChange={setToggleStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedBoat?.is_active ? 'Deactivate Boat' : 'Reactivate Boat'}
            </DialogTitle>
            <DialogDescription>
              {selectedBoat?.is_active
                ? `Are you sure you want to deactivate "${selectedBoat?.name}"? This will prevent it from being booked but preserve all existing bookings and history.`
                : `Are you sure you want to reactivate "${selectedBoat?.name}"? This will make it available for new bookings.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setToggleStatusDialogOpen(false)
                setSelectedBoat(null)
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant={selectedBoat?.is_active ? 'destructive' : 'default'}
              onClick={confirmToggleStatus}
              disabled={loading}
            >
              {loading
                ? selectedBoat?.is_active
                  ? 'Deactivating...'
                  : 'Reactivating...'
                : selectedBoat?.is_active
                ? 'Deactivate Boat'
                : 'Reactivate Boat'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permanent Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Permanently Delete Boat</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete &quot;{selectedBoat?.name}&quot;?
              This action cannot be undone. The boat can only be deleted if it has no
              bookings associated with it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setSelectedBoat(null)
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={loading}>
              {loading ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
