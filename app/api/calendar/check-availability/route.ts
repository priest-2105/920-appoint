import { NextResponse } from "next/server"
import { checkAvailability } from "@/lib/google-calendar"

export async function POST(request: Request) {
  try {
    const { startTime, endTime } = await request.json()

    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: "Start time and end time are required" },
        { status: 400 }
      )
    }

    const isAvailable = await checkAvailability(startTime, endTime)
    return NextResponse.json({ isAvailable })
  } catch (error) {
    console.error("Error checking availability:", error)
    return NextResponse.json(
      { error: "Failed to check availability" },
      { status: 500 }
    )
  }
} 