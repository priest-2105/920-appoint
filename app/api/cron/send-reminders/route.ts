import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { sendAppointmentReminder } from "@/lib/email"
import { addDays, startOfDay, endOfDay } from "date-fns"

// This endpoint will be called by a cron job to send appointment reminders
export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Get appointments for tomorrow
    const tomorrow = addDays(new Date(), 1)
    const tomorrowStart = startOfDay(tomorrow)
    const tomorrowEnd = endOfDay(tomorrow)

    // Get all appointments for tomorrow that are confirmed
    const { data: appointments, error } = await supabase
      .from("appointments")
      .select(`
        *,
        customers (id, first_name, last_name, email, phone),
        hairstyles (id, name, price, duration, category)
      `)
      .gte("appointment_date", tomorrowStart.toISOString())
      .lte("appointment_date", tomorrowEnd.toISOString())
      .eq("status", "confirmed")

    if (error) {
      console.error("Error fetching appointments:", error)
      return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 })
    }

    // Send reminder emails
    const results = await Promise.allSettled(
      appointments.map((appointment) =>
        sendAppointmentReminder(appointment, appointment.customers, appointment.hairstyles),
      ),
    )

    const successful = results.filter((result) => result.status === "fulfilled").length
    const failed = results.filter((result) => result.status === "rejected").length

    return NextResponse.json({
      success: true,
      message: `Sent ${successful} reminders, ${failed} failed`,
      total: appointments.length,
    })
  } catch (error) {
    console.error("Error in send-reminders route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

