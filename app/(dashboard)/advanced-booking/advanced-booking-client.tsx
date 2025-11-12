'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Boat {
  id: string
  name: string
}

interface WaitlistEntry {
  id: string
  customer_name: string
  customer_email?: string
  customer_phone: string
  preferred_date: string
  passengers: number
  status: string
  boats?: { name: string }
  created_at: string
}

interface CancellationPolicy {
  id: string
  name: string
  description?: string
  hours_before_24: string
  hours_before_48: string
  hours_before_72: string
  is_default: boolean
}

interface AdvancedBookingClientProps {
  boats: Boat[]
  waitlist: WaitlistEntry[]
  cancellationPolicies: CancellationPolicy[]
}

export default function AdvancedBookingClient({
  boats,
  waitlist,
  cancellationPolicies,
}: AdvancedBookingClientProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [addWaitlistOpen, setAddWaitlistOpen] = useState(false)

  // Waitlist form state
  const [waitlistForm, setWaitlistForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    preferredDate: '',
    boatId: '',
    passengers: '1',
    notes: '',
  })

  const handleAddToWaitlist = async () => {
    if (!waitlistForm.customerName || !waitlistForm.customerPhone || !waitlistForm.preferredDate) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/waitlist/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: waitlistForm.customerName,
          customerEmail: waitlistForm.customerEmail || null,
          customerPhone: waitlistForm.customerPhone,
          preferredDate: waitlistForm.preferredDate,
          boatId: waitlistForm.boatId || null,
          passengers: parseInt(waitlistForm.passengers),
          notes: waitlistForm.notes || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add to waitlist')
      }

      toast.success('Customer added to waitlist successfully')
      setAddWaitlistOpen(false)
      setWaitlistForm({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        preferredDate: '',
        boatId: '',
        passengers: '1',
        notes: '',
      })
      router.refresh()
    } catch (error: any) {
      console.error('Add to waitlist error:', error)
      toast.error(error.message || 'Failed to add to waitlist')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-100 text-blue-700">Active</Badge>
      case 'contacted':
        return <Badge className="bg-yellow-100 text-yellow-700">Contacted</Badge>
      case 'converted':
        return <Badge className="bg-green-100 text-green-700">Converted</Badge>
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-700">Expired</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getRefundLabel = (refundType: string) => {
    switch (refundType) {
      case 'full_refund':
        return '100% Refund'
      case 'partial_75':
        return '75% Refund'
      case 'partial_50':
        return '50% Refund'
      case 'partial_25':
        return '25% Refund'
      case 'no_refund':
        return 'No Refund'
      default:
        return refundType
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="waitlist" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="waitlist">Waitlist Management</TabsTrigger>
          <TabsTrigger value="policies">Cancellation Policies</TabsTrigger>
          <TabsTrigger value="templates">Coming Soon</TabsTrigger>
        </TabsList>

        {/* Waitlist Management */}
        <TabsContent value="waitlist" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Waitlist Management</CardTitle>
                  <CardDescription>
                    Track customers waiting for availability
                  </CardDescription>
                </div>
                <Dialog open={addWaitlistOpen} onOpenChange={setAddWaitlistOpen}>
                  <DialogTrigger asChild>
                    <Button>Add to Waitlist</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add Customer to Waitlist</DialogTitle>
                      <DialogDescription>
                        Add a customer who&apos;s interested in booking when availability opens up
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="customerName">Customer Name *</Label>
                        <Input
                          id="customerName"
                          value={waitlistForm.customerName}
                          onChange={(e) =>
                            setWaitlistForm({ ...waitlistForm, customerName: e.target.value })
                          }
                          placeholder="John Doe"
                        />
                      </div>

                      <div>
                        <Label htmlFor="customerEmail">Email</Label>
                        <Input
                          id="customerEmail"
                          type="email"
                          value={waitlistForm.customerEmail}
                          onChange={(e) =>
                            setWaitlistForm({ ...waitlistForm, customerEmail: e.target.value })
                          }
                          placeholder="john@example.com"
                        />
                      </div>

                      <div>
                        <Label htmlFor="customerPhone">Phone *</Label>
                        <Input
                          id="customerPhone"
                          value={waitlistForm.customerPhone}
                          onChange={(e) =>
                            setWaitlistForm({ ...waitlistForm, customerPhone: e.target.value })
                          }
                          placeholder="+1234567890"
                        />
                      </div>

                      <div>
                        <Label htmlFor="preferredDate">Preferred Date *</Label>
                        <Input
                          id="preferredDate"
                          type="date"
                          value={waitlistForm.preferredDate}
                          onChange={(e) =>
                            setWaitlistForm({ ...waitlistForm, preferredDate: e.target.value })
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="boat">Preferred Boat (Optional)</Label>
                        <Select
                          value={waitlistForm.boatId}
                          onValueChange={(value) =>
                            setWaitlistForm({ ...waitlistForm, boatId: value })
                          }
                        >
                          <SelectTrigger id="boat">
                            <SelectValue placeholder="Any boat" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any boat</SelectItem>
                            {boats.map((boat) => (
                              <SelectItem key={boat.id} value={boat.id}>
                                {boat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="passengers">Number of Passengers</Label>
                        <Input
                          id="passengers"
                          type="number"
                          min="1"
                          value={waitlistForm.passengers}
                          onChange={(e) =>
                            setWaitlistForm({ ...waitlistForm, passengers: e.target.value })
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          value={waitlistForm.notes}
                          onChange={(e) =>
                            setWaitlistForm({ ...waitlistForm, notes: e.target.value })
                          }
                          placeholder="Any special requirements or notes..."
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          onClick={() => setAddWaitlistOpen(false)}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleAddToWaitlist} disabled={isSubmitting}>
                          {isSubmitting ? 'Adding...' : 'Add to Waitlist'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{waitlist.length}</div>
                      <div className="text-sm text-muted-foreground">Total Waitlist</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-blue-600">
                        {waitlist.filter((w) => w.status === 'active').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Active</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-green-600">
                        {waitlist.filter((w) => w.status === 'converted').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Converted</div>
                    </CardContent>
                  </Card>
                </div>

                {waitlist.length > 0 ? (
                  <div className="space-y-2">
                    {waitlist.map((entry) => (
                      <div key={entry.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium">{entry.customer_name}</p>
                              {getStatusBadge(entry.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {entry.customer_email || entry.customer_phone}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Preferred Date: {entry.preferred_date} • {entry.passengers} passengers
                              {entry.boats && ` • ${entry.boats.name}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              Added {new Date(entry.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No waitlist entries yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cancellation Policies */}
        <TabsContent value="policies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cancellation Policies</CardTitle>
              <CardDescription>
                Manage refund policies based on cancellation timing
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cancellationPolicies.length > 0 ? (
                <div className="space-y-4">
                  {cancellationPolicies.map((policy) => (
                    <Card key={policy.id} className="border-2">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{policy.name}</CardTitle>
                            {policy.description && (
                              <CardDescription>{policy.description}</CardDescription>
                            )}
                          </div>
                          {policy.is_default && (
                            <Badge className="bg-blue-100 text-blue-700">Default</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">72+ hours before</div>
                            <div className="font-medium text-green-600">
                              {getRefundLabel(policy.hours_before_72)}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">48-72 hours before</div>
                            <div className="font-medium text-blue-600">
                              {getRefundLabel(policy.hours_before_48)}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">24-48 hours before</div>
                            <div className="font-medium text-yellow-600">
                              {getRefundLabel(policy.hours_before_24)}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Less than 24 hours</div>
                            <div className="font-medium text-red-600">No Refund</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No cancellation policies configured
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-base">Policy Example</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>
                <strong>Scenario:</strong> Customer books a €500 charter and cancels 60 hours before
                departure
              </p>
              <p>
                <strong>Result:</strong> Under the standard policy (48-72 hours = 75% refund), they
                receive €375 back
              </p>
              <p className="text-muted-foreground mt-4">
                Cancellation policies help set clear expectations and protect your business while
                being fair to customers.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Coming Soon Features */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Coming Soon</CardTitle>
              <CardDescription>
                Additional advanced booking features currently in development
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">🔄 Recurring Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• Daily, weekly, or monthly recurring charters</li>
                      <li>• Auto-generate bookings based on patterns</li>
                      <li>• Skip holidays and custom dates</li>
                      <li>• Perfect for regular corporate clients</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">📝 Booking Templates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• Save common booking configurations</li>
                      <li>• Quick re-booking for repeat customers</li>
                      <li>• Pre-fill customer and boat details</li>
                      <li>• Speed up the booking process</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">👥 Group Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• Coordinate multiple boats for events</li>
                      <li>• Track total group size and boats</li>
                      <li>• Single organizer contact management</li>
                      <li>• Bulk pricing and deposits</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">📋 Custom Policies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• Create multiple cancellation policies</li>
                      <li>• Assign policies to specific boats</li>
                      <li>• Seasonal policy variations</li>
                      <li>• Automated refund calculations</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm">
                  <strong>Note:</strong> These features are under active development. The database
                  schema is ready, and implementation is in progress. They will be available in future
                  updates.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
