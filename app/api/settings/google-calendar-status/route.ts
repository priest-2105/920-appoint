import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { isAdmin } from "@/app/actions/auth"

export async function GET() {
  try {
    // Check if the user is an admin
    const isUserAdmin = await isAdmin()

    if (!isUserAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()

    // Get Google Calendar credentials
    const { data: credentialsData, error: credentialsError } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "google_calendar_credentials")
      .single()

    if (credentialsError && credentialsError.code !== "PGRST116") {
      throw credentialsError
    }

    // Get Google Calendar settings
    const { data: settingsData, error: settingsError } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "google_calendar_settings")
      .single()

    if (settingsError && settingsError.code !== "PGRST116") {
      throw settingsError
    }

    return NextResponse.json({
      connected: !!credentialsData,
      settings: settingsData?.value || null,
    })
  } catch (error) {
    console.error("Error in Google Calendar status route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
