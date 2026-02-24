// Email templates for notifications

interface BookingConfirmationData {
  customerName: string
  bookingDate: string
  startTime: string
  endTime: string
  boatName: string
  packageType: string
  totalPrice: number
  depositAmount?: number
  passengers: number
  bookingReference?: string
}

interface BookingReminderData {
  customerName: string
  bookingDate: string
  startTime: string
  boatName: string
  meetingPoint?: string
}

interface BookingCancelledData {
  customerName: string
  bookingDate: string
  startTime: string
  boatName: string
  reason?: string
  refundAmount?: number
}

interface PaymentReceivedData {
  customerName: string
  bookingDate: string
  amountPaid: number
  paymentMethod: string
  outstandingBalance: number
}

export function getBookingConfirmationEmail(data: BookingConfirmationData) {
  const subject = `Booking Confirmed - ${data.boatName} on ${data.bookingDate}`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px;">🎉 Booking Confirmed!</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: #333333;">
                Dear ${data.customerName},
              </p>

              <p style="margin: 0 0 30px; font-size: 16px; line-height: 24px; color: #333333;">
                Thank you for booking with us! Your charter has been confirmed. We're excited to have you aboard!
              </p>

              <!-- Booking Details Card -->
              <table style="width: 100%; border-collapse: collapse; background-color: #f8f9fa; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="margin: 0 0 20px; font-size: 20px; color: #667eea;">Booking Details</h2>

                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #666;">
                          <strong>Boat:</strong>
                        </td>
                        <td style="padding: 8px 0; font-size: 14px; color: #333; text-align: right;">
                          ${data.boatName}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #666;">
                          <strong>Date:</strong>
                        </td>
                        <td style="padding: 8px 0; font-size: 14px; color: #333; text-align: right;">
                          ${data.bookingDate}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #666;">
                          <strong>Time:</strong>
                        </td>
                        <td style="padding: 8px 0; font-size: 14px; color: #333; text-align: right;">
                          ${data.startTime} - ${data.endTime}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #666;">
                          <strong>Package:</strong>
                        </td>
                        <td style="padding: 8px 0; font-size: 14px; color: #333; text-align: right;">
                          ${data.packageType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #666;">
                          <strong>Passengers:</strong>
                        </td>
                        <td style="padding: 8px 0; font-size: 14px; color: #333; text-align: right;">
                          ${data.passengers}
                        </td>
                      </tr>
                      ${data.bookingReference ? `
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #666;">
                          <strong>Reference:</strong>
                        </td>
                        <td style="padding: 8px 0; font-size: 14px; color: #333; text-align: right;">
                          ${data.bookingReference}
                        </td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td colspan="2" style="padding-top: 15px; border-top: 2px solid #e0e0e0;"></td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 16px; color: #666;">
                          <strong>Total Price:</strong>
                        </td>
                        <td style="padding: 8px 0; font-size: 18px; color: #667eea; text-align: right; font-weight: bold;">
                          €${data.totalPrice.toFixed(2)}
                        </td>
                      </tr>
                      ${data.depositAmount ? `
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #666;">
                          <strong>Deposit Paid:</strong>
                        </td>
                        <td style="padding: 8px 0; font-size: 14px; color: #28a745; text-align: right;">
                          €${data.depositAmount.toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #666;">
                          <strong>Remaining:</strong>
                        </td>
                        <td style="padding: 8px 0; font-size: 14px; color: #dc3545; text-align: right;">
                          €${(data.totalPrice - data.depositAmount).toFixed(2)}
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Important Information -->
              <div style="padding: 20px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px; margin-bottom: 30px;">
                <h3 style="margin: 0 0 10px; font-size: 16px; color: #856404;">Important Information</h3>
                <ul style="margin: 0; padding-left: 20px; color: #856404; font-size: 14px; line-height: 22px;">
                  <li>Please arrive 15 minutes before departure time</li>
                  <li>Bring sunscreen, towels, and swimming gear</li>
                  <li>Full payment is required before departure</li>
                  <li>Weather conditions will be monitored - we'll contact you if changes are needed</li>
                </ul>
              </div>

              <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: #333333;">
                If you have any questions or need to make changes to your booking, please don't hesitate to contact us.
              </p>

              <p style="margin: 0; font-size: 16px; line-height: 24px; color: #333333;">
                We look forward to seeing you soon!<br>
                <strong>The NaviBook Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f8f9fa; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 10px; font-size: 14px; color: #666;">
                🌊 NaviBook Day-Charter Management
              </p>
              <p style="margin: 0; font-size: 12px; color: #999;">
                This is an automated message. Please do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  return { subject, html }
}

export function getBookingReminderEmail(data: BookingReminderData) {
  const subject = `Reminder: Your Charter Tomorrow - ${data.boatName}`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 30px; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px;">⏰ Charter Reminder</h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: #333333;">
                Dear ${data.customerName},
              </p>

              <p style="margin: 0 0 30px; font-size: 18px; line-height: 28px; color: #333333; font-weight: bold;">
                Your charter is tomorrow! We can't wait to see you aboard the ${data.boatName}.
              </p>

              <table style="width: 100%; border-collapse: collapse; background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 15px; font-size: 20px; color: #11998e;">Quick Details</h2>
                    <p style="margin: 0 0 10px; font-size: 16px; color: #333;">
                      📅 <strong>Date:</strong> ${data.bookingDate}
                    </p>
                    <p style="margin: 0 0 10px; font-size: 16px; color: #333;">
                      🕐 <strong>Time:</strong> ${data.startTime}
                    </p>
                    <p style="margin: 0; font-size: 16px; color: #333;">
                      🚤 <strong>Boat:</strong> ${data.boatName}
                    </p>
                    ${data.meetingPoint ? `
                    <p style="margin: 10px 0 0; font-size: 16px; color: #333;">
                      📍 <strong>Meeting Point:</strong> ${data.meetingPoint}
                    </p>
                    ` : ''}
                  </td>
                </tr>
              </table>

              <div style="padding: 20px; background-color: #d1ecf1; border-left: 4px solid #0c5460; border-radius: 4px; margin-bottom: 30px;">
                <h3 style="margin: 0 0 10px; font-size: 16px; color: #0c5460;">Don't Forget!</h3>
                <ul style="margin: 0; padding-left: 20px; color: #0c5460; font-size: 14px; line-height: 22px;">
                  <li>Arrive 15 minutes early</li>
                  <li>Bring your ID/passport</li>
                  <li>Sunscreen and towels</li>
                  <li>Ensure final payment is complete</li>
                </ul>
              </div>

              <p style="margin: 0; font-size: 16px; line-height: 24px; color: #333333;">
                See you tomorrow!<br>
                <strong>The NaviBook Team</strong>
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px; background-color: #f8f9fa; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; font-size: 12px; color: #999;">
                🌊 NaviBook Day-Charter Management
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  return { subject, html }
}

export function getBookingCancelledEmail(data: BookingCancelledData) {
  const subject = `Booking Cancelled - ${data.boatName} on ${data.bookingDate}`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Cancelled</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff;">
          <tr>
            <td style="padding: 40px 30px; background-color: #dc3545; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Booking Cancelled</h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px;">
                Dear ${data.customerName},
              </p>

              <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px;">
                Your booking for ${data.boatName} on ${data.bookingDate} at ${data.startTime} has been cancelled.
              </p>

              ${data.reason ? `
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px;">
                <strong>Reason:</strong> ${data.reason}
              </p>
              ` : ''}

              ${data.refundAmount ? `
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: #28a745;">
                <strong>Refund Amount:</strong> €${data.refundAmount.toFixed(2)}<br>
                The refund will be processed within 5-7 business days.
              </p>
              ` : ''}

              <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px;">
                We're sorry to see you go. If you'd like to book another charter, we'd be happy to help!
              </p>

              <p style="margin: 0; font-size: 16px; line-height: 24px;">
                Best regards,<br>
                <strong>The NaviBook Team</strong>
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px; background-color: #f8f9fa; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #999;">
                🌊 NaviBook Day-Charter Management
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  return { subject, html }
}

export function getPaymentReceivedEmail(data: PaymentReceivedData) {
  const subject = `Payment Received - €${data.amountPaid.toFixed(2)}`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Received</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff;">
          <tr>
            <td style="padding: 40px 30px; background-color: #28a745; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px;">💳 Payment Received</h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px;">
                Dear ${data.customerName},
              </p>

              <p style="margin: 0 0 30px; font-size: 16px; line-height: 24px;">
                Thank you! We've received your payment.
              </p>

              <table style="width: 100%; background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 10px; font-size: 16px;">
                      <strong>Amount Paid:</strong> <span style="color: #28a745; font-size: 20px;">€${data.amountPaid.toFixed(2)}</span>
                    </p>
                    <p style="margin: 0 0 10px; font-size: 16px;">
                      <strong>Payment Method:</strong> ${data.paymentMethod}
                    </p>
                    <p style="margin: 0 0 10px; font-size: 16px;">
                      <strong>Booking Date:</strong> ${data.bookingDate}
                    </p>
                    ${data.outstandingBalance > 0 ? `
                    <p style="margin: 0; font-size: 16px;">
                      <strong>Remaining Balance:</strong> <span style="color: #dc3545;">€${data.outstandingBalance.toFixed(2)}</span>
                    </p>
                    ` : `
                    <p style="margin: 0; font-size: 16px; color: #28a745; font-weight: bold;">
                      ✓ Fully Paid
                    </p>
                    `}
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 16px; line-height: 24px;">
                Thank you for your business!<br>
                <strong>The NaviBook Team</strong>
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px; background-color: #f8f9fa; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #999;">
                🌊 NaviBook Day-Charter Management
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  return { subject, html }
}

export function getLowAvailabilityAlertEmail(boatName: string, date: string, availableSlots: number) {
  const subject = `Low Availability Alert - ${boatName} on ${date}`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Low Availability Alert</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff;">
          <tr>
            <td style="padding: 40px 30px; background-color: #ffc107; text-align: center;">
              <h1 style="margin: 0; color: #000000; font-size: 28px;">⚠️ Low Availability Alert</h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 18px; line-height: 28px; font-weight: bold;">
                ${boatName} has low availability on ${date}
              </p>

              <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px;">
                Only ${availableSlots} time slot${availableSlots !== 1 ? 's' : ''} remaining for this date.
              </p>

              <p style="margin: 0; font-size: 16px; line-height: 24px;">
                Please review the calendar and consider adding more capacity or adjusting pricing.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px; background-color: #f8f9fa; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #999;">
                🌊 NaviBook Management System
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  return { subject, html }
}
