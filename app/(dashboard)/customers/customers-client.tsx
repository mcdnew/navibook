'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  Users,
  Search,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  Star,
  MessageSquare,
  Edit,
  Eye,
} from 'lucide-react'
import { format } from 'date-fns'

type Booking = {
  id: string
  booking_date: string
  start_time: string
  status: string
  total_price: number
  package_type: string
  boats: { name: string }
}

type Customer = {
  id: string
  name: string
  email: string
  phone: string
  bookings: Booking[]
  totalSpent: number
  lastBooking: string
  notes?: string
  preferences?: string
  tags?: string[]
}

type CustomersClientProps = {
  customers: Customer[]
}

export default function CustomersClient({ customers: initialCustomers }: CustomersClientProps) {
  const router = useRouter()
  const [customers, setCustomers] = useState(initialCustomers)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showNotesDialog, setShowNotesDialog] = useState(false)

  // Notes editing
  const [editNotes, setEditNotes] = useState('')
  const [editPreferences, setEditPreferences] = useState('')
  const [saving, setSaving] = useState(false)

  // Filter and search customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery)

      const matchesFilter =
        filterType === 'all' ||
        (filterType === 'repeat' && customer.bookings.length > 1) ||
        (filterType === 'new' && customer.bookings.length === 1) ||
        (filterType === 'vip' && customer.totalSpent > 1000)

      return matchesSearch && matchesFilter
    })
  }, [customers, searchQuery, filterType])

  // Summary statistics
  const stats = useMemo(() => {
    const totalCustomers = customers.length
    const repeatCustomers = customers.filter(c => c.bookings.length > 1).length
    const newCustomers = customers.filter(c => c.bookings.length === 1).length
    const vipCustomers = customers.filter(c => c.totalSpent > 1000).length
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0)

    return {
      totalCustomers,
      repeatCustomers,
      newCustomers,
      vipCustomers,
      totalRevenue,
      repeatRate: totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0,
    }
  }, [customers])

  const openDetailsDialog = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowDetailsDialog(true)
  }

  const openNotesDialog = (customer: Customer) => {
    setSelectedCustomer(customer)
    setEditNotes(customer.notes || '')
    setEditPreferences(customer.preferences || '')
    setShowNotesDialog(true)
  }

  const handleSaveNotes = async () => {
    if (!selectedCustomer) return

    setSaving(true)
    try {
      const response = await fetch('/api/customers/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: selectedCustomer.email,
          notes: editNotes,
          preferences: editPreferences,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save notes')
      }

      toast.success('Notes saved successfully')
      setShowNotesDialog(false)
      router.refresh()
    } catch (error) {
      toast.error('Failed to save notes')
    } finally {
      setSaving(false)
    }
  }

  const getCustomerTags = (customer: Customer) => {
    const tags: string[] = []
    if (customer.bookings.length > 1) tags.push('Repeat')
    if (customer.bookings.length >= 5) tags.push('Loyal')
    if (customer.totalSpent > 1000) tags.push('VIP')
    if (customer.bookings.length === 1) tags.push('New')
    return tags
  }

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'VIP':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
      case 'Repeat':
      case 'Loyal':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
      case 'New':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalCustomers}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.repeatRate.toFixed(1)}% repeat rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Repeat Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.repeatCustomers}</p>
            <p className="text-xs text-muted-foreground mt-1">
              multiple bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Star className="w-4 h-4" />
              VIP Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.vipCustomers}</p>
            <p className="text-xs text-muted-foreground mt-1">
              €1000+ spent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              New Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.newCustomers}</p>
            <p className="text-xs text-muted-foreground mt-1">
              single booking
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Customers ({filteredCustomers.length})</CardTitle>
              <CardDescription>Manage customer relationships and history</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter customers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="repeat">Repeat Customers</SelectItem>
                <SelectItem value="new">New Customers</SelectItem>
                <SelectItem value="vip">VIP Customers (€1000+)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Customers List */}
          <div className="space-y-2">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No customers found</p>
              </div>
            ) : (
              filteredCustomers.map((customer) => {
                const tags = getCustomerTags(customer)
                return (
                  <div
                    key={customer.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="font-semibold text-lg">{customer.name}</p>
                        {tags.map(tag => (
                          <Badge key={tag} className={getTagColor(tag)} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {customer.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {customer.phone}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-medium">
                          {customer.bookings.length} booking{customer.bookings.length !== 1 ? 's' : ''}
                        </span>
                        <span className="text-green-600 font-semibold">
                          €{customer.totalSpent.toFixed(2)} total
                        </span>
                        <span className="text-muted-foreground">
                          Last: {format(new Date(customer.lastBooking), 'PP')}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 md:mt-0 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDetailsDialog(customer)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View History
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openNotesDialog(customer)}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Notes
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Customer Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              {selectedCustomer?.name} - Booking history and information
            </DialogDescription>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-6 py-4">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-semibold">{selectedCustomer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold">{selectedCustomer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-semibold">{selectedCustomer.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="font-semibold text-green-600">€{selectedCustomer.totalSpent.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                  <p className="font-semibold">{selectedCustomer.bookings.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Booking</p>
                  <p className="font-semibold">{format(new Date(selectedCustomer.lastBooking), 'PP')}</p>
                </div>
              </div>

              {/* Notes & Preferences */}
              {(selectedCustomer.notes || selectedCustomer.preferences) && (
                <div className="space-y-3">
                  {selectedCustomer.notes && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Notes</p>
                      <p className="text-sm bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                        {selectedCustomer.notes}
                      </p>
                    </div>
                  )}
                  {selectedCustomer.preferences && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Preferences</p>
                      <p className="text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                        {selectedCustomer.preferences}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Booking History */}
              <div>
                <h3 className="font-semibold mb-3">Booking History</h3>
                <div className="space-y-2">
                  {selectedCustomer.bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{format(new Date(booking.booking_date), 'PPP')}</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.start_time} • {booking.boats.name} • {booking.package_type.replace(/_/g, ' ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">€{booking.total_price.toFixed(2)}</p>
                        <Badge className={
                          booking.status === 'confirmed'
                            ? 'bg-green-100 text-green-700'
                            : booking.status === 'pending_hold'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }>
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notes & Preferences Dialog */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customer Notes & Preferences</DialogTitle>
            <DialogDescription>
              Add notes and preferences for {selectedCustomer?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Add any notes about this customer..."
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">
                Special requests, allergies, important information, etc.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferences">Preferences</Label>
              <Textarea
                id="preferences"
                value={editPreferences}
                onChange={(e) => setEditPreferences(e.target.value)}
                placeholder="Add customer preferences..."
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">
                Preferred boats, packages, times, dietary requirements, etc.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotesDialog(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSaveNotes} disabled={saving}>
              {saving ? 'Saving...' : 'Save Notes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
