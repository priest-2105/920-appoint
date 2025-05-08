import { google } from "googleapis"
import { createServerSupabaseClient } from "@/lib/supabase"

// Initialize Google Calendar API with service account credentials
const calendar = google.calendar({
  version: "v3",
  auth: new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/calendar"],
  }),
})

// Get the calendar ID from environment variables
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID

export async function checkAvailability(startTime: string, endTime: string) {
  try {
    const response = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: startTime,
      timeMax: endTime,
      singleEvents: true,
      orderBy: "startTime",
    })

    return response.data.items?.length === 0
  } catch (error) {
    console.error("Error checking calendar availability:", error)
    throw new Error("Failed to check calendar availability")
  }
}

export async function addEventToCalendar(event: {
  summary: string
  description: string
  startTime: string
  endTime: string
  customerName: string
  customerEmail: string
}) {
  try {
    const calendarEvent = {
      summary: event.summary,
      description: event.description,
      start: {
        dateTime: event.startTime,
        timeZone: "Europe/London",
      },
      end: {
        dateTime: event.endTime,
        timeZone: "Europe/London",
      },
      attendees: [
        {
          email: event.customerEmail,
          displayName: event.customerName,
        },
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 },
          { method: "popup", minutes: 30 },
        ],
      },
    }

    const response = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      requestBody: calendarEvent,
      sendUpdates: "all",
    })

    return response.data
  } catch (error) {
    console.error("Error adding event to calendar:", error)
    throw new Error("Failed to add event to calendar")
  }
}

export async function getCalendarSettings() {
  const supabase = createServerSupabaseClient()

  const { data: settings } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "google_calendar_settings")
    .single()

  return settings?.value || {
    enabled: false,
    checkAvailability: false,
    addEvents: false,
  }
}

export async function updateCalendarSettings(settings: {
  enabled: boolean
  checkAvailability: boolean
  addEvents: boolean
}) {
  const supabase = createServerSupabaseClient()

  const { data: existingSettings } = await supabase
    .from("settings")
    .select("*")
    .eq("key", "google_calendar_settings")
    .single()

  if (existingSettings) {
    await supabase
      .from("settings")
      .update({
        value: settings,
        updated_at: new Date().toISOString(),
      })
      .eq("key", "google_calendar_settings")
  } else {
    await supabase.from("settings").insert([
      {
        key: "google_calendar_settings",
        value: settings,
      },
    ])
  }

  return settings
}
