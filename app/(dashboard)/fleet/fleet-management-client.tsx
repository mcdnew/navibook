'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Edit, Trash2, Plus } from 'lucide-react'
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedBoat, setSelectedBoat] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleEdit = (boat: any) => {
    setSelectedBoat(boat)
    setEditDialogOpen(true)
  }

  const handleDelete = (boat: any) => {
    setSelectedBoat(boat)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedBoat) return

    setLoading(true)
    try {
      const response = await fetch('/api/boats/deactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boatId: selectedBoat.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to deactivate boat')
      }

      toast.success('Boat Deactivated', {
        description: `${selectedBoat.name} has been deactivated.`,
      })

      setDeleteDialogOpen(false)
      setSelectedBoat(null)
      router.refresh()
    } catch (error: any) {
      toast.error('Failed to Deactivate', {
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
                  onClick={() => handleDelete(boat)}
                  className="text-red-600 hover:bg-red-50 border-red-200"
                  disabled={!boat.is_active}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  {boat.is_active ? 'Deactivate' : 'Inactive'}
                </Button>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate Boat</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate "{selectedBoat?.name}"? This will
              prevent it from being booked but preserve all existing bookings and
              history.
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
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={loading}
            >
              {loading ? 'Deactivating...' : 'Deactivate Boat'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
