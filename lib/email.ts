// Email notification service using Resend
import { Resend } from "resend"

// Initialize Resend with API key
const getResend = () => {
  const resendApiKey = process.env.RESEND_API_KEY

  if (!resendApiKey) {
    throw new Error("Missing RESEND_API_KEY environment variable")
  }

  return new Resend(resendApiKey)
}

export async function sendEmail(options: {
  to: string
  subject: string
  html: string
}) {
  try {
    const resend = getResend()

    const { data, error } = await resend.emails.send({
      from: "StyleSync <notifications@yourdomain.com>", // Replace with your verified domain
      to: options.to,
      subject: options.subject,
      html: options.html,
    })

    if (error) {
      throw error
    }

    return { success: true, id: data?.id }
  } catch (error) {
    console.error("Error sending email:", error)
    throw new Error("Failed to send email")
  }
}

// Send appointment confirmation email
export async function sendAppointmentConfirmation(appointment: any, customer: any, hairstyle: any) {
  const appointmentDate = new Date(appointment.appointment_date)
  const formattedDate = appointmentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const formattedTime = appointmentDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  })

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #3b82f6;">Appointment Confirmation</h1>
      <p>Dear ${customer.first_name},</p>
      <p>Your appointment has been confirmed. Here are the details:</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Service:</strong> ${hairstyle.name}</p>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Time:</strong> ${formattedTime}</p>
        <p><strong>Duration:</strong> ${hairstyle.duration} minutes</p>
        <p><strong>Price:</strong> £${hairstyle.price}</p>
      </div>
      <p>Location: 123 Hair Street, London, UK</p>
      <p>If you need to reschedule or cancel your appointment, please contact us at least 24 hours in advance.</p>
      <p>We look forward to seeing you!</p>
      <p>Best regards,<br>StyleSync Team</p>
    </div>
  `

  return sendEmail({
    to: customer.email,
    subject: "Your StyleSync Appointment Confirmation",
    html,
  })
}

// Send appointment reminder email
export async function sendAppointmentReminder(appointment: any, customer: any, hairstyle: any) {
  const appointmentDate = new Date(appointment.appointment_date)
  const formattedDate = appointmentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const formattedTime = appointmentDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  })

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #3b82f6;">Appointment Reminder</h1>
      <p>Dear ${customer.first_name},</p>
      <p>This is a friendly reminder about your upcoming appointment:</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Service:</strong> ${hairstyle.name}</p>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Time:</strong> ${formattedTime}</p>
        <p><strong>Duration:</strong> ${hairstyle.duration} minutes</p>
      </div>
      <p>Location: 123 Hair Street, London, UK</p>
      <p>We look forward to seeing you!</p>
      <p>Best regards,<br>StyleSync Team</p>
    </div>
  `

  return sendEmail({
    to: customer.email,
    subject: "Reminder: Your StyleSync Appointment Tomorrow",
    html,
  })
}

// Add admin notification functions to the email.ts file

// Send admin notification when a new appointment is made
export async function sendAdminAppointmentNotification(appointment: any, customer: any, hairstyle: any) {
  const appointmentDate = new Date(appointment.appointment_date)
  const formattedDate = appointmentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const formattedTime = appointmentDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  })

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #3b82f6;">New Appointment Notification</h1>
      <p>A new appointment has been booked. Here are the details:</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Customer:</strong> ${customer.first_name} ${customer.last_name} (${customer.email})</p>
        <p><strong>Service:</strong> ${hairstyle.name}</p>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Time:</strong> ${formattedTime}</p>
        <p><strong>Duration:</strong> ${hairstyle.duration} minutes</p>
        <p><strong>Price:</strong> £${hairstyle.price}</p>
      </div>
      <p>You can view and manage this appointment in your admin dashboard.</p>
    </div>
  `

  return sendEmail({
    to: "admin@stylesync.com", // Replace with your actual admin email
    subject: "New Appointment Booked - StyleSync",
    html,
  })
}

// Send admin notification when a payment is processed
export async function sendAdminPaymentNotification(appointment: any, customer: any, payment: any) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #3b82f6;">Payment Notification</h1>
      <p>A payment has been processed for an appointment. Here are the details:</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Customer:</strong> ${customer.first_name} ${customer.last_name} (${customer.email})</p>
        <p><strong>Appointment ID:</strong> ${appointment.id}</p>
        <p><strong>Payment ID:</strong> ${payment.id}</p>
        <p><strong>Amount:</strong> £${payment.amount}</p>
        <p><strong>Status:</strong> ${payment.status}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      </div>
      <p>You can view payment details in your admin dashboard.</p>
    </div>
  `

  return sendEmail({
    to: "admin@stylesync.com", // Replace with your actual admin email
    subject: "Payment Processed - StyleSync",
    html,
  })
}

// Send admin notification when a new hairstyle is added
export async function sendAdminHairstyleNotification(hairstyle: any, action: "created" | "updated") {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #3b82f6;">Hairstyle ${action === "created" ? "Created" : "Updated"}</h1>
      <p>A hairstyle has been ${action === "created" ? "added to" : "updated in"} your catalog. Here are the details:</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Name:</strong> ${hairstyle.name}</p>
        <p><strong>Category:</strong> ${hairstyle.category}</p>
        <p><strong>Price:</strong> £${hairstyle.price}</p>
        <p><strong>Duration:</strong> ${hairstyle.duration} minutes</p>
        <p><strong>Description:</strong> ${hairstyle.description || "N/A"}</p>
        <p><strong>Materials:</strong> ${hairstyle.materials || "N/A"}</p>
      </div>
      <p>You can view and manage hairstyles in your admin dashboard.</p>
    </div>
  `

  return sendEmail({
    to: "admin@stylesync.com", // Replace with your actual admin email
    subject: `Hairstyle ${action === "created" ? "Created" : "Updated"} - StyleSync`,
    html,
  })
}
