'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Edit, Trash2, ArrowRight, Search } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import WaitlistEditDialog from './waitlist-edit-dialog'
import WaitlistConvertDialog from './waitlist-convert-dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface WaitlistClientProps {
  waitlist: any[]
  boats: any[]
}

const STATUS_CONFIG = {
  active: { label: 'Active', color: 'bg-green-500' },
  contacted: { label: 'Contacted', color: 'bg-yellow-500' },
  converted: { label: 'Converted', color: 'bg-blue-500' },
  expired: { label: 'Expired', color: 'bg-gray-500' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500' },
}

export default function WaitlistClient({ waitlist, boats }: WaitlistClientProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('active')
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [convertDialogOpen, setConvertDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Filter waitlist (automatically exclude converted entries - they're archived)
  const filteredWaitlist = waitlist.filter((entry) => {
    // Always exclude converted entries
    if (entry.status === 'converted') {
      return false
    }

    const matchesSearch =
      entry.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.customer_phone.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleEdit = (entry: any) => {
    setSelectedEntry(entry)
    setEditDialogOpen(true)
  }

  const handleConvert = (entry: any) => {
    setSelectedEntry(entry)
    setConvertDialogOpen(true)
  }

  const handleDeleteClick = (entry: any) => {
    setSelectedEntry(entry)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedEntry) return

    setLoading(true)
    try {
      const response = await fetch(`/api/waitlist/${selectedEntry.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete entry')
      }

      toast.success('Deleted', {
        description: 'Waitlist entry removed successfully',
      })

      setDeleteDialogOpen(false)
      setSelectedEntry(null)
      router.refresh()
    } catch (error: any) {
      toast.error('Error', {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Waitlist Entries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {filteredWaitlist.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No waitlist entries found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Boat</TableHead>
                    <TableHead>Passengers</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWaitlist.map((entry) => {
                    const statusConfig = STATUS_CONFIG[entry.status as keyof typeof STATUS_CONFIG]
                    return (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${statusConfig.color} text-white border-0`}
                          >
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {entry.customer_name}
                          {entry.customer_email && (
                            <div className="text-xs text-muted-foreground">
                              {entry.customer_email}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{entry.customer_phone}</TableCell>
                        <TableCell>
                          {format(new Date(entry.preferred_date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          {entry.boats ? entry.boats.name : 'Any boat'}
                        </TableCell>
                        <TableCell>{entry.passengers}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(entry.created_at), 'MMM d')}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(entry)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            {entry.status !== 'converted' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleConvert(entry)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <ArrowRight className="w-3 h-3" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(entry)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Stats */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div>
              Total: <span className="font-medium text-foreground">{waitlist.length}</span>
            </div>
            <div>
              Active:{' '}
              <span className="font-medium text-foreground">
                {waitlist.filter((e) => e.status === 'active').length}
              </span>
            </div>
            <div>
              Contacted:{' '}
              <span className="font-medium text-foreground">
                {waitlist.filter((e) => e.status === 'contacted').length}
              </span>
            </div>
            <div>
              Converted:{' '}
              <span className="font-medium text-foreground">
                {waitlist.filter((e) => e.status === 'converted').length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {selectedEntry && (
        <WaitlistEditDialog
          entry={selectedEntry}
          boats={boats}
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open)
            if (!open) setSelectedEntry(null)
          }}
        />
      )}

      {/* Convert Dialog */}
      {selectedEntry && (
        <WaitlistConvertDialog
          entry={selectedEntry}
          boats={boats}
          open={convertDialogOpen}
          onOpenChange={(open) => {
            setConvertDialogOpen(open)
            if (!open) setSelectedEntry(null)
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Waitlist Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the waitlist entry for &quot;
              {selectedEntry?.customer_name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
