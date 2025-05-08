import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { updateCalendarSettings } from "@/lib/google-calendar"

export async function POST(request: Request) {
  try {
    // Create Supabase client
    const supabase = createServerSupabaseClient()

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get settings from request body
    const settings = await request.json()

    // Update settings
    const updatedSettings = await updateCalendarSettings(settings)

    return NextResponse.json(updatedSettings)
  } catch (error) {
    console.error("Error updating Google Calendar settings:", error)
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Create Supabase client
    const supabase = createServerSupabaseClient()

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Force update settings to enabled values
    const enabledSettings = {
      enabled: true,
      checkAvailability: true,
      addEvents: true,
    }

    // First try to update existing settings
    const { data: updatedSettings, error: updateError } = await supabase
      .from("settings")
      .update({ value: enabledSettings })
      .eq("key", "google_calendar_settings")
      .select()
      .single()

    if (updateError) {
      // If update fails (no existing record), insert new settings
      const { data: newSettings, error: insertError } = await supabase
        .from("settings")
        .insert([
          {
            key: "google_calendar_settings",
            value: enabledSettings,
          },
        ])
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      console.log("Created new settings with enabled values:", newSettings)
      return NextResponse.json(newSettings.value)
    }

    console.log("Updated existing settings to enabled values:", updatedSettings)
    return NextResponse.json(updatedSettings.value)
  } catch (error) {
    console.error("Error updating Google Calendar settings:", error)
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    )
  }
}
