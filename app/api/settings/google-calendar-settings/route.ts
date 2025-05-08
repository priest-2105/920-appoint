import { NextResponse } from "next/server"
import { updateCalendarSettings } from "@/lib/google-calendar"
import { isAdmin } from "@/app/actions/auth"

export async function POST(request: Request) {
  try {
    // Check if the user is an admin
    const isUserAdmin = await isAdmin()

    if (!isUserAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const settings = await updateCalendarSettings(body)

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Error updating Google Calendar settings:", error)
    return NextResponse.json(
      { error: "Failed to update Google Calendar settings" },
      { status: 500 },
    )
  }
}
