'use client'

import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Clock } from 'lucide-react'

type BookingSummaryCardProps = {
  visible: boolean
  date: Date
  startTime: string
  duration: string
  passengers: string
  totalPrice: number
  fuelCost: number
  packageAddonCost: number
  captainFee: number
  commission: number
  depositAmount: string
  canCreateInternalBookings: boolean | string | null | undefined
  userCommissionPercentage: number | undefined
  calculateEndTime: (start: string, dur: string) => string
}

type ConfirmationOptionCardProps = {
  visible: boolean
  confirmImmediately: boolean
  onChange: (value: boolean) => void
}

export function BookingSummaryCard({
  visible,
  date,
  startTime,
  duration,
  passengers,
  totalPrice,
  fuelCost,
  packageAddonCost,
  captainFee,
  commission,
  depositAmount,
  canCreateInternalBookings,
  userCommissionPercentage,
  calculateEndTime,
}: BookingSummaryCardProps) {
  if (!visible) return null

  return (
    <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
      <CardHeader>
        <CardTitle>Booking Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Date:</span>
          <span className="font-semibold">{format(date, 'PPP')}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Time:</span>
          <span className="font-semibold">
            {startTime} - {calculateEndTime(startTime, duration)} ({duration})
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Passengers:</span>
          <span className="font-semibold">{passengers}</span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t dark:border-blue-800 pt-2 mt-2">
          <span>Total Price:</span>
          <span className="text-blue-600 dark:text-blue-300">€{totalPrice.toFixed(2)}</span>
        </div>
        {fuelCost > 0 && (
          <div className="flex justify-between text-sm text-orange-600 dark:text-orange-400">
            <span>Fuel Cost:</span>
            <span className="font-semibold">€{fuelCost.toFixed(2)}</span>
          </div>
        )}
        {packageAddonCost > 0 && (
          <div className="flex justify-between text-sm text-purple-600 dark:text-purple-400">
            <span>Package Add-on Cost:</span>
            <span className="font-semibold">€{packageAddonCost.toFixed(2)}</span>
          </div>
        )}
        {(fuelCost > 0 || packageAddonCost > 0) && (
          <div className="flex justify-between text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded">
            <span>Total Operational Costs:</span>
            <span>€{(fuelCost + packageAddonCost).toFixed(2)}</span>
          </div>
        )}
        {captainFee > 0 && (
          <div className="flex justify-between text-sm text-orange-600 dark:text-orange-400">
            <span>Captain Cost:</span>
            <span className="font-semibold">€{captainFee.toFixed(2)}</span>
          </div>
        )}
        {canCreateInternalBookings && (fuelCost > 0 || packageAddonCost > 0 || captainFee > 0) && (
          <div className="flex justify-between text-sm font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 p-2 rounded border border-green-200 dark:border-green-800">
            <span>Net Profit (after costs):</span>
            <span>€{(totalPrice - fuelCost - packageAddonCost - captainFee).toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
          <span>Your Commission ({userCommissionPercentage}%):</span>
          <span className="font-semibold">€{commission.toFixed(2)}</span>
        </div>
        {parseFloat(depositAmount) > 0 && (
          <div className="flex justify-between text-sm">
            <span>Deposit:</span>
            <span className="font-semibold">€{depositAmount}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function ConfirmationOptionCard({
  visible,
  confirmImmediately,
  onChange,
}: ConfirmationOptionCardProps) {
  if (!visible) return null

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
      <CardHeader>
        <CardTitle className="text-base">Confirmation Option</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div
          onClick={() => onChange(false)}
          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
            !confirmImmediately
              ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200'
              : 'border-gray-200 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name="confirmOption"
              checked={!confirmImmediately}
              onChange={() => onChange(false)}
              className="w-4 h-4"
            />
            <div className="flex-1">
              <p className="font-semibold">Hold for 15 Minutes</p>
              <p className="text-sm text-muted-foreground">
                Reserve the boat with a temporary hold. You can confirm later.
              </p>
            </div>
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
        </div>

        <div
          onClick={() => onChange(true)}
          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
            confirmImmediately
              ? 'border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-950 ring-2 ring-green-200 dark:ring-green-700'
              : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name="confirmOption"
              checked={confirmImmediately}
              onChange={() => onChange(true)}
              className="w-4 h-4"
            />
            <div className="flex-1">
              <p className="font-semibold">Confirm Immediately</p>
              <p className="text-sm text-muted-foreground">
                Finalize the booking right away. No hold period.
              </p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
