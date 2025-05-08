import { NextResponse } from "next/server"
import { getCalendarSettings } from "@/lib/google-calendar"

export async function GET() {
  try {
    const settings = await getCalendarSettings()

    return NextResponse.json({
      connected: true,
      settings,
    })
  } catch (error) {
    console.error("Error checking Google Calendar status:", error)
    return NextResponse.json(
      {
        connected: false,
        error: "Failed to check Google Calendar status",
      },
      { status: 500 },
    )
  }
}
