'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, AlertCircle, DollarSign, UserCheck, Users, Zap } from 'lucide-react'

interface ProfitabilityWidgetProps {
  totalPrice: number
  captainFee: number
  sailorFee: number
  agentCommission: number
  fuelCost?: number
  packageAddonCost?: number
}

export default function ProfitabilityWidget({
  totalPrice,
  captainFee,
  sailorFee,
  agentCommission,
  fuelCost = 0,
  packageAddonCost = 0,
}: ProfitabilityWidgetProps) {
  // Calculate profitability metrics with all costs
  const totalCosts = (captainFee || 0) + (sailorFee || 0) + (agentCommission || 0) + (fuelCost || 0) + (packageAddonCost || 0)
  const netProfit = totalPrice - totalCosts
  const profitMargin = totalPrice > 0 ? (netProfit / totalPrice) * 100 : 0

  // Determine status
  const isProfitable = netProfit > 10
  const isLoss = netProfit < -10
  const isBreakEven = !isProfitable && !isLoss

  // Format currency
  const formatCurrency = (amount: number) => `€${amount.toFixed(2)}`

  // Determine styling based on status
  const getStatusStyles = () => {
    if (isProfitable) {
      return {
        bgColor: 'bg-green-50 dark:bg-green-950/30',
        borderColor: 'border-green-200 dark:border-green-800',
        textColor: 'text-green-700 dark:text-green-400',
        iconColor: 'text-green-600 dark:text-green-400',
        badgeBg: 'bg-green-100 dark:bg-green-900/30',
        badgeText: 'text-green-700 dark:text-green-400',
      }
    } else if (isLoss) {
      return {
        bgColor: 'bg-red-50 dark:bg-red-950/30',
        borderColor: 'border-red-200 dark:border-red-800',
        textColor: 'text-red-700 dark:text-red-400',
        iconColor: 'text-red-600 dark:text-red-400',
        badgeBg: 'bg-red-100 dark:bg-red-900/30',
        badgeText: 'text-red-700 dark:text-red-400',
      }
    } else {
      return {
        bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        textColor: 'text-yellow-700 dark:text-yellow-400',
        iconColor: 'text-yellow-600 dark:text-yellow-400',
        badgeBg: 'bg-yellow-100 dark:bg-yellow-900/30',
        badgeText: 'text-yellow-700 dark:text-yellow-400',
      }
    }
  }

  const styles = getStatusStyles()

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            {isProfitable ? (
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            ) : isLoss ? (
              <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            )}
            Profitability Analysis
          </CardTitle>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${styles.badgeBg} ${styles.badgeText}`}>
            {isProfitable ? 'Profitable' : isLoss ? 'Loss' : 'Break-even'}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Net Profit Display */}
        <div
          className={`p-4 rounded-lg border-2 ${styles.bgColor} ${styles.borderColor} text-center`}
        >
          <p className={`text-xs font-medium ${styles.textColor} mb-1`}>Net Profit</p>
          <p className={`text-3xl font-bold ${styles.textColor}`}>
            {formatCurrency(netProfit)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {profitMargin.toFixed(1)}% margin
          </p>
        </div>

        {/* Cost Breakdown */}
        <div className="space-y-3 pt-2">
          {/* Revenue */}
          <div className="flex justify-between items-center p-2 bg-muted/30 dark:bg-muted/20 rounded">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-muted-foreground">Total Revenue</span>
            </div>
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {formatCurrency(totalPrice)}
            </span>
          </div>

          {/* Costs Section */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Operating Costs</p>

            {/* Captain Fee */}
            {captainFee > 0 && (
              <div className="flex justify-between items-center pl-6 p-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs w-1 h-1 rounded-full bg-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Captain Fee</span>
                </div>
                <span className="font-semibold text-foreground">
                  -{formatCurrency(captainFee)}
                </span>
              </div>
            )}

            {/* Sailor Fee */}
            {sailorFee > 0 && (
              <div className="flex justify-between items-center pl-6 p-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs w-1 h-1 rounded-full bg-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Sailor Fee</span>
                </div>
                <span className="font-semibold text-purple-600 dark:text-purple-400">
                  -{formatCurrency(sailorFee)}
                </span>
              </div>
            )}

            {/* Agent Commission */}
            {agentCommission > 0 && (
              <div className="flex justify-between items-center pl-6 p-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs w-1 h-1 rounded-full bg-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Agent Commission</span>
                </div>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  -{formatCurrency(agentCommission)}
                </span>
              </div>
            )}

            {/* Fuel Cost */}
            {fuelCost > 0 && (
              <div className="flex justify-between items-center pl-6 p-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs w-1 h-1 rounded-full bg-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Fuel Cost</span>
                </div>
                <span className="font-semibold text-orange-600 dark:text-orange-400">
                  -{formatCurrency(fuelCost)}
                </span>
              </div>
            )}

            {/* Package Add-on Cost */}
            {packageAddonCost > 0 && (
              <div className="flex justify-between items-center pl-6 p-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs w-1 h-1 rounded-full bg-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Package Add-on Cost</span>
                </div>
                <span className="font-semibold text-purple-600 dark:text-purple-400">
                  -{formatCurrency(packageAddonCost)}
                </span>
              </div>
            )}

            {/* No costs message */}
            {totalCosts === 0 && (
              <div className="pl-6 p-2">
                <span className="text-sm text-muted-foreground italic">
                  No operational costs recorded
                </span>
              </div>
            )}
          </div>

          {/* Total Costs */}
          {totalCosts > 0 && (
            <div className="flex justify-between items-center p-2 bg-muted/30 dark:bg-muted/20 rounded border-t pt-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-semibold text-muted-foreground">Total Costs</span>
              </div>
              <span className="font-bold text-red-600 dark:text-red-400">
                -{formatCurrency(totalCosts)}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
