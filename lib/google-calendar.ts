"use server"

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
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'kofoworolabailey20@gmail.com'

export async function checkAvailability(startTime: string, endTime: string) {
  try {
    console.log("Checking availability in Google Calendar:", CALENDAR_ID)
    const response = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: startTime,
      timeMax: endTime,
      singleEvents: true,
      orderBy: "startTime",
    })

    console.log("Calendar response:", response.data)
    return response.data.items?.length === 0
  } catch (error) {
    console.error("Error checking calendar availability:", error)
    throw new Error("Failed to check calendar availability")
  }
}

export async function addToGoogleCalendar(event: {
  summary: string
  description: string
  start: string
  end: string
  attendees: { email: string }[]
}) {
  try {
    console.log("Adding event to Google Calendar:", CALENDAR_ID)
    console.log("Event details:", event)

    const calendarEvent = {
      summary: event.summary,
      description: event.description,
      start: {
        dateTime: event.start,
        timeZone: "Europe/London",
      },
      end: {
        dateTime: event.end,
        timeZone: "Europe/London",
      },
      attendees: event.attendees,
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

    console.log("Calendar event created:", response.data)
    return response.data
  } catch (error) {
    console.error("Error adding event to calendar:", error)
    throw new Error("Failed to add event to calendar")
  }
}

export async function getCalendarSettings() {
  const supabase = createServerSupabaseClient()

  const { data: settings, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "google_calendar_settings")
    .single()

  console.log("Retrieved settings from database:", settings, "Error:", error)

  // If there's an error or no settings, return default settings
  if (error || !settings) {
    console.log("No settings found, returning defaults")
    return {
      enabled: false,
      checkAvailability: false,
      addEvents: false,
    }
  }

  // Ensure we have all required fields
  const defaultSettings = {
    enabled: false,
    checkAvailability: false,
    addEvents: false,
  }

  // Merge with defaults to ensure all fields exist
  const mergedSettings = {
    ...defaultSettings,
    ...settings.value,
  }

  console.log("Returning merged settings:", mergedSettings)
  return mergedSettings
}

export async function updateCalendarSettings(settings: {
  enabled: boolean
  checkAvailability: boolean
  addEvents: boolean
}) {
  const supabase = createServerSupabaseClient()

  console.log("Updating settings in database:", settings)

  const { data: existingSettings, error: fetchError } = await supabase
    .from("settings")
    .select("*")
    .eq("key", "google_calendar_settings")
    .single()

  console.log("Existing settings:", existingSettings, "Fetch error:", fetchError)

  if (existingSettings) {
    const { error: updateError } = await supabase
      .from("settings")
      .update({
        value: settings,
        updated_at: new Date().toISOString(),
      })
      .eq("key", "google_calendar_settings")

    console.log("Update error:", updateError)
    if (updateError) throw updateError
  } else {
    const { error: insertError } = await supabase.from("settings").insert([
      {
        key: "google_calendar_settings",
        value: settings,
      },
    ])

    console.log("Insert error:", insertError)
    if (insertError) throw insertError
  }

  return settings
}
