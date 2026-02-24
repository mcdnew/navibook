'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface PortalData {
  booking: any
  payments: any[]
  changeRequests: any[]
  weatherData: any
  paymentSummary: {
    totalPrice: number
    totalPaid: number
    amountDue: number
    status: 'paid' | 'partial' | 'unpaid'
  }
  customerInfo: {
    email: string
    name: string
  }
}

export default function PortalClient({ token }: { token: string }) {
  const [data, setData] = useState<PortalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [changeRequestOpen, setChangeRequestOpen] = useState(false)
  const [submittingRequest, setSubmittingRequest] = useState(false)

  // Change request form state
  const [requestType, setRequestType] = useState<string>('')
  const [requestedValue, setRequestedValue] = useState<string>('')
  const [customerMessage, setCustomerMessage] = useState<string>('')

  useEffect(() => {
    fetchPortalData()
  }, [token])

  async function fetchPortalData() {
    try {
      setLoading(true)
      const response = await fetch(`/api/portal/booking?token=${token}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to load booking')
      }
      const data = await response.json()
      setData(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmitChangeRequest() {
    if (!requestType || !requestedValue) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setSubmittingRequest(true)
      const response = await fetch('/api/portal/change-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          requestType,
          currentValue: getCurrentValue(requestType),
          requestedValue,
          customerMessage,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit change request')
      }

      toast.success('Change request submitted successfully')
      setChangeRequestOpen(false)
      setRequestType('')
      setRequestedValue('')
      setCustomerMessage('')
      fetchPortalData() // Refresh data
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmittingRequest(false)
    }
  }

  function getCurrentValue(type: string): string {
    if (!data) return ''
    switch (type) {
      case 'date_change':
        return data.booking.booking_date
      case 'time_change':
        return `${data.booking.start_time} - ${data.booking.end_time}`
      case 'package_change':
        return data.booking.package_name || 'N/A'
      case 'participant_count':
        return data.booking.number_of_guests?.toString() || 'N/A'
      default:
        return 'N/A'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your booking...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Access Error</CardTitle>
            <CardDescription>{error || 'Unable to load booking details'}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              This link may have expired or is invalid. Please contact the company for a new link.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { booking, payments, changeRequests, weatherData, paymentSummary, customerInfo } = data

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: any } = {
      confirmed: 'default',
      pending: 'secondary',
      cancelled: 'destructive',
      completed: 'outline',
    }
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>
  }

  const getPaymentStatusBadge = (status: string) => {
    const colors: { [key: string]: string } = {
      paid: 'bg-green-100 text-green-800',
      partial: 'bg-yellow-100 text-yellow-800',
      unpaid: 'bg-red-100 text-red-800',
    }
    return (
      <Badge className={colors[status]}>
        {status === 'paid' ? 'Fully Paid' : status === 'partial' ? 'Partially Paid' : 'Unpaid'}
      </Badge>
    )
  }

  const getChangeRequestStatusBadge = (status: string) => {
    const variants: { [key: string]: any } = {
      pending: 'secondary',
      approved: 'default',
      rejected: 'destructive',
      completed: 'outline',
    }
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Booking</h1>
              <p className="text-gray-600 mt-1">Welcome back, {customerInfo.name}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Booking ID</div>
              <div className="font-mono text-sm">{booking.id.split('-')[0]}</div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white p-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            {weatherData && <TabsTrigger value="weather">Weather</TabsTrigger>}
            <TabsTrigger value="requests">Change Requests</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Booking Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Booking Details</CardTitle>
                  {getStatusBadge(booking.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">{booking.boats?.name}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Boat Type:</span>
                        <span className="font-medium">{booking.boats?.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Capacity:</span>
                        <span className="font-medium">{booking.boats?.capacity} people</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Number of Guests:</span>
                        <span className="font-medium">{booking.number_of_guests || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">
                        {format(new Date(booking.booking_date), 'EEEE, MMMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">
                        {booking.start_time} - {booking.end_time}
                      </span>
                    </div>
                    {booking.package_name && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Package:</span>
                        <span className="font-medium">{booking.package_name}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{booking.duration}</span>
                    </div>
                  </div>
                </div>

                {booking.special_requests && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium text-sm mb-2">Special Requests</h4>
                      <p className="text-sm text-gray-600">{booking.special_requests}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Payment Summary</CardTitle>
                  {getPaymentStatusBadge(paymentSummary.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">Total Price:</span>
                  <span className="font-semibold">€{paymentSummary.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Paid:</span>
                  <span className="text-green-600 font-medium">
                    €{paymentSummary.totalPaid.toFixed(2)}
                  </span>
                </div>
                {paymentSummary.amountDue > 0 && (
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-600">Amount Due:</span>
                    <span className="text-red-600 font-semibold">
                      €{paymentSummary.amountDue.toFixed(2)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Company Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Company Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Company:</span>
                  <span className="font-medium">{booking.companies?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{booking.companies?.email}</span>
                </div>
                {booking.companies?.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{booking.companies?.phone}</span>
                  </div>
                )}
                {booking.companies?.address && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Address:</span>
                    <span className="font-medium text-right max-w-xs">
                      {booking.companies?.address}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>Need to make changes to your booking?</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={changeRequestOpen} onOpenChange={setChangeRequestOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full md:w-auto">Request Change</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Request Booking Change</DialogTitle>
                      <DialogDescription>
                        Submit a request to modify your booking. We&apos;ll review it and get back to you
                        soon.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label>Change Type *</Label>
                        <Select value={requestType} onValueChange={setRequestType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select change type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="date_change">Date Change</SelectItem>
                            <SelectItem value="time_change">Time Change</SelectItem>
                            <SelectItem value="package_change">Package Change</SelectItem>
                            <SelectItem value="participant_count">
                              Number of Participants
                            </SelectItem>
                            <SelectItem value="cancellation">Cancellation</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {requestType && (
                        <div>
                          <Label>Current Value</Label>
                          <Input value={getCurrentValue(requestType)} disabled />
                        </div>
                      )}

                      {requestType && requestType !== 'cancellation' && (
                        <div>
                          <Label>Requested Value *</Label>
                          <Input
                            value={requestedValue}
                            onChange={(e) => setRequestedValue(e.target.value)}
                            placeholder="Enter new value"
                          />
                        </div>
                      )}

                      <div>
                        <Label>Additional Message</Label>
                        <Textarea
                          value={customerMessage}
                          onChange={(e) => setCustomerMessage(e.target.value)}
                          placeholder="Any additional details..."
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={handleSubmitChangeRequest}
                          disabled={submittingRequest}
                          className="flex-1"
                        >
                          {submittingRequest ? 'Submitting...' : 'Submit Request'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setChangeRequestOpen(false)}
                          disabled={submittingRequest}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>All payments made for this booking</CardDescription>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No payments recorded yet</p>
                ) : (
                  <div className="space-y-3">
                    {payments.map((payment: any) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium">
                            {payment.payment_type.replace('_', ' ').toUpperCase()}
                          </div>
                          <div className="text-sm text-gray-600">
                            {format(new Date(payment.payment_date), 'MMM d, yyyy')} •{' '}
                            {payment.payment_method}
                          </div>
                          {payment.notes && (
                            <div className="text-xs text-gray-500 mt-1">{payment.notes}</div>
                          )}
                        </div>
                        <div
                          className={`text-lg font-semibold ${
                            payment.amount >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          €{Math.abs(payment.amount).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Weather Tab */}
          {weatherData && (
            <TabsContent value="weather" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weather Forecast</CardTitle>
                  <CardDescription>
                    Forecast for {format(new Date(booking.booking_date), 'MMMM d, yyyy')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <AlertTitle>Marine Conditions</AlertTitle>
                    <AlertDescription>
                      Weather data is provided for planning purposes. Always check current conditions
                      before departure.
                    </AlertDescription>
                  </Alert>
                  {/* Weather data display would go here - simplified for now */}
                  <div className="mt-4 text-sm text-gray-600">
                    Weather forecast data available via Open-Meteo API
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Change Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Requests</CardTitle>
                <CardDescription>Track your booking modification requests</CardDescription>
              </CardHeader>
              <CardContent>
                {changeRequests.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No change requests submitted</p>
                ) : (
                  <div className="space-y-3">
                    {changeRequests.map((request: any) => (
                      <div key={request.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">
                            {request.request_type.replace('_', ' ').toUpperCase()}
                          </div>
                          {getChangeRequestStatusBadge(request.status)}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>
                            Submitted: {format(new Date(request.created_at), 'MMM d, yyyy h:mm a')}
                          </div>
                          {request.current_value && (
                            <div>
                              Current: <span className="font-medium">{request.current_value}</span>
                            </div>
                          )}
                          {request.requested_value && (
                            <div>
                              Requested:{' '}
                              <span className="font-medium">{request.requested_value}</span>
                            </div>
                          )}
                          {request.customer_message && (
                            <div className="mt-2 p-2 bg-gray-50 rounded">
                              {request.customer_message}
                            </div>
                          )}
                          {request.admin_response && (
                            <div className="mt-2 p-2 bg-blue-50 rounded border-l-4 border-blue-600">
                              <div className="font-medium text-sm">Response:</div>
                              {request.admin_response}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
