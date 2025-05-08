"use server"

// import { createServerSupabaseClient } from "@/lib/supabase"; // Supabase appointments might still be useful for cross-checking or if GCal fails
import { addMinutes, format, setHours, setMinutes, isBefore, isEqual, parseISO, max, min, differenceInMinutes, startOfDay, endOfDay } from 'date-fns';
import { google, Auth } from 'googleapis'; // Added googleapis
import { getCalendarSettings } from "@/lib/google-calendar"
import { createServerSupabaseClient } from "@/lib/supabase"

// IMPORTANT: You need to set up OAuth2 authentication to get an authenticated client.
// This might involve next-auth or a similar library to manage user sessions and tokens.
// The `getAuthenticatedClient` function below is a placeholder concept.

async function getAuthenticatedClient(): Promise<Auth.OAuth2Client> {
  // In a real app, this would retrieve and configure an OAuth2 client
  // using stored credentials/tokens, likely from a user session via next-auth.
  // For example:
  // const session = await auth(); // from next-auth
  // if (!session?.accessToken) throw new Error("Not authenticated or access token missing");
  // const oauth2Client = new google.auth.OAuth2();
  // oauth2Client.setCredentials({ access_token: session.accessToken });
  // return oauth2Client;

  // Placeholder - this WILL NOT WORK without actual OAuth setup
  if (!process.env.GOOGLE_ACCESS_TOKEN_FOR_STYLIST) {
      console.warn("STYLIST'S GOOGLE_ACCESS_TOKEN_FOR_STYLIST env var is not set. Google Calendar will not be queried.");
      // Fallback or throw error if GCal is essential
      throw new Error("Google Calendar access token is not configured for the stylist.")
  }
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: process.env.GOOGLE_ACCESS_TOKEN_FOR_STYLIST });
  console.log("Using placeholder/hardcoded access token for Google Calendar API."); // Log this for awareness
  return oauth2Client;
  // throw new Error("OAuth2 client setup is required. This function is a placeholder.");
}

// Define business hours
const BUSINESS_HOURS = {
  start: { hour: 9, minute: 0 }, // 9:00 AM
  end: { hour: 17, minute: 0 },   // 5:00 PM
  daysOff: [0, 6] // Sunday (0) and Saturday (6) are off
}

// Define break times
const DEFAULT_BREAKS = [
  { start: "12:00", end: "13:00" } // Lunch break
]

const SLOT_INTERVAL = 30 // 30-minute intervals

interface CalendarEvent {
  start: Date;
  end: Date;
}

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

export async function getAvailableTimeSlots(date: string, duration: number) {
  try {
    console.log("Getting available slots for date:", date, "duration:", duration)
    
    // Parse the input date
    const selectedDate = parseISO(date)
    const dayOfWeek = selectedDate.getDay()

    // Check if it's a day off
    if (BUSINESS_HOURS.daysOff.includes(dayOfWeek)) {
      console.log("Selected day is a day off")
      return []
    }

    // Get Google Calendar settings
    const settings = await getCalendarSettings()
    console.log("Calendar settings:", settings)

    // Generate all possible time slots
    const allSlots = generateTimeSlots(duration)
    console.log("Generated time slots:", allSlots)

    // If Google Calendar integration is not enabled, return all slots
    if (!settings.enabled || !settings.checkAvailability) {
      console.log("Google Calendar integration not enabled, returning all slots")
      return allSlots
    }

    // Check each slot against Google Calendar
    const availableSlots = await Promise.all(
      allSlots.map(async (time) => {
        const [hours, minutes] = time.split(":").map(Number)
        const startTime = setMinutes(setHours(selectedDate, hours), minutes)
        const endTime = new Date(startTime.getTime() + duration * 60000)

        try {
          const response = await calendar.events.list({
            calendarId: CALENDAR_ID,
            timeMin: startTime.toISOString(),
            timeMax: endTime.toISOString(),
            singleEvents: true,
            orderBy: "startTime",
          })

          const isAvailable = response.data.items?.length === 0
          console.log(`Slot ${time} availability:`, isAvailable)
          return isAvailable ? time : null
        } catch (error) {
          console.error(`Error checking availability for slot ${time}:`, error)
          return time // If there's an error, assume the slot is available
        }
      })
    )

    // Filter out null values (unavailable slots)
    const filteredSlots = availableSlots.filter((slot): slot is string => slot !== null)
    console.log("Final available slots after Google Calendar check:", filteredSlots)
    return filteredSlots

  } catch (error) {
    console.error("Error getting available time slots:", error)
    throw new Error("Failed to get available time slots")
  }
}

function generateTimeSlots(duration: number) {
  const slots: string[] = []
  const slotDuration = duration

  // Generate slots for each hour
  for (let hour = BUSINESS_HOURS.start.hour; hour < BUSINESS_HOURS.end.hour; hour++) {
    // Generate slots for each 30-minute interval
    for (let minute = 0; minute < 60; minute += SLOT_INTERVAL) {
      // Skip if the slot would end after business hours
      const slotEnd = new Date()
      slotEnd.setHours(hour, minute + slotDuration, 0, 0)
      if (slotEnd.getHours() > BUSINESS_HOURS.end.hour) continue

      // Skip if the slot overlaps with any break
      if (isOverlappingBreak(hour, minute, slotDuration)) continue

      // Format the time slot
      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
      slots.push(timeString)
    }
  }

  return slots
}

function isOverlappingBreak(hour: number, minute: number, duration: number) {
  const slotStart = new Date()
  slotStart.setHours(hour, minute, 0, 0)
  const slotEnd = new Date(slotStart.getTime() + duration * 60000)

  return DEFAULT_BREAKS.some((breakTime) => {
    const [breakStartHour, breakStartMinute] = breakTime.start.split(":").map(Number)
    const [breakEndHour, breakEndMinute] = breakTime.end.split(":").map(Number)

    const breakStart = new Date()
    breakStart.setHours(breakStartHour, breakStartMinute, 0, 0)
    const breakEnd = new Date()
    breakEnd.setHours(breakEndHour, breakEndMinute, 0, 0)

    return (
      (slotStart >= breakStart && slotStart < breakEnd) || // Slot starts during break
      (slotEnd > breakStart && slotEnd <= breakEnd) || // Slot ends during break
      (slotStart <= breakStart && slotEnd >= breakEnd) // Slot completely contains break
    )
  })
}

// Note: The Supabase appointment fetching logic previously here has been removed
// as Google Calendar is now the primary source of truth for busy times.
// If you need to merge both, the logic would be more complex.

// Define a basic daily availability for the stylist (can be expanded later)
const STYLIST_WORKING_HOURS_OLD = {
  start: { hour: 9, minute: 0 }, // 9:00 AM
  end: { hour: 17, minute: 0 },   // 5:00 PM
  breakStart: { hour: 12, minute: 0 }, // 12:00 PM
  breakEnd: { hour: 13, minute: 0 },   // 1:00 PM
  daysOff: [0, 6] // Sunday (0) and Saturday (6) are off
};

const SLOT_INTERVAL_OLD = 30; // Consider appointments can start every 30 minutes

interface Appointment {
  id: string;
  appointment_date: string; // ISO string
  duration: number; // in minutes
}

export async function getAvailableTimeSlotsOld(date: string, hairstyleDuration: number): Promise<string[]> {
  const supabase = createServerSupabaseClient();
  const selectedDate = parseISO(date); // Date string from client (e.g., YYYY-MM-DD)
  const dayOfWeek = selectedDate.getDay();

  if (STYLIST_WORKING_HOURS_OLD.daysOff.includes(dayOfWeek)) {
    return []; // Stylist is off on this day
  }

  // Fetch existing appointments for the selected date
  const { data: appointments, error: appointmentsError } = await supabase
    .from("appointments")
    .select("appointment_date, duration")
    .gte("appointment_date", format(selectedDate, "yyyy-MM-dd'T'00:00:00"))
    .lt("appointment_date", format(addMinutes(selectedDate, 24 * 60), "yyyy-MM-dd'T'00:00:00"));

  if (appointmentsError) {
    console.error("Error fetching appointments:", appointmentsError);
    throw new Error("Failed to fetch existing appointments.");
  }

  const availableSlots: string[] = [];
  let currentTime = setMinutes(setHours(selectedDate, STYLIST_WORKING_HOURS_OLD.start.hour), STYLIST_WORKING_HOURS_OLD.start.minute);
  const endTime = setMinutes(setHours(selectedDate, STYLIST_WORKING_HOURS_OLD.end.hour), STYLIST_WORKING_HOURS_OLD.end.minute);
  const breakStartTime = setMinutes(setHours(selectedDate, STYLIST_WORKING_HOURS_OLD.breakStart.hour), STYLIST_WORKING_HOURS_OLD.breakStart.minute);
  const breakEndTime = setMinutes(setHours(selectedDate, STYLIST_WORKING_HOURS_OLD.breakEnd.hour), STYLIST_WORKING_HOURS_OLD.breakEnd.minute);

  while (isBefore(currentTime, endTime)) {
    const potentialSlotEnd = addMinutes(currentTime, hairstyleDuration);

    // Check if slot is within working hours (and not past endTime)
    if (!isBefore(potentialSlotEnd, endTime) && !isEqual(potentialSlotEnd, endTime)) {
      break; // Slot extends beyond working hours
    }

    // Check for break collision
    const isInBreak = 
      (isBefore(currentTime, breakEndTime) && isBefore(breakStartTime, potentialSlotEnd)) ||
      (isEqual(currentTime, breakStartTime) || isEqual(potentialSlotEnd, breakEndTime));

    if (isInBreak) {
      currentTime = addMinutes(currentTime, SLOT_INTERVAL_OLD);
      // If current time is pushed into break, fast-forward to end of break
      if(isBefore(currentTime, breakEndTime) && !isEqual(currentTime, breakEndTime)){
          currentTime = breakEndTime;
      }
      continue;
    }

    // Check for collision with existing appointments
    let isSlotFree = true;
    if (appointments) {
      for (const appt of appointments as Appointment[]) {
        const apptStart = parseISO(appt.appointment_date);
        const apptEnd = addMinutes(apptStart, appt.duration);
        
        // Collision if: (SlotStart < ApptEnd) and (SlotEnd > ApptStart)
        if (isBefore(currentTime, apptEnd) && isBefore(apptStart, potentialSlotEnd)) {
          isSlotFree = false;
          break;
        }
      }
    }

    if (isSlotFree) {
      availableSlots.push(format(currentTime, "HH:mm"));
    }

    currentTime = addMinutes(currentTime, SLOT_INTERVAL_OLD); // Move to next potential slot start time
  }

  return availableSlots;
} 