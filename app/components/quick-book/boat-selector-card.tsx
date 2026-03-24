'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export type Boat = {
  boat_id: string
  boat_name: string
  boat_type: string
  capacity: number
  image_url?: string
}

export type Pricing = {
  id: string
  boat_id: string
  duration: string
  package_type: string
  price: number
}

type BoatSelectorCardProps = {
  availableBoats: Boat[]
  selectedBoat: string
  onSelectBoat: (id: string) => void
  pricing: Pricing[]
  packageType: string
  passengers: string
  duration: string
  loadingBoats: boolean
  fieldError?: string
}

export default function BoatSelectorCard({
  availableBoats,
  selectedBoat,
  onSelectBoat,
  pricing,
  packageType,
  passengers,
  duration,
  loadingBoats,
  fieldError,
}: BoatSelectorCardProps) {
  return (
    <Card id="boat" className={fieldError ? 'border-red-500 border-2' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Choose Your Boat {fieldError && '*'}</span>
          {fieldError && (
            <span className="text-sm font-normal text-red-600">Required</span>
          )}
        </CardTitle>
        <CardDescription>
          {loadingBoats
            ? 'Checking availability...'
            : `${availableBoats.length} boats available for this time slot. Select any boat you prefer.`}
        </CardDescription>
        {fieldError && (
          <p className="text-sm text-red-600 font-semibold mt-2">
            {fieldError}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {loadingBoats ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : availableBoats.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No boats available for selected time slot. Try different time or date.
          </p>
        ) : (
          <div className="space-y-2">
            {availableBoats.map((boat) => {
              const boatPrice = pricing.find(
                p => p.boat_id === boat.boat_id && p.package_type === packageType
              )

              // Check if boat meets passenger requirements
              const passengersNum = parseInt(passengers) || 0
              const meetsCapacity = boat.capacity >= passengersNum
              const isRecommended = boat.capacity >= passengersNum && boat.capacity <= passengersNum + 2

              return (
                <div
                  key={boat.boat_id}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onSelectBoat(boat.boat_id)
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onSelectBoat(boat.boat_id)
                    }
                  }}
                  className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md min-h-[88px] ${
                    selectedBoat === boat.boat_id
                      ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950 ring-2 ring-blue-200 dark:ring-blue-700'
                      : !meetsCapacity
                      ? 'border-orange-200 dark:border-orange-700 bg-orange-50 dark:bg-orange-950 hover:border-orange-300 dark:hover:border-orange-600'
                      : fieldError
                      ? 'border-red-200 dark:border-red-700 hover:border-red-300 dark:hover:border-red-600'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  style={{ position: 'relative', zIndex: 1 }}
                >
                  <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                    <input
                      type="radio"
                      name="boat"
                      value={boat.boat_id}
                      checked={selectedBoat === boat.boat_id}
                      onChange={() => {
                        // Handled by div onClick
                      }}
                      className="w-4 h-4 pointer-events-none mt-0.5 sm:mt-0 flex-shrink-0"
                      readOnly
                      tabIndex={-1}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-semibold break-words">{boat.boat_name}</p>
                        {isRecommended && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                            Recommended
                          </span>
                        )}
                        {!meetsCapacity && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                            Too Small
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground capitalize break-words">
                        {boat.boat_type} • {boat.capacity} pax
                      </p>
                      {!meetsCapacity && (
                        <p className="text-xs text-orange-600 mt-1 break-words">
                          Needs {passengersNum - boat.capacity} more {passengersNum - boat.capacity === 1 ? 'seat' : 'seats'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-0 flex-shrink-0 sm:text-right">
                    <p className="font-bold text-base sm:text-lg">
                      €{boatPrice?.price || 0}
                    </p>
                    <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-0">
                      <p className="text-xs text-muted-foreground">
                        {duration}
                      </p>
                      {passengersNum > 0 && (
                        <p className={`text-xs ${
                          meetsCapacity ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {meetsCapacity ? '✓' : '✗'} {passengersNum} pax
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
