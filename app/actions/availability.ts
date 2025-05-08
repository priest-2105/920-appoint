"use server"

// import { createServerSupabaseClient } from "@/lib/supabase"; // Supabase appointments might still be useful for cross-checking or if GCal fails
import { addMinutes, format, setHours, setMinutes, isBefore, isEqual, parseISO, max, min, differenceInMinutes, startOfDay, endOfDay } from 'date-fns';
import { google, Auth } from 'googleapis'; // Added googleapis

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

const STYLIST_WORKING_HOURS = {
  start: { hour: 9, minute: 0 },
  end: { hour: 17, minute: 0 },
  breakStart: { hour: 12, minute: 0 },
  breakEnd: { hour: 13, minute: 0 },
  daysOff: [0, 6] // Sunday (0) and Saturday (6) are off
};

const SLOT_INTERVAL = 30; // Propose slots every 30 minutes

interface CalendarEvent {
  start: Date;
  end: Date;
}

export async function getAvailableTimeSlots(date: string, hairstyleDuration: number): Promise<string[]> {
  const selectedDate = parseISO(date);
  const dayOfWeek = selectedDate.getDay();

  if (STYLIST_WORKING_HOURS.daysOff.includes(dayOfWeek)) {
    return [];
  }

  let oauth2Client;
  try {
    oauth2Client = await getAuthenticatedClient();
  } catch (authError) {
    console.error("Google Auth Error:", authError);
    // Decide if you want to fallback to Supabase-only availability or throw
    // For now, let's assume GCal is primary and throw if auth fails.
    throw new Error("Failed to authenticate with Google Calendar.");
  }
  
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const timeMin = format(startOfDay(selectedDate), "yyyy-MM-dd'T'HH:mm:ssXXX");
  const timeMax = format(endOfDay(selectedDate), "yyyy-MM-dd'T'HH:mm:ssXXX");

  let busyIntervals: CalendarEvent[] = [];
  try {
    const freeBusyResponse = await calendar.freebusy.query({
      requestBody: {
        timeMin: timeMin,
        timeMax: timeMax,
        items: [{ id: 'primary' }], // Query primary calendar of the authenticated user
        timeZone: 'Europe/London', // Specify your stylist's timezone
      },
    });

    const calendarsBusy = freeBusyResponse.data.calendars?.primary?.busy;
    if (calendarsBusy) {
      busyIntervals = calendarsBusy.map(b => ({
        start: parseISO(b.start!),
        end: parseISO(b.end!),
      }));
    }
  } catch (error: any) {
    console.error('Error fetching free/busy from Google Calendar:', error.message);
    // Fallback strategy or re-throw:
    // Could fallback to Supabase appointments or hardcoded if GCal fails
    // For now, throwing error to indicate GCal issue.
    throw new Error('Failed to fetch availability from Google Calendar. ' + error.message);
  }

  // Define working window for the day
  const dayStart = setMinutes(setHours(selectedDate, STYLIST_WORKING_HOURS.start.hour), STYLIST_WORKING_HOURS.start.minute);
  const dayEnd = setMinutes(setHours(selectedDate, STYLIST_WORKING_HOURS.end.hour), STYLIST_WORKING_HOURS.end.minute);
  const breakStart = setMinutes(setHours(selectedDate, STYLIST_WORKING_HOURS.breakStart.hour), STYLIST_WORKING_HOURS.breakStart.minute);
  const breakEnd = setMinutes(setHours(selectedDate, STYLIST_WORKING_HOURS.breakEnd.hour), STYLIST_WORKING_HOURS.breakEnd.minute);

  // Add break to busy intervals
  busyIntervals.push({ start: breakStart, end: breakEnd });
  // Sort all busy intervals
  busyIntervals.sort((a, b) => a.start.getTime() - b.start.getTime());

  // Merge overlapping/adjacent busy intervals
  const mergedBusyIntervals: CalendarEvent[] = [];
  if (busyIntervals.length > 0) {
    mergedBusyIntervals.push({ ...busyIntervals[0] });
    for (let i = 1; i < busyIntervals.length; i++) {
      const lastMerged = mergedBusyIntervals[mergedBusyIntervals.length - 1];
      const currentBusy = busyIntervals[i];
      if (isBefore(currentBusy.start, lastMerged.end) || isEqual(currentBusy.start, lastMerged.end)) {
        lastMerged.end = max([lastMerged.end, currentBusy.end]);
      } else {
        mergedBusyIntervals.push({ ...currentBusy });
      }
    }
  }

  const availableSlots: string[] = [];
  let currentPointer = dayStart;

  // Iterate through gaps between merged busy intervals
  for (const busySlot of mergedBusyIntervals) {
    const freeWindowEnd = min([busySlot.start, dayEnd]);
    if (isBefore(currentPointer, freeWindowEnd)) {
      // Found a free window before this busy slot
      generateSlotsInWindow(currentPointer, freeWindowEnd, hairstyleDuration, availableSlots);
    }
    currentPointer = max([currentPointer, busySlot.end]);
  }

  // Check for free window after the last busy slot until dayEnd
  if (isBefore(currentPointer, dayEnd)) {
    generateSlotsInWindow(currentPointer, dayEnd, hairstyleDuration, availableSlots);
  }
  
  return availableSlots;
}

function generateSlotsInWindow(windowStart: Date, windowEnd: Date, duration: number, slotsArray: string[]) {
  let slotStart = windowStart;
  while (true) {
    const slotEnd = addMinutes(slotStart, duration);
    if (isBefore(slotEnd, windowEnd) || isEqual(slotEnd, windowEnd)) {
      slotsArray.push(format(slotStart, "HH:mm"));
      slotStart = addMinutes(slotStart, SLOT_INTERVAL); // Next potential slot
    } else {
      break; // Slot doesn't fit
    }
  }
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