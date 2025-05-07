import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { isAdmin } from "@/app/actions/auth"

export async function POST(request: Request) {
  try {
    // Check if the user is an admin
    const isUserAdmin = await isAdmin()

    if (!isUserAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const settings = await request.json()
    const supabase = createServerSupabaseClient()

    // Check if settings already exist
    const { data: existingSettings } = await supabase
      .from("settings")
      .select("*")
      .eq("key", "google_calendar_settings")
      .single()

    if (existingSettings) {
      // Update existing settings
      await supabase
        .from("settings")
        .update({
          value: settings,
          updated_at: new Date().toISOString(),
        })
        .eq("key", "google_calendar_settings")
    } else {
      // Create new settings
      await supabase.from("settings").insert([
        {
          key: "google_calendar_settings",
          value: settings,
        },
      ])
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in Google Calendar settings route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
