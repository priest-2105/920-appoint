"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { sendAppointmentConfirmation } from "@/lib/email"
import { sendAdminAppointmentNotification } from "@/lib/email"

interface Appointment {
  id: string
  customer_id: string
  hairstyle_id: string
  appointment_date: string
  status: string
  payment_id: string
  payment_status: string
  payment_amount: string
  google_calendar_event_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
  is_guest_booking: boolean
}

// Get all appointments (admin only)
export async function getAppointments(): Promise<Appointment[]> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .order("appointment_date", { ascending: true })

  if (error) {
    console.error("Error fetching appointments:", error)
    throw new Error("Failed to fetch appointments")
  }

  return data || []
}

// Get appointments for a specific customer
export async function getCustomerAppointments(customerId: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("appointments")
    .select(`
      *,
      hairstyles (id, name, price, duration, category)
    `)
    .eq("customer_id", customerId)
    .order("appointment_date", { ascending: true })

  if (error) {
    console.error("Error fetching customer appointments:", error)
    throw new Error("Failed to fetch customer appointments")
  }

  return data
}

// Check if a time slot is available in Google Calendar
export async function checkGoogleCalendarAvailability(startTime: string, endTime: string) {
  const supabase = createServerSupabaseClient()

  // Check if Google Calendar integration is enabled
  const { data: settings, error: settingsError } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "google_calendar_settings")
    .single()

  if (settingsError || !settings?.value?.enabled || !settings?.value?.checkAvailability) {
    // If there's an error or the feature is disabled, assume the slot is available
    return true
  }

  // Get Google Calendar credentials
  const { data: credentials, error: credentialsError } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "google_calendar_credentials")
    .single()

  if (credentialsError || !credentials?.value?.access_token) {
    // If there's an error or no credentials, assume the slot is available
    return true
  }

  try {
    // Import the function dynamically to avoid server/client mismatch
    const { checkAvailability } = await import("@/lib/google-calendar")

    // Check availability in Google Calendar
    return await checkAvailability(startTime, endTime, credentials.value.access_token)
  } catch (error) {
    console.error("Error checking Google Calendar availability:", error)
    // If there's an error, assume the slot is available
    return true
  }
}

// Get available time slots for a specific date
export async function getAvailableTimeSlots(date: string) {
  const supabase = createServerSupabaseClient()

  // Get the day of the week (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeek = new Date(date).getDay()

  // Get the available slots for this day
  const { data: availableSlots, error: slotsError } = await supabase
    .from("available_slots")
    .select("*")
    .eq("day_of_week", dayOfWeek)
    .eq("is_active", true)

  if (slotsError) {
    console.error("Error fetching available slots:", slotsError)
    throw new Error("Failed to fetch available slots")
  }

  // If no slots are available for this day, return empty array
  if (!availableSlots || availableSlots.length === 0) {
    return []
  }

  // Get existing appointments for this date
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const { data: existingAppointments, error: appointmentsError } = await supabase
    .from("appointments")
    .select("appointment_date, hairstyles(duration)")
    .gte("appointment_date", startOfDay.toISOString())
    .lte("appointment_date", endOfDay.toISOString())
    .not("status", "eq", "cancelled")

  if (appointmentsError) {
    console.error("Error fetching existing appointments:", appointmentsError)
    throw new Error("Failed to fetch existing appointments")
  }

  // Get blocked dates
  const { data: blockedDates, error: blockedError } = await supabase
    .from("blocked_dates")
    .select("*")
    .eq("date", date.split("T")[0])

  if (blockedError) {
    console.error("Error fetching blocked dates:", blockedError)
    throw new Error("Failed to fetch blocked dates")
  }

  // If this date is blocked, return empty array
  if (blockedDates && blockedDates.length > 0) {
    return []
  }

  // Get settings for appointment duration
  const { data: settings, error: settingsError } = await supabase
    .from("settings")
    .select("*")
    .eq("key", "appointment_duration")
    .single()

  if (settingsError) {
    console.error("Error fetching settings:", settingsError)
    throw new Error("Failed to fetch settings")
  }

  const appointmentDuration = settings.value.default || 60
  const bufferTime = settings.value.buffer || 15

  // Generate available time slots
  const availableTimeSlots = []

  for (const slot of availableSlots) {
    const [startHour, startMinute] = slot.start_time.split(":").map(Number)
    const [endHour, endMinute] = slot.end_time.split(":").map(Number)

    const slotStart = new Date(date)
    slotStart.setHours(startHour, startMinute, 0, 0)

    const slotEnd = new Date(date)
    slotEnd.setHours(endHour, endMinute, 0, 0)

    // Generate slots in intervals of appointmentDuration + bufferTime
    const totalMinutes = appointmentDuration + bufferTime
    let currentTime = slotStart

    while (currentTime < slotEnd) {
      const endTime = new Date(currentTime.getTime() + appointmentDuration * 60000)

      // Check if this slot overlaps with any existing appointment
      const isAvailableInDatabase = !existingAppointments?.some((appointment) => {
        const appointmentTime = new Date(appointment.appointment_date)
        const appointmentEndTime = new Date(
          appointmentTime.getTime() + (appointment.hairstyles?.duration || appointmentDuration) * 60000,
        )

        return (
          (currentTime >= appointmentTime && currentTime < appointmentEndTime) ||
          (endTime > appointmentTime && endTime <= appointmentEndTime) ||
          (currentTime <= appointmentTime && endTime >= appointmentEndTime)
        )
      })

      // Only check Google Calendar if the slot is available in our database
      if (isAvailableInDatabase) {
        // Check Google Calendar availability
        const isAvailableInGoogleCalendar = await checkGoogleCalendarAvailability(
          currentTime.toISOString(),
          endTime.toISOString(),
        )

        if (isAvailableInGoogleCalendar) {
          availableTimeSlots.push({
            start: currentTime.toISOString(),
            end: endTime.toISOString(),
          })
        }
      }

      // Move to the next slot
      currentTime = new Date(currentTime.getTime() + totalMinutes * 60000)
    }
  }

  return availableTimeSlots
}

// Create a new appointment
export async function createAppointment(appointment: any) {
  const supabase = createServerSupabaseClient()

  try {
    console.log('Creating appointment with data:', appointment)

    // First, check if the customer exists
    let customerId = appointment.customer_id
    let customer = null

    if (!customerId) {
      console.log('Creating new customer:', appointment.customer)
      // Create a new customer
      const { data: customerData, error: customerError } = await supabase
        .from("customers")
        .insert([
          {
            email: appointment.customer.email,
            first_name: appointment.customer.first_name,
            last_name: appointment.customer.last_name,
            phone: appointment.customer.phone,
            is_guest: appointment.is_guest_booking || false,
          },
        ])
        .select()

      if (customerError) {
        console.error("Error creating customer:", customerError)
        throw new Error(`Failed to create customer: ${customerError.message}`)
      }

      customerId = customerData[0].id
      customer = customerData[0]
      console.log('New customer created:', customer)
    } else {
      console.log('Fetching existing customer:', customerId)
      // Get the existing customer
      const { data: customerData, error: customerError } = await supabase
        .from("customers")
        .select("*")
        .eq("id", customerId)
        .single()

      if (customerError) {
        console.error("Error fetching customer:", customerError)
        throw new Error(`Failed to fetch customer: ${customerError.message}`)
      }

      customer = customerData
      console.log('Existing customer found:', customer)
    }

    // Get the hairstyle details
    console.log('Fetching hairstyle:', appointment.hairstyle_id)
    const { data: hairstyle, error: hairstyleError } = await supabase
      .from("hairstyles")
      .select("*")
      .eq("id", appointment.hairstyle_id)
      .single()

    if (hairstyleError) {
      console.error("Error fetching hairstyle:", hairstyleError)
      throw new Error(`Failed to fetch hairstyle: ${hairstyleError.message}`)
    }

    console.log('Hairstyle found:', hairstyle)

    // Create the appointment
    console.log('Creating appointment record')
    const { data, error } = await supabase
      .from("appointments")
      .insert([
        {
          customer_id: customerId,
          hairstyle_id: appointment.hairstyle_id,
          appointment_date: appointment.appointment_date,
          status: "pending",
          payment_id: appointment.payment_id,
          payment_status: appointment.payment_status,
          payment_amount: appointment.payment_amount,
          notes: appointment.notes,
          is_guest_booking: appointment.is_guest_booking || false,
        },
      ])
      .select()

    if (error) {
      console.error("Error creating appointment:", error)
      throw new Error(`Failed to create appointment: ${error.message}`)
    }

    const createdAppointment = data[0]
    console.log('Appointment created:', createdAppointment)

    // Check if Google Calendar integration is enabled
    const { data: settings, error: settingsError } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "google_calendar_settings")
      .single()

    let googleCalendarEventId = null

    if (!settingsError && settings?.value?.enabled && settings?.value?.addEvents) {
      // Get Google Calendar credentials
      const { data: credentials, error: credentialsError } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "google_calendar_credentials")
        .single()

      if (!credentialsError && credentials?.value?.access_token) {
        try {
          // Import the function dynamically to avoid server/client mismatch
          const { addToGoogleCalendar } = await import("@/lib/google-calendar")

          // Add to Google Calendar
          const calendarResult = await addToGoogleCalendar(
            {
              summary: `Haircut: ${hairstyle.name}`,
              description: `Appointment for ${customer.first_name} ${customer.last_name}`,
              start: appointment.appointment_date,
              end: new Date(new Date(appointment.appointment_date).getTime() + hairstyle.duration * 60000).toISOString(),
              attendees: [{ email: customer.email }],
            },
            credentials.value.access_token,
          )

          if (calendarResult.eventId) {
            googleCalendarEventId = calendarResult.eventId

            // Update the appointment with the Google Calendar event ID
            await supabase
              .from("appointments")
              .update({ google_calendar_event_id: calendarResult.eventId })
              .eq("id", createdAppointment.id)
          }
        } catch (error) {
          console.error("Error adding to Google Calendar:", error)
          // Don't throw here, we still want to create the appointment
        }
      }
    }

    // Send confirmation email to customer
    try {
      await sendAppointmentConfirmation(createdAppointment, customer, hairstyle)
    } catch (error) {
      console.error("Error sending confirmation email:", error)
      // Don't throw here, we still want to create the appointment
    }

    // Send notification email to admin
    try {
      await sendAdminAppointmentNotification(createdAppointment, customer, hairstyle)
    } catch (error) {
      console.error("Error sending admin notification:", error)
      // Don't throw here, we still want to create the appointment
    }

    revalidatePath("/admin/appointments")

    return {
      ...createdAppointment,
      google_calendar_event_id: googleCalendarEventId,
    }
  } catch (error) {
    console.error("Error in createAppointment:", error)
    throw error // Re-throw the error to be handled by the caller
  }
}

// Update an appointment status
export async function updateAppointmentStatus(id: string, status: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("appointments")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()

  if (error) {
    console.error("Error updating appointment status:", error)
    throw new Error("Failed to update appointment status")
  }

  revalidatePath("/admin/appointments")

  return data[0]
}
