import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { isAdmin } from "@/app/actions/auth"

export async function POST() {
  try {
    // Check if the user is an admin
    const isUserAdmin = await isAdmin()

    if (!isUserAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()

    // Delete Google Calendar credentials
    await supabase.from("settings").delete().eq("key", "google_calendar_credentials")

    // Update Google Calendar settings to disable all features
    const { data: existingSettings } = await supabase
      .from("settings")
      .select("*")
      .eq("key", "google_calendar_settings")
      .single()

    if (existingSettings) {
      await supabase
        .from("settings")
        .update({
          value: {
            enabled: false,
            checkAvailability: false,
            addEvents: false,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("key", "google_calendar_settings")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in Google Calendar disconnect route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
