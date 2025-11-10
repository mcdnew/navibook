import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export type NotificationType =
  | 'booking_confirmation'
  | 'booking_reminder'
  | 'booking_cancelled'
  | 'booking_rescheduled'
  | 'payment_received'
  | 'payment_reminder'
  | 'low_availability_alert'
  | 'agent_assignment'

export type NotificationChannel = 'email' | 'sms' | 'in_app'

interface SendNotificationParams {
  companyId: string
  recipientEmail?: string
  recipientPhone?: string
  recipientName?: string
  userId?: string
  bookingId?: string
  notificationType: NotificationType
  channel: NotificationChannel
  subject: string
  message: string
  html?: string
  metadata?: Record<string, any>
}

export async function sendNotification(params: SendNotificationParams) {
  const supabase = await createClient()

  try {
    // Create notification log entry
    const { data: notification, error: notifError } = await supabase
      .from('notifications')
      .insert({
        company_id: params.companyId,
        recipient_email: params.recipientEmail,
        recipient_phone: params.recipientPhone,
        recipient_name: params.recipientName,
        user_id: params.userId,
        booking_id: params.bookingId,
        notification_type: params.notificationType,
        channel: params.channel,
        subject: params.subject,
        message: params.message,
        status: 'pending',
        metadata: params.metadata,
      })
      .select()
      .single()

    if (notifError) {
      console.error('Error creating notification log:', notifError)
      throw notifError
    }

    // Send based on channel
    if (params.channel === 'email' && params.recipientEmail) {
      try {
        // Use Resend to send email
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

        const emailData = await resend.emails.send({
          from: fromEmail,
          to: params.recipientEmail,
          subject: params.subject,
          html: params.html || params.message,
        })

        // Update notification as sent
        await supabase
          .from('notifications')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            external_id: emailData.data?.id,
          })
          .eq('id', notification.id)

        console.log(`Email sent successfully to ${params.recipientEmail}`, emailData.data?.id)
        return { success: true, notificationId: notification.id, externalId: emailData.data?.id }
      } catch (emailError: any) {
        console.error('Error sending email:', emailError)

        // Update notification as failed
        await supabase
          .from('notifications')
          .update({
            status: 'failed',
            failed_at: new Date().toISOString(),
            error_message: emailError.message || 'Failed to send email',
          })
          .eq('id', notification.id)

        throw emailError
      }
    } else if (params.channel === 'sms' && params.recipientPhone) {
      // SMS implementation would go here (using Twilio, etc.)
      // For now, just log it
      console.log(`SMS notification would be sent to ${params.recipientPhone}`)

      await supabase
        .from('notifications')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .eq('id', notification.id)

      return { success: true, notificationId: notification.id, note: 'SMS not configured' }
    } else if (params.channel === 'in_app') {
      // In-app notification - just mark as sent since it's in the database
      await supabase
        .from('notifications')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .eq('id', notification.id)

      return { success: true, notificationId: notification.id }
    }

    return { success: false, error: 'Invalid channel or missing recipient information' }
  } catch (error: any) {
    console.error('Notification service error:', error)
    return { success: false, error: error.message }
  }
}

export async function checkNotificationPreferences(
  userId?: string,
  customerEmail?: string,
  notificationType?: string
): Promise<{ emailEnabled: boolean; smsEnabled: boolean }> {
  const supabase = await createClient()

  // Check user preferences
  if (userId) {
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (prefs) {
      // Map notification type to preference field
      let emailEnabled = true
      let smsEnabled = false

      if (notificationType === 'booking_confirmation') {
        emailEnabled = prefs.email_booking_confirmations
        smsEnabled = prefs.sms_booking_confirmations
      } else if (notificationType === 'booking_reminder') {
        emailEnabled = prefs.email_booking_reminders
        smsEnabled = prefs.sms_booking_reminders
      } else if (notificationType?.includes('booking')) {
        emailEnabled = prefs.email_booking_changes
      } else if (notificationType?.includes('payment')) {
        emailEnabled = prefs.email_payment_notifications
      }

      return { emailEnabled, smsEnabled }
    }
  }

  // Check customer preferences
  if (customerEmail) {
    const { data: custPrefs } = await supabase
      .from('customer_notification_preferences')
      .select('*')
      .eq('customer_email', customerEmail)
      .single()

    if (custPrefs) {
      return {
        emailEnabled: custPrefs.email_notifications,
        smsEnabled: custPrefs.sms_notifications,
      }
    }
  }

  // Default to email enabled, SMS disabled
  return { emailEnabled: true, smsEnabled: false }
}

export async function getNotificationHistory(
  companyId: string,
  filters?: {
    bookingId?: string
    userId?: string
    notificationType?: string
    status?: string
    limit?: number
  }
) {
  const supabase = await createClient()

  let query = supabase
    .from('notifications')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (filters?.bookingId) {
    query = query.eq('booking_id', filters.bookingId)
  }

  if (filters?.userId) {
    query = query.eq('user_id', filters.userId)
  }

  if (filters?.notificationType) {
    query = query.eq('notification_type', filters.notificationType)
  }

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  } else {
    query = query.limit(100)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching notification history:', error)
    return []
  }

  return data || []
}
