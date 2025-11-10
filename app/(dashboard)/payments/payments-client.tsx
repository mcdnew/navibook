'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'paypal' | 'stripe' | 'other'
type PaymentType = 'deposit' | 'final_payment' | 'full_payment' | 'refund' | 'partial_refund'

interface PaymentTransaction {
  id: string
  amount: number
  payment_type: PaymentType
  payment_method: PaymentMethod
  transaction_reference?: string
  notes?: string
  payment_date: string
  recorded_by?: string
  created_at: string
}

interface Booking {
  id: string
  booking_date: string
  start_time: string
  customer_name: string
  customer_email?: string
  customer_phone: string
  total_price: number
  status: string
  boats?: { name: string }
  payment_transactions?: PaymentTransaction[]
}

interface BookingWithPayments extends Booking {
  total_paid: number
  outstanding_balance: number
  payment_status: 'paid' | 'partial' | 'unpaid'
}

interface PaymentsClientProps {
  bookings: Booking[]
}

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'stripe', label: 'Stripe' },
  { value: 'other', label: 'Other' },
] as const

const PAYMENT_TYPES = [
  { value: 'deposit', label: 'Deposit' },
  { value: 'final_payment', label: 'Final Payment' },
  { value: 'full_payment', label: 'Full Payment' },
  { value: 'refund', label: 'Refund' },
  { value: 'partial_refund', label: 'Partial Refund' },
] as const

export default function PaymentsClient({ bookings }: PaymentsClientProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'partial' | 'unpaid'>('all')
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<BookingWithPayments | null>(null)
  const [viewHistoryOpen, setViewHistoryOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [generatingLink, setGeneratingLink] = useState<string | null>(null)

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentType: 'deposit' as PaymentType,
    paymentMethod: 'cash' as PaymentMethod,
    transactionReference: '',
    notes: '',
    paymentDate: new Date().toISOString().split('T')[0],
  })

  // Calculate payment status for each booking
  const bookingsWithPayments: BookingWithPayments[] = useMemo(() => {
    return bookings.map((booking) => {
      const totalPaid = booking.payment_transactions?.reduce((sum, pt) => sum + pt.amount, 0) || 0
      const outstandingBalance = booking.total_price - totalPaid
      const paymentStatus: 'paid' | 'partial' | 'unpaid' =
        totalPaid >= booking.total_price ? 'paid' : totalPaid > 0 ? 'partial' : 'unpaid'

      return {
        ...booking,
        total_paid: totalPaid,
        outstanding_balance: outstandingBalance,
        payment_status: paymentStatus,
      }
    })
  }, [bookings])

  // Filter bookings
  const filteredBookings = useMemo(() => {
    let filtered = bookingsWithPayments

    // Filter by payment status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((b) => b.payment_status === filterStatus)
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (b) =>
          b.customer_name.toLowerCase().includes(term) ||
          b.customer_email?.toLowerCase().includes(term) ||
          b.customer_phone.includes(term) ||
          b.boats?.name.toLowerCase().includes(term)
      )
    }

    return filtered.sort((a, b) => {
      // Sort by outstanding balance descending
      return b.outstanding_balance - a.outstanding_balance
    })
  }, [bookingsWithPayments, filterStatus, searchTerm])

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalOutstanding = bookingsWithPayments.reduce((sum, b) => sum + b.outstanding_balance, 0)
    const totalCollected = bookingsWithPayments.reduce((sum, b) => sum + b.total_paid, 0)
    const unpaidCount = bookingsWithPayments.filter((b) => b.payment_status === 'unpaid').length
    const partialCount = bookingsWithPayments.filter((b) => b.payment_status === 'partial').length

    return {
      totalOutstanding,
      totalCollected,
      unpaidCount,
      partialCount,
    }
  }, [bookingsWithPayments])

  const handleRecordPayment = async () => {
    if (!selectedBooking) return

    const amount = parseFloat(paymentForm.amount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (amount > selectedBooking.outstanding_balance && !paymentForm.paymentType.includes('refund')) {
      toast.error('Payment amount exceeds outstanding balance')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/payments/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedBooking.id,
          amount: paymentForm.paymentType.includes('refund') ? -amount : amount,
          paymentType: paymentForm.paymentType,
          paymentMethod: paymentForm.paymentMethod,
          transactionReference: paymentForm.transactionReference || null,
          notes: paymentForm.notes || null,
          paymentDate: paymentForm.paymentDate,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to record payment')
      }

      toast.success('Payment recorded successfully')
      setRecordPaymentOpen(false)
      setPaymentForm({
        amount: '',
        paymentType: 'deposit',
        paymentMethod: 'cash',
        transactionReference: '',
        notes: '',
        paymentDate: new Date().toISOString().split('T')[0],
      })
      setSelectedBooking(null)
      router.refresh()
    } catch (error: any) {
      console.error('Record payment error:', error)
      toast.error(error.message || 'Failed to record payment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openRecordPayment = (booking: BookingWithPayments) => {
    setSelectedBooking(booking)
    setPaymentForm({
      ...paymentForm,
      amount: booking.outstanding_balance.toFixed(2),
      paymentType: booking.total_paid > 0 ? 'final_payment' : 'deposit',
    })
    setRecordPaymentOpen(true)
  }

  const openViewHistory = (booking: BookingWithPayments) => {
    setSelectedBooking(booking)
    setViewHistoryOpen(true)
  }

  const handleGeneratePaymentLink = async (booking: BookingWithPayments) => {
    setGeneratingLink(booking.id)

    try {
      // Determine payment type based on outstanding balance
      const paymentType = booking.total_paid > 0 ? 'balance' : 'deposit'

      const response = await fetch('/api/payments/create-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          paymentType,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create payment link')
      }

      const data = await response.json()

      // Copy link to clipboard
      await navigator.clipboard.writeText(data.paymentLinkUrl)

      toast.success(`Payment link created and copied to clipboard! Amount: €${data.amount.toFixed(2)}`)

      // Open link in new tab for preview
      window.open(data.paymentLinkUrl, '_blank')

      router.refresh()
    } catch (error: any) {
      console.error('Generate payment link error:', error)
      toast.error(error.message || 'Failed to generate payment link')
    } finally {
      setGeneratingLink(null)
    }
  }

  const getPaymentStatusBadge = (status: 'paid' | 'partial' | 'unpaid') => {
    if (status === 'paid') {
      return <Badge className="bg-green-100 text-green-700">Paid</Badge>
    } else if (status === 'partial') {
      return <Badge className="bg-yellow-100 text-yellow-700">Partial</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-700">Unpaid</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Outstanding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              {formatCurrency(summaryStats.totalOutstanding)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Collected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(summaryStats.totalCollected)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unpaid Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summaryStats.unpaidCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Partial Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summaryStats.partialCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Tracking</CardTitle>
          <CardDescription>Track deposits, final payments, and outstanding balances</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by customer name, email, phone, or boat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Bookings</SelectItem>
                <SelectItem value="unpaid">Unpaid Only</SelectItem>
                <SelectItem value="partial">Partial Payments</SelectItem>
                <SelectItem value="paid">Fully Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {filteredBookings.length} of {bookingsWithPayments.length} bookings
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <Card>
        <CardHeader>
          <CardTitle>Bookings & Payments</CardTitle>
          <CardDescription>All bookings with payment status</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredBookings.length > 0 ? (
            <div className="space-y-2">
              {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{booking.customer_name}</p>
                      {getPaymentStatusBadge(booking.payment_status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {booking.booking_date} at {booking.start_time} • {booking.boats?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {booking.customer_email || booking.customer_phone}
                    </p>
                  </div>

                  <div className="flex flex-col md:items-end gap-2">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Total: <span className="font-medium">{formatCurrency(booking.total_price)}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Paid: <span className="font-medium text-green-600">{formatCurrency(booking.total_paid)}</span>
                      </p>
                      {booking.outstanding_balance > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Outstanding:{' '}
                          <span className="font-medium text-red-600">
                            {formatCurrency(booking.outstanding_balance)}
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openViewHistory(booking)}>
                        View History
                      </Button>
                      {booking.outstanding_balance > 0 && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleGeneratePaymentLink(booking)} disabled={generatingLink === booking.id}>
                            {generatingLink === booking.id ? 'Generating...' : '🔗 Payment Link'}
                          </Button>
                          <Button size="sm" onClick={() => openRecordPayment(booking)}>
                            Record Payment
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No bookings found</p>
          )}
        </CardContent>
      </Card>

      {/* Record Payment Dialog */}
      <Dialog open={recordPaymentOpen} onOpenChange={setRecordPaymentOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment for {selectedBooking?.customer_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Booking Details</Label>
              <p className="text-sm text-muted-foreground">
                {selectedBooking?.booking_date} • {selectedBooking?.boats?.name}
              </p>
              <p className="text-sm text-muted-foreground">
                Total: {formatCurrency(selectedBooking?.total_price || 0)} | Paid:{' '}
                {formatCurrency(selectedBooking?.total_paid || 0)} | Outstanding:{' '}
                {formatCurrency(selectedBooking?.outstanding_balance || 0)}
              </p>
            </div>

            <div>
              <Label htmlFor="paymentType">Payment Type</Label>
              <Select
                value={paymentForm.paymentType}
                onValueChange={(value: PaymentType) =>
                  setPaymentForm({ ...paymentForm, paymentType: value })
                }
              >
                <SelectTrigger id="paymentType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={paymentForm.paymentMethod}
                onValueChange={(value: PaymentMethod) =>
                  setPaymentForm({ ...paymentForm, paymentMethod: value })
                }
              >
                <SelectTrigger id="paymentMethod">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="paymentDate">Payment Date</Label>
              <Input
                id="paymentDate"
                type="date"
                value={paymentForm.paymentDate}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="transactionReference">Transaction Reference (Optional)</Label>
              <Input
                id="transactionReference"
                value={paymentForm.transactionReference}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, transactionReference: e.target.value })
                }
                placeholder="Card transaction ID, bank ref, etc."
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setRecordPaymentOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleRecordPayment} disabled={isSubmitting}>
                {isSubmitting ? 'Recording...' : 'Record Payment'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment History Dialog */}
      <Dialog open={viewHistoryOpen} onOpenChange={setViewHistoryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment History</DialogTitle>
            <DialogDescription>
              All payments for {selectedBooking?.customer_name} - {selectedBooking?.booking_date}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Total Price</p>
                <p className="font-medium">{formatCurrency(selectedBooking?.total_price || 0)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="font-medium text-green-600">
                  {formatCurrency(selectedBooking?.total_paid || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="font-medium text-red-600">
                  {formatCurrency(selectedBooking?.outstanding_balance || 0)}
                </p>
              </div>
            </div>

            {selectedBooking?.payment_transactions && selectedBooking.payment_transactions.length > 0 ? (
              <div className="space-y-2">
                {selectedBooking.payment_transactions
                  .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
                  .map((transaction) => (
                    <div key={transaction.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium capitalize">
                            {transaction.payment_type.replace(/_/g, ' ')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.payment_date} •{' '}
                            {transaction.payment_method.replace(/_/g, ' ')}
                          </p>
                        </div>
                        <p
                          className={`text-lg font-bold ${
                            transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {transaction.amount >= 0 ? '+' : ''}
                          {formatCurrency(transaction.amount)}
                        </p>
                      </div>
                      {transaction.transaction_reference && (
                        <p className="text-sm text-muted-foreground">
                          Ref: {transaction.transaction_reference}
                        </p>
                      )}
                      {transaction.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{transaction.notes}</p>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No payment transactions recorded</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
