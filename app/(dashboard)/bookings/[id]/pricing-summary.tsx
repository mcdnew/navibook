'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react'
import PaymentStatusToggle from './payment-status-toggle'

interface PricingSummaryProps {
  bookingId: string
  totalPrice: number
  depositAmount: number
  depositPaid: boolean
}

export default function PricingSummary({
  bookingId,
  totalPrice,
  depositAmount,
  depositPaid: initialDepositPaid,
}: PricingSummaryProps) {
  const [depositPaid, setDepositPaid] = useState(initialDepositPaid)

  // Sync with server updates (when page refreshes)
  useEffect(() => {
    setDepositPaid(initialDepositPaid)
  }, [initialDepositPaid])

  // Calculate outstanding balance
  const paidAmount = depositPaid ? depositAmount : 0
  const outstandingBalance = totalPrice - paidAmount
  const isFullyPaid = outstandingBalance === 0
  const paymentProgress = totalPrice > 0 ? (paidAmount / totalPrice) * 100 : 0

  // Format currency
  const formatCurrency = (amount: number) => `€${amount.toFixed(2)}`

  // Handle deposit status change
  const handleDepositStatusChange = (newStatus: boolean) => {
    setDepositPaid(newStatus)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Pricing Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Price */}
        <div className="flex justify-between items-center pb-3 border-b-2 border-border">
          <span className="text-sm font-medium text-muted-foreground">Total Price</span>
          <span className="text-3xl font-bold text-foreground">{formatCurrency(totalPrice)}</span>
        </div>

        {/* Payment Progress Bar */}
        {depositAmount > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Payment Progress</span>
              <span>{Math.round(paymentProgress)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isFullyPaid
                    ? 'bg-green-500'
                    : paymentProgress > 0
                    ? 'bg-blue-500'
                    : 'bg-orange-500'
                }`}
                style={{ width: `${paymentProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="space-y-3 pt-2">
          {/* Deposit Required */}
          {depositAmount > 0 ? (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Deposit Required</span>
                <span className="font-semibold text-base">
                  {formatCurrency(depositAmount)}
                </span>
              </div>

              {/* Deposit Status */}
              <div className="flex justify-between items-center bg-muted/50 dark:bg-muted/30 p-3 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground">Deposit Status</span>
                <PaymentStatusToggle
                  bookingId={bookingId}
                  depositPaid={depositPaid}
                  depositAmount={depositAmount}
                  onStatusChange={handleDepositStatusChange}
                />
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 p-3 rounded-lg">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium">No deposit required</span>
            </div>
          )}

          {/* Outstanding Balance */}
          <div
            className={`flex justify-between items-center pt-3 border-t-2 ${
              isFullyPaid
                ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30'
                : outstandingBalance === totalPrice
                ? 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30'
                : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30'
            } p-3 rounded-lg transition-all duration-300`}
          >
            <div className="flex items-center gap-2">
              {isFullyPaid ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : outstandingBalance < totalPrice ? (
                <TrendingDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              ) : (
                <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              )}
              <span
                className={`text-sm font-semibold ${
                  isFullyPaid
                    ? 'text-green-700 dark:text-green-400'
                    : outstandingBalance < totalPrice
                    ? 'text-blue-700 dark:text-blue-400'
                    : 'text-orange-700 dark:text-orange-400'
                }`}
              >
                {isFullyPaid ? 'Fully Paid' : 'Outstanding Balance'}
              </span>
            </div>
            <span
              className={`text-2xl font-bold ${
                isFullyPaid
                  ? 'text-green-600 dark:text-green-400'
                  : outstandingBalance < totalPrice
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-orange-600 dark:text-orange-400'
              }`}
            >
              {formatCurrency(outstandingBalance)}
            </span>
          </div>

          {/* Payment Breakdown (if deposit paid) */}
          {depositPaid && depositAmount > 0 && !isFullyPaid && (
            <div className="text-xs text-muted-foreground space-y-1 pt-2">
              <div className="flex justify-between">
                <span>Total:</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Deposit Paid:</span>
                <span>-{formatCurrency(depositAmount)}</span>
              </div>
              <div className="flex justify-between font-semibold text-foreground border-t pt-1">
                <span>Remaining:</span>
                <span>{formatCurrency(outstandingBalance)}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
