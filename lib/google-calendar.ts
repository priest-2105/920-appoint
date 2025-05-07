import { google } from "googleapis"
import { OAuth2Client } from "google-auth-library"

// Create OAuth2 client
const createOAuth2Client = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/google/callback"

  if (!clientId || !clientSecret) {
    throw new Error("Missing Google OAuth credentials")
  }

  return new OAuth2Client(clientId, clientSecret, redirectUri)
}

// Get authorization URL for Google OAuth
export const getAuthUrl = () => {
  const oauth2Client = createOAuth2Client()

  const scopes = ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/calendar.events"]

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  })
}

// Exchange authorization code for tokens
export const getTokens = async (code: string) => {
  const oauth2Client = createOAuth2Client()
  const { tokens } = await oauth2Client.getToken(code)
  return tokens
}

// Check availability in Google Calendar
export async function checkAvailability(startTime: string, endTime: string, accessToken: string) {
  try {
    const oauth2Client = createOAuth2Client()
    oauth2Client.setCredentials({ access_token: accessToken })

    const calendar = google.calendar({ version: "v3", auth: oauth2Client })

    // Get events from the calendar
    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: startTime,
      timeMax: endTime,
      singleEvents: true,
    })

    // If there are events during this time, the slot is not available
    return response.data.items && response.data.items.length === 0
  } catch (error) {
    console.error("Error checking calendar availability:", error)
    throw new Error("Failed to check calendar availability")
  }
}

// Add an appointment to Google Calendar
export async function addToGoogleCalendar(
  event: {
    summary: string
    description: string
    start: string
    end: string
    attendees: { email: string }[]
  },
  accessToken: string,
) {
  try {
    const oauth2Client = createOAuth2Client()
    oauth2Client.setCredentials({ access_token: accessToken })

    const calendar = google.calendar({ version: "v3", auth: oauth2Client })

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: event.summary,
        description: event.description,
        start: { dateTime: event.start },
        end: { dateTime: event.end },
        attendees: event.attendees,
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 24 * 60 },
            { method: "popup", minutes: 30 },
          ],
        },
      },
    })

    return {
      success: true,
      eventId: response.data.id,
      htmlLink: response.data.htmlLink,
    }
  } catch (error) {
    console.error("Error adding to Google Calendar:", error)
    throw new Error("Failed to add event to Google Calendar")
  }
}
