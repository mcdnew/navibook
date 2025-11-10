'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Notification {
  id: string
  notification_type: string
  channel: string
  status: string
  recipient_email?: string
  recipient_name?: string
  subject?: string
  sent_at?: string
  created_at: string
}

interface NotificationsClientProps {
  notifications: Notification[]
}

export default function NotificationsClient({ notifications }: NotificationsClientProps) {
  const router = useRouter()
  const [isLoadingPrefs, setIsLoadingPrefs] = useState(true)
  const [isSavingPrefs, setIsSavingPrefs] = useState(false)
  const [prefs, setPrefs] = useState({
    email_booking_confirmations: true,
    email_booking_reminders: true,
    email_booking_changes: true,
    email_payment_notifications: true,
    email_agent_notifications: true,
    email_low_availability: true,
    sms_booking_confirmations: false,
    sms_booking_reminders: false,
    sms_urgent_only: true,
    reminder_hours_before: 24,
  })

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences')
      if (response.ok) {
        const data = await response.json()
        setPrefs(data)
      }
    } catch (error) {
      console.error('Error fetching preferences:', error)
    } finally {
      setIsLoadingPrefs(false)
    }
  }

  const savePreferences = async () => {
    setIsSavingPrefs(true)
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      })

      if (!response.ok) {
        throw new Error('Failed to save preferences')
      }

      toast.success('Notification preferences saved successfully')
      router.refresh()
    } catch (error: any) {
      console.error('Error saving preferences:', error)
      toast.error(error.message || 'Failed to save preferences')
    } finally {
      setIsSavingPrefs(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-100 text-green-700">Sent</Badge>
      case 'delivered':
        return <Badge className="bg-blue-100 text-blue-700">Delivered</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-700">Failed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatNotificationType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{notifications.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Successful
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {notifications.filter((n) => n.status === 'sent' || n.status === 'delivered').length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              {notifications.filter((n) => n.status === 'failed').length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">
              {notifications.filter((n) => n.status === 'pending').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Manage your notification settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoadingPrefs ? (
            <p className="text-muted-foreground">Loading preferences...</p>
          ) : (
            <>
              {/* Email Notifications */}
              <div>
                <h3 className="text-lg font-medium mb-4">Email Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email_booking_confirmations" className="flex-1">
                      Booking Confirmations
                      <p className="text-sm text-muted-foreground font-normal">
                        Send confirmation emails when bookings are confirmed
                      </p>
                    </Label>
                    <Switch
                      id="email_booking_confirmations"
                      checked={prefs.email_booking_confirmations}
                      onCheckedChange={(checked) =>
                        setPrefs({ ...prefs, email_booking_confirmations: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="email_booking_reminders" className="flex-1">
                      Booking Reminders
                      <p className="text-sm text-muted-foreground font-normal">
                        Send reminder emails before bookings
                      </p>
                    </Label>
                    <Switch
                      id="email_booking_reminders"
                      checked={prefs.email_booking_reminders}
                      onCheckedChange={(checked) =>
                        setPrefs({ ...prefs, email_booking_reminders: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="email_booking_changes" className="flex-1">
                      Booking Changes
                      <p className="text-sm text-muted-foreground font-normal">
                        Send emails when bookings are modified or cancelled
                      </p>
                    </Label>
                    <Switch
                      id="email_booking_changes"
                      checked={prefs.email_booking_changes}
                      onCheckedChange={(checked) =>
                        setPrefs({ ...prefs, email_booking_changes: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="email_payment_notifications" className="flex-1">
                      Payment Notifications
                      <p className="text-sm text-muted-foreground font-normal">
                        Send payment receipt and reminder emails
                      </p>
                    </Label>
                    <Switch
                      id="email_payment_notifications"
                      checked={prefs.email_payment_notifications}
                      onCheckedChange={(checked) =>
                        setPrefs({ ...prefs, email_payment_notifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="email_low_availability" className="flex-1">
                      Low Availability Alerts
                      <p className="text-sm text-muted-foreground font-normal">
                        Receive alerts when boat availability is low
                      </p>
                    </Label>
                    <Switch
                      id="email_low_availability"
                      checked={prefs.email_low_availability}
                      onCheckedChange={(checked) =>
                        setPrefs({ ...prefs, email_low_availability: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* SMS Notifications */}
              <div>
                <h3 className="text-lg font-medium mb-4">SMS Notifications (Coming Soon)</h3>
                <div className="space-y-4 opacity-50">
                  <div className="flex items-center justify-between">
                    <Label className="flex-1">
                      SMS Booking Confirmations
                      <p className="text-sm text-muted-foreground font-normal">
                        Send SMS confirmations for bookings
                      </p>
                    </Label>
                    <Switch disabled checked={prefs.sms_booking_confirmations} />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="flex-1">
                      SMS Reminders
                      <p className="text-sm text-muted-foreground font-normal">
                        Send SMS reminders before bookings
                      </p>
                    </Label>
                    <Switch disabled checked={prefs.sms_booking_reminders} />
                  </div>
                </div>
              </div>

              {/* Reminder Timing */}
              <div>
                <h3 className="text-lg font-medium mb-4">Reminder Timing</h3>
                <div className="flex items-center gap-4">
                  <Label htmlFor="reminder_hours">Send reminders</Label>
                  <Input
                    id="reminder_hours"
                    type="number"
                    min="1"
                    max="72"
                    className="w-20"
                    value={prefs.reminder_hours_before}
                    onChange={(e) =>
                      setPrefs({ ...prefs, reminder_hours_before: parseInt(e.target.value) || 24 })
                    }
                  />
                  <Label htmlFor="reminder_hours">hours before booking</Label>
                </div>
              </div>

              <Button onClick={savePreferences} disabled={isSavingPrefs}>
                {isSavingPrefs ? 'Saving...' : 'Save Preferences'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Notification History */}
      <Card>
        <CardHeader>
          <CardTitle>Notification History</CardTitle>
          <CardDescription>Recent notifications sent from your account</CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length > 0 ? (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{formatNotificationType(notification.notification_type)}</p>
                      {getStatusBadge(notification.status)}
                      <Badge variant="outline" className="text-xs">
                        {notification.channel}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      To: {notification.recipient_name || notification.recipient_email || 'Unknown'}
                    </p>
                    {notification.subject && (
                      <p className="text-sm text-muted-foreground mt-1">{notification.subject}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {notification.sent_at
                        ? new Date(notification.sent_at).toLocaleDateString() +
                          ' ' +
                          new Date(notification.sent_at).toLocaleTimeString()
                        : new Date(notification.created_at).toLocaleDateString() +
                          ' ' +
                          new Date(notification.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No notifications sent yet</p>
          )}
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📧</span> Email Notifications Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            To enable email notifications, you need to configure Resend:
          </p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Sign up for a free account at <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">resend.com</a></li>
            <li>Get your API key from the Resend dashboard</li>
            <li>Add <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">RESEND_API_KEY=your_key</code> to your .env.local file</li>
            <li>Add <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">RESEND_FROM_EMAIL=your@domain.com</code> to your .env.local file</li>
            <li>Restart the development server</li>
          </ol>
          <p className="text-muted-foreground mt-4">
            Resend offers 3,000 free emails per month, which is perfect for getting started!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
